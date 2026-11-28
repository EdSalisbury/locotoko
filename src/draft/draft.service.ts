import type { PrismaService } from "../prisma/prisma.service";
import type { AnthropicService } from "../anthropic/anthropic.service";
import type { EbayCategoryService } from "../ebay-category/ebay-category.service";
import type { EbayConditionService } from "../ebay-condition/ebay-condition.service";
import type { EbaySpecificsService } from "../ebay-specifics/ebay-specifics.service";
import type { CategoryDetailsSource, IdentifyService } from "./identify.service";
import {
  Aspect,
  Condition,
  UNGRADED_CONDITION_ID,
  buildCategoryChoices,
  generationPrompt,
  mergeSpecifics,
  pickTemplate,
  templateFields,
} from "./identify";
import { PhotoError, UploadedPhoto, storeUploadedPhotos, toClaudePhoto } from "./photos";

export type DraftStatus = "identifying" | "ready" | "failed";

// A request Locotoko can't take (the controller answers 400), and a draft
// that doesn't exist (404). Plain errors: this class stays free of NestJS so
// it can be unit tested; DraftModule provides it.
export class DraftInputError extends Error {}
export class DraftNotFoundError extends Error {}

// A draft made from photos needs a category before it has one; this stands in
// (eBay's tree root is category 0, which isn't a listable category).
export const NO_CATEGORY_ID = 0;

const draftStatusFields = {
  id: true,
  title: true,
  lucidaItemNumber: true,
  identifyStatus: true,
  identifyError: true,
  createdAt: true,
};

export class DraftService {
  // One identification at a time, in the order the drafts came in.
  private queue: Promise<void> = Promise.resolve();

  constructor(
    private prisma: PrismaService,
    private anthropic: Pick<AnthropicService, "generateListing">,
    private identifier: IdentifyService,
    private categories: Pick<EbayCategoryService, "getCategories">,
    private conditions: Pick<EbayConditionService, "getConditions">,
    private specifics: Pick<EbaySpecificsService, "getSpecifics">,
  ) {}

  // Drafts that were still being identified when Locotoko stopped carry on
  // (called once Locotoko has started).
  async resumeUnfinished() {
    try {
      const unfinished = await this.prisma.item.findMany({
        where: { identifyStatus: "identifying" },
        select: { id: true },
        orderBy: { createdAt: "asc" },
      });
      for (const draft of unfinished) {
        this.enqueue(draft.id);
      }
      if (unfinished.length) {
        console.log(`Resuming ${unfinished.length} draft(s) still being identified`);
      }
    } catch (e) {
      console.error(`Couldn't check for drafts still being identified: ${e}`);
    }
  }

  async createDraft(userId: string, files: UploadedPhoto[] | undefined, lucidaItemNumber: unknown) {
    const number = this.checkItemNumber(lucidaItemNumber);
    const images = await this.storePhotos(files);

    const owner =
      (await this.prisma.owner.findFirst({ where: { name: "The Hoard" } })) ??
      (await this.prisma.owner.findFirst({ orderBy: { name: "asc" } }));
    if (!owner) {
      throw new DraftInputError("Locotoko has no owners yet; add one first");
    }
    await this.ensureNoCategoryRow();

    const draft = await this.prisma.item.create({
      data: {
        title: "",
        price: "0.00",
        quantity: 1,
        ebayCategoryId: NO_CATEGORY_ID,
        listingUserId: userId,
        ownerId: owner.id,
        images,
        specifics: "[]",
        lucidaItemNumber: number,
        identifyStatus: "identifying",
      },
      select: draftStatusFields,
    });
    this.enqueue(draft.id);
    return draft;
  }

  // Replaces a draft's photos only, never its fields.
  async replacePhotos(id: string, files: UploadedPhoto[] | undefined) {
    const existing = await this.prisma.item.findUnique({ where: { id }, select: { lucidaItemNumber: true } });
    if (!existing?.lucidaItemNumber) {
      throw new DraftNotFoundError("No such draft");
    }
    const images = await this.storePhotos(files);
    return this.prisma.item.update({ where: { id }, data: { images }, select: draftStatusFields });
  }

  async getDraft(id: string) {
    const draft = await this.prisma.item.findUnique({ where: { id }, select: draftStatusFields });
    if (!draft) {
      throw new DraftNotFoundError("No such draft");
    }
    return draft;
  }

  // The newest draft for a Lucida item number, if one was sent.
  async findByLucidaItemNumber(lucidaItemNumber: unknown) {
    const number = this.checkItemNumber(lucidaItemNumber);
    const draft = await this.prisma.item.findFirst({
      where: { lucidaItemNumber: number },
      orderBy: { createdAt: "desc" },
      select: draftStatusFields,
    });
    if (!draft) {
      throw new DraftNotFoundError("No draft for that Lucida item");
    }
    return draft;
  }

  // Waits for everything queued so far (tests).
  idle(): Promise<void> {
    return this.queue;
  }

  private enqueue(id: string) {
    this.queue = this.queue.then(() => this.identify(id)).catch(() => undefined);
  }

  private checkItemNumber(value: unknown): string {
    const number = typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
    if (!number) {
      throw new DraftInputError("Lucida's item number is missing");
    }
    if (number.length > 100) {
      throw new DraftInputError("Lucida's item number is too long");
    }
    return number;
  }

  private async storePhotos(files: UploadedPhoto[] | undefined) {
    try {
      return await storeUploadedPhotos(files);
    } catch (e) {
      if (e instanceof PhotoError) {
        throw new DraftInputError(e.message);
      }
      throw e;
    }
  }

  private async ensureNoCategoryRow() {
    await this.prisma.ebayCategory.upsert({
      where: { id: NO_CATEGORY_ID },
      update: {},
      create: { id: NO_CATEGORY_ID, name: "Root", parentId: NO_CATEGORY_ID, leaf: false, level: 0 },
    });
  }

  private categoryDetails(): CategoryDetailsSource {
    return {
      conditions: async (categoryId) => JSON.parse((await this.conditions.getConditions(categoryId)) || "[]") as Condition[],
      aspects: async (categoryId) => JSON.parse((await this.specifics.getSpecifics(categoryId)) || "[]") as Aspect[],
    };
  }

  // Identifies one draft and fills it in. Whatever went wrong is kept on the
  // draft in plain words; its photos stay either way.
  async identify(id: string) {
    const draft = await this.prisma.item.findUnique({ where: { id } });
    if (!draft || draft.identifyStatus !== "identifying") {
      return;
    }

    let step = "Reading the photos";
    try {
      const photos = await Promise.all(draft.images.map(toClaudePhoto));
      if (photos.length === 0) {
        throw new Error("the draft has no photos");
      }

      step = "Looking up Locotoko's categories";
      const [categories, templates, usage] = await Promise.all([
        this.categories.getCategories(),
        this.prisma.template.findMany(),
        this.prisma.item.groupBy({ by: ["ebayCategoryId"], _count: { _all: true } }),
      ]);
      const choices = buildCategoryChoices(
        categories,
        templates,
        usage.map((row) => ({ ebayCategoryId: row.ebayCategoryId, count: row._count._all })),
      );

      step = "Identifying the item with Claude";
      const { identification, aspects } = await this.identifier.identify(photos, choices, this.categoryDetails());

      const template = pickTemplate(templates, identification.categoryId, identification.templateName);
      const specifics = mergeSpecifics(template, aspects, identification.specifics);
      const notes = [...identification.readings, ...identification.notes];

      const fields = {
        ...templateFields(template),
        ...(identification.categoryId !== null ? { ebayCategoryId: identification.categoryId } : {}),
        ebayConditionId: identification.conditionId ?? 0,
        ebayCardConditionValueId:
          identification.conditionId === UNGRADED_CONDITION_ID ? identification.cardConditionId : null,
        specifics: JSON.stringify(specifics),
        upc: identification.upc,
        identifyNotes: notes.length ? notes.join("\n") : null,
        title: identification.item.slice(0, 80),
      };
      // Save what's known before writing the title, so a failure there keeps it.
      await this.prisma.item.update({ where: { id }, data: fields });

      step = "Writing the title and description";
      const generated = await this.anthropic.generateListing(generationPrompt(identification), specifics);
      await this.prisma.item.update({
        where: { id },
        data: {
          title: (generated?.title || fields.title || "").trim(),
          description: generated?.description || null,
          identifyStatus: "ready",
          identifyError: null,
        },
      });
    } catch (e) {
      const reason = e instanceof Error ? e.message : String(e);
      console.error(`Identifying draft ${id} failed (${step}): ${reason}`);
      await this.prisma.item
        .update({
          where: { id },
          data: { identifyStatus: "failed", identifyError: `${step} failed: ${reason}`.slice(0, 1000) },
        })
        .catch(() => undefined);
    }
  }
}

import { DraftInputError, DraftNotFoundError, DraftService } from "./draft.service";
import { IdentifyService } from "./identify.service";
import {
  claudeLp,
  demoCategories,
  demoOwners,
  demoPhoto,
  demoTemplates,
  recordsAspects,
  recordsConditions,
} from "./__fixtures__/demo-shop";
import { draftAnswer } from "./draft-answer";

// A small in-memory stand-in for the parts of Prisma the drafts use, holding
// the demo shop. Nothing here touches a database, eBay or Claude.
function fakePrisma(owners = demoOwners) {
  const items: any[] = [];
  const categories = new Map(demoCategories.map((category) => [category.id, { ...category }]));
  let next = 1;
  const pick = (row: any, select?: Record<string, boolean>) => {
    if (!row || !select) return row ? { ...row } : row;
    return Object.fromEntries(Object.keys(select).map((key) => [key, row[key]]));
  };
  const matches = (row: any, where: any = {}) => Object.entries(where).every(([key, value]) => row[key] === value);
  const newest = (rows: any[], orderBy: any) =>
    orderBy?.createdAt === "desc" ? [...rows].sort((a, b) => b.createdAt - a.createdAt) : rows;
  return {
    items,
    categories,
    item: {
      create: async ({ data, select }) => {
        const row = { id: `draft-${next++}`, createdAt: new Date(Date.now() + next), description: null, upc: null, identifyNotes: null, identifyError: null, ...data };
        items.push(row);
        return pick(row, select);
      },
      findUnique: async ({ where, select }) => pick(items.find((row) => row.id === where.id), select),
      findFirst: async ({ where, orderBy, select }) => pick(newest(items.filter((row) => matches(row, where)), orderBy)[0], select),
      findMany: async ({ where, select }) => items.filter((row) => matches(row, where)).map((row) => pick(row, select)),
      update: async ({ where, data, select }) => {
        const row = items.find((candidate) => candidate.id === where.id);
        if (!row) throw new Error("no such item");
        Object.assign(row, data);
        return pick(row, select);
      },
      groupBy: async () => {
        const counts = new Map<number, number>();
        for (const row of items) counts.set(row.ebayCategoryId, (counts.get(row.ebayCategoryId) ?? 0) + 1);
        return [...counts.entries()].map(([ebayCategoryId, count]) => ({ ebayCategoryId, _count: { _all: count } }));
      },
    },
    owner: {
      findFirst: async ({ where }: any = {}) => owners.find((owner) => !where || owner.name === where.name) ?? null,
    },
    ebayCategory: {
      upsert: async ({ where, create }) => {
        if (!categories.has(where.id)) categories.set(where.id, create);
        return categories.get(where.id);
      },
    },
    template: { findMany: async () => demoTemplates },
  };
}

function setup(options: { claude?: any[]; generate?: () => Promise<any>; owners?: any[] } = {}) {
  const prisma = fakePrisma(options.owners);
  const claudeAnswers = [...(options.claude ?? [claudeLp.chooseCategory, claudeLp.submitItem])];
  const anthropic = {
    createMessage: jest.fn(async () => {
      const answer = claudeAnswers.shift();
      if (!answer) throw new Error("no more recorded answers");
      return answer;
    }),
    generateListing: jest.fn(options.generate ?? (async () => claudeLp.generateListing)),
  };
  const categoryService = { getCategories: async () => demoCategories };
  const conditions = { getConditions: jest.fn(async () => JSON.stringify(recordsConditions)) };
  const specifics = { getSpecifics: jest.fn(async () => JSON.stringify(recordsAspects)) };
  const service = new DraftService(
    prisma as any,
    anthropic as any,
    new IdentifyService(anthropic as any),
    categoryService as any,
    conditions as any,
    specifics as any,
  );
  return { service, prisma, anthropic };
}

const lpPhotos = () => [
  { buffer: demoPhoto("demo-item-01_01.jpg"), originalname: "IMG_0001.jpg" },
  { buffer: demoPhoto("demo-item-01_02.jpg"), originalname: "IMG_0002.jpg" },
];

describe("drafts from photos", () => {
  it("makes the draft at once with its photos, then fills it in from Claude's answers", async () => {
    const { service, prisma, anthropic } = setup();

    const draft = await service.createDraft("riley", lpPhotos(), "L-1042");
    expect(draft.identifyStatus).toBe("identifying");
    const stored = prisma.items[0];
    expect(stored.images).toHaveLength(2);
    expect(stored.images[0]).toMatch(/^data:image\/jpeg;base64,/);
    expect(stored.lucidaItemNumber).toBe("L-1042");
    expect(stored.ownerId).toBe("demo-owner-house"); // no "The Hoard" in the demo shop: the first owner
    expect(stored.price).toBe("0.00");
    expect(stored.acquisitionId).toBeUndefined();

    await service.idle();

    const item = prisma.items[0];
    expect(item.identifyStatus).toBe("ready");
    expect(item.identifyError).toBeNull();
    expect(item.ebayCategoryId).toBe(176985);
    expect(item.ebayConditionId).toBe(3000);
    expect(item.upc).toBe("036000291452");
    expect(item.title).toBe(claudeLp.generateListing.title);
    expect(item.description).toBe(claudeLp.generateListing.description);
    // The Vinyl LP template's fields, as Add Item would fill them.
    expect(item.templateId).toBe("demo-tpl-lp");
    expect(item.location).toBe("Shelf R");
    expect(item.shipWeightPounds).toBe(1);
    expect(item.shipSizeWidthInches).toBe(14);
    // Specifics: the template's, filled with what Claude read off the item;
    // the title generator's own specifics aren't taken.
    expect(JSON.parse(item.specifics)).toEqual([
      { key: "Format", value: "Record" },
      { key: "Record Size", value: '12"' },
      { key: "Speed", value: "33 RPM" },
      { key: "Artist", value: "The Velvet Tides" },
      { key: "Release Title", value: "Midnight Harbor" },
      { key: "Release Year", value: "1976" },
      { key: "Genre", value: "Rock" },
    ]);
    expect(item.identifyNotes.split("\n")).toEqual([
      "Catalog number VT-1976 on the spine",
      "Small seam split at the top of the sleeve",
      "Pressing Plant: Harbor Sound",
    ]);
    // Never a price.
    expect(item.price).toBe("0.00");

    // One conversation: both turns carry the photos, sent once each as images.
    expect(anthropic.createMessage).toHaveBeenCalledTimes(2);
    const firstCall = (anthropic.createMessage.mock.calls[0] as any[])[0];
    const images = firstCall.messages[0].content.filter((block) => block.type === "image");
    expect(images).toHaveLength(2);
    expect(firstCall.messages[0].content.at(-1).text).toContain("176985: Music > Records (templates: Vinyl LP)");
  });

  it("uses the owner named The Hoard when there is one", async () => {
    const owners = [...demoOwners, { id: "hoard", name: "The Hoard", rate: "0" }];
    const { service, prisma } = setup({ owners });
    await service.createDraft("riley", lpPhotos(), "L-1");
    expect(prisma.items[0].ownerId).toBe("hoard");
    await service.idle();
  });

  it("keeps the photos and the reason when identifying fails", async () => {
    const { service, prisma } = setup({ claude: [] });
    const draft = await service.createDraft("riley", lpPhotos(), "L-2");
    await service.idle();
    const item = prisma.items[0];
    expect(item.identifyStatus).toBe("failed");
    expect(item.identifyError).toBe("Identifying the item with Claude failed: no more recorded answers");
    expect(item.images).toHaveLength(2);
    expect(draftAnswer({ ...item, id: draft.id }, "https://store.example").error).toBe(item.identifyError);
  });

  it("keeps what was identified when only the title and description fail", async () => {
    const { service, prisma } = setup({
      generate: async () => {
        throw new Error("Failed to parse Claude response");
      },
    });
    await service.createDraft("riley", lpPhotos(), "L-3");
    await service.idle();
    const item = prisma.items[0];
    expect(item.identifyStatus).toBe("failed");
    expect(item.identifyError).toBe("Writing the title and description failed: Failed to parse Claude response");
    expect(item.ebayCategoryId).toBe(176985);
    expect(item.title).toBe("The Velvet Tides - Midnight Harbor, 12-inch vinyl LP, 1976 original pressing");
  });

  it("refuses no photos, too many, a non-image and a missing item number", async () => {
    const { service, prisma } = setup();
    await expect(service.createDraft("riley", [], "L-4")).rejects.toThrow("No photos were sent");
    const thirteen = Array.from({ length: 13 }, () => lpPhotos()[0]);
    await expect(service.createDraft("riley", thirteen, "L-4")).rejects.toThrow("Too many photos (13)");
    await expect(
      service.createDraft("riley", [{ buffer: Buffer.from("not a photo"), originalname: "notes.txt" }], "L-4"),
    ).rejects.toThrow("notes.txt isn't an image");
    await expect(service.createDraft("riley", lpPhotos(), "  ")).rejects.toBeInstanceOf(DraftInputError);
    expect(prisma.items).toHaveLength(0);
  });

  it("finds the newest draft for a Lucida item number", async () => {
    const { service } = setup({
      claude: [claudeLp.chooseCategory, claudeLp.submitItem, claudeLp.chooseCategory, claudeLp.submitItem],
    });
    await service.createDraft("riley", lpPhotos(), "L-5");
    const second = await service.createDraft("riley", lpPhotos(), "L-5");
    await service.idle();
    expect((await service.findByLucidaItemNumber("L-5")).id).toBe(second.id);
    await expect(service.findByLucidaItemNumber("L-6")).rejects.toBeInstanceOf(DraftNotFoundError);
  });

  it("replaces a draft's photos and nothing else", async () => {
    const { service, prisma } = setup();
    const draft = await service.createDraft("riley", lpPhotos(), "L-7");
    await service.idle();
    const before = { ...prisma.items[0] };
    await service.replacePhotos(draft.id, [lpPhotos()[1]]);
    const after = prisma.items[0];
    expect(after.images).toHaveLength(1);
    expect(after.images[0]).not.toEqual(before.images[0]);
    expect({ ...after, images: undefined }).toEqual({ ...before, images: undefined });
    await expect(service.replacePhotos("nope", lpPhotos())).rejects.toBeInstanceOf(DraftNotFoundError);
  });

  it("carries on with drafts still identifying after a restart", async () => {
    const { service, prisma } = setup();
    await service.createDraft("riley", lpPhotos(), "L-8");
    // As if Locotoko stopped before identifying it: a fresh service finds it.
    const restarted = new DraftService(
      prisma as any,
      { generateListing: async () => claudeLp.generateListing } as any,
      new IdentifyService({ createMessage: jest.fn().mockResolvedValueOnce(claudeLp.chooseCategory).mockResolvedValueOnce(claudeLp.submitItem) } as any),
      { getCategories: async () => demoCategories } as any,
      { getConditions: async () => JSON.stringify(recordsConditions) } as any,
      { getSpecifics: async () => JSON.stringify(recordsAspects) } as any,
    );
    await service.idle(); // the first one finishes it...
    prisma.items[0].identifyStatus = "identifying"; // ...so put it back as if it hadn't
    await restarted.resumeUnfinished();
    await restarted.idle();
    expect(prisma.items[0].identifyStatus).toBe("ready");
  });

  it("answers Lucida with the status and the edit page's address", () => {
    const answer = draftAnswer(
      {
        id: "abc",
        title: "",
        lucidaItemNumber: "L-9",
        identifyStatus: "identifying",
        identifyError: null,
        createdAt: new Date(0),
      },
      "https://store.example",
    );
    expect(answer).toMatchObject({ status: "identifying", error: null, editUrl: "https://store.example/editItem/abc" });
    expect(draftAnswer({ ...answer, identifyStatus: null, identifyError: null } as any, "x").status).toBe("ready");
  });
});

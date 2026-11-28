import type Anthropic from "@anthropic-ai/sdk";
import type { AnthropicService } from "../anthropic/anthropic.service";
import {
  Aspect,
  CategoryChoice,
  Condition,
  Identification,
  RawIdentification,
  describeCategoryChoices,
  describeCategoryDetails,
  parseIdentification,
} from "./identify";

// Looks up a category's conditions and item specifics (eBay), so the
// conversation can be tested with recorded answers and no eBay.
export interface CategoryDetailsSource {
  conditions(categoryId: number): Promise<Condition[]>;
  aspects(categoryId: number): Promise<Aspect[]>;
}

export interface IdentifyResult {
  identification: Identification;
  aspects: Aspect[];
}

const MAX_TURNS = 4;

const SYSTEM_PROMPT = `You identify items for an eBay store's listings from photos of one item (front, back, labels, close-ups).

Work it out from all the photos together, then:
1. Call choose_category with the category from the store's list that fits best (or null if none fits). You'll get that category's conditions and item specifics.
2. Call submit_item with what you found.

Rules:
- Fill in only what you can read in the photos or know for certain from what you read. Leave anything you'd be guessing out: a blank field is better than a wrong one.
- Never suggest a price.
- UPC: only a barcode number you can actually read in a photo, digit for digit. If none is legible, leave it null.
- Condition: pick from the category's conditions only if the photos show it plainly (sealed, a visibly used copy); otherwise null.
- Item specifics: use the category's names exactly; for ones with allowed values, use one of those values.
- Anything useful you read but couldn't place (an edition note, a printing, a defect, a serial number) goes in unplaced, as short plain phrases.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "choose_category",
    description:
      "Pick the store category the item belongs in, from the list given. Returns that category's conditions and item specifics.",
    input_schema: {
      type: "object",
      properties: {
        categoryId: {
          type: ["integer", "null"],
          description: "The category's number from the list, or null if none fits.",
        },
      },
      required: ["categoryId"],
    },
  },
  {
    name: "submit_item",
    description: "Submit what the item is and every field you could fill in. Call this once, last.",
    input_schema: {
      type: "object",
      properties: {
        item: {
          type: "string",
          description: "What the item is, in one plain sentence (e.g. 'Halo 3 for Xbox 360, complete in case with manual').",
        },
        categoryId: { type: ["integer", "null"] },
        templateName: {
          type: ["string", "null"],
          description: "If the category has several templates, the one that fits; else null.",
        },
        conditionId: { type: ["integer", "null"] },
        cardConditionId: {
          type: ["integer", "null"],
          description: "Only for condition 4000 (Ungraded cards): one of the card conditions, if plain from the photos.",
        },
        specifics: {
          type: "array",
          items: {
            type: "object",
            properties: { key: { type: "string" }, value: { type: "string" } },
            required: ["key", "value"],
          },
        },
        upc: { type: ["string", "null"] },
        unplaced: { type: "array", items: { type: "string" } },
      },
      required: ["item", "categoryId", "conditionId", "specifics", "upc", "unplaced"],
    },
  },
];

// Plain class (no NestJS, so it can be unit tested); DraftModule provides it.
export class IdentifyService {
  constructor(private anthropic: Pick<AnthropicService, "createMessage">) {}

  // One conversation with all the photos: Claude picks a category, gets its
  // conditions and item specifics, then submits the item.
  async identify(
    photos: string[],
    choices: CategoryChoice[],
    details: CategoryDetailsSource,
  ): Promise<IdentifyResult> {
    const categoryIds = new Set(choices.map((choice) => choice.id));

    const imageBlocks: Anthropic.ImageBlockParam[] = photos.map((data) => ({
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data },
    }));
    // Cache the photos: the follow-up turn sends them again.
    if (imageBlocks.length) {
      (imageBlocks[imageBlocks.length - 1] as any).cache_control = { type: "ephemeral" };
    }

    const messages: Anthropic.MessageParam[] = [
      {
        role: "user",
        content: [
          ...imageBlocks,
          {
            type: "text",
            text:
              `These ${photos.length} photo(s) are all of one item. The store's categories (number: path):\n\n` +
              describeCategoryChoices(choices),
          },
        ],
      },
    ];

    let conditions: Condition[] = [];
    let aspects: Aspect[] = [];
    let chosenCategory: number | null = null;

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const response = await this.anthropic.createMessage({
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        tool_choice: { type: "any" },
        messages,
      });

      const toolUse = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );
      if (!toolUse) {
        throw new Error("Claude didn't answer with the item");
      }

      if (toolUse.name === "submit_item") {
        const raw = (toolUse.input ?? {}) as RawIdentification;
        // A category it didn't look up first gets its details now, so the
        // answer can still be checked against them.
        const submitted = typeof raw.categoryId === "number" ? raw.categoryId : null;
        if (submitted !== null && submitted !== chosenCategory && categoryIds.has(submitted)) {
          ({ conditions, aspects } = await this.lookUp(details, submitted));
        }
        const identification = parseIdentification(raw, { categoryIds, conditions, aspects });
        return { identification, aspects: identification.categoryId === null ? [] : aspects };
      }

      // choose_category
      const requested = (toolUse.input as { categoryId?: unknown })?.categoryId;
      let result: unknown;
      if (typeof requested === "number" && categoryIds.has(requested)) {
        chosenCategory = requested;
        ({ conditions, aspects } = await this.lookUp(details, requested));
        result = describeCategoryDetails(conditions, aspects);
      } else if (requested === null || requested === undefined) {
        chosenCategory = null;
        conditions = [];
        aspects = [];
        result = { note: "No category: submit with categoryId and conditionId null, and no specifics." };
      } else {
        result = { error: `${requested} isn't in the list; choose one of the listed numbers, or null.` };
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [{ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result) }],
      });
    }
    throw new Error("Claude didn't finish identifying the item");
  }

  private async lookUp(details: CategoryDetailsSource, categoryId: number) {
    const [conditions, aspects] = await Promise.all([
      details.conditions(categoryId).catch(() => [] as Condition[]),
      details.aspects(categoryId).catch(() => [] as Aspect[]),
    ]);
    return { conditions, aspects };
  }
}

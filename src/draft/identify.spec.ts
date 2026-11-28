import {
  buildCategoryChoices,
  describeCategoryChoices,
  describeCategoryDetails,
  generationPrompt,
  mergeSpecifics,
  parseIdentification,
  pickTemplate,
  shippingPriceFor,
  templateFields,
} from "./identify";
import { demoCategories, demoTemplates, recordsAspects, recordsConditions } from "./__fixtures__/demo-shop";

describe("Locotoko's own categories for Claude", () => {
  it("lists the categories templates and items use, with full paths, templates first", () => {
    const choices = buildCategoryChoices(demoCategories, demoTemplates, [
      { ebayCategoryId: 176984, count: 7 }, // CDs: used by items, no template
      { ebayCategoryId: 176985, count: 2 },
    ]);
    const ids = choices.map((choice) => choice.id);
    expect(ids).toEqual(expect.arrayContaining([176985, 139973, 617, 261186, 183454, 176984]));
    expect(ids[ids.length - 1]).toBe(176984); // no template, so after the templated ones
    expect(choices.find((choice) => choice.id === 617)).toEqual({
      id: 617,
      path: "Movies & TV > DVDs & Blu-ray Discs",
      templates: ["DVD"],
    });
    expect(describeCategoryChoices(choices)).toContain("176985: Music > Records (templates: Vinyl LP)");
  });

  it("leaves out category 0 and categories Locotoko doesn't know", () => {
    const choices = buildCategoryChoices(demoCategories, [], [
      { ebayCategoryId: 0, count: 5 },
      { ebayCategoryId: 999999, count: 5 },
      { ebayCategoryId: 617, count: 1 },
    ]);
    expect(choices.map((choice) => choice.id)).toEqual([617]);
  });
});

describe("a category's details for Claude", () => {
  it("gives conditions and specifics, with allowed values where eBay limits them", () => {
    const details = describeCategoryDetails(recordsConditions, recordsAspects);
    expect(details.conditions).toEqual([
      { id: 1000, name: "Brand New" },
      { id: 3000, name: "Used" },
    ]);
    expect(details.cardConditions).toBeUndefined();
    expect(details.itemSpecifics.find((aspect) => aspect.name === "Format")).toEqual({
      name: "Format",
      required: true,
      allowedValues: ["Record"],
    });
  });

  it("offers the card conditions when the category has Ungraded (4000)", () => {
    const details = describeCategoryDetails([{ ID: "4000", DisplayName: "Ungraded" }], []);
    expect(details.cardConditions.map((card) => card.id)).toEqual([400010, 400015, 400016, 400017]);
  });
});

describe("checking Claude's answer", () => {
  const offered = { categoryIds: new Set([176985, 617]), conditions: recordsConditions, aspects: recordsAspects };

  it("keeps what fits and moves the rest to readings", () => {
    const result = parseIdentification(
      {
        item: "Midnight Harbor LP",
        categoryId: 176985,
        conditionId: 3000,
        specifics: [
          { key: "artist", value: "The Velvet Tides" },
          { key: "Pressing Plant", value: "Harbor Sound" },
          { key: "Genre", value: "" },
        ],
        upc: "036000291452",
        unplaced: ["Catalog number VT-1976"],
      },
      offered,
    );
    expect(result.categoryId).toBe(176985);
    expect(result.conditionId).toBe(3000);
    expect(result.specifics).toEqual([{ key: "Artist", value: "The Velvet Tides" }]);
    expect(result.upc).toBe("036000291452");
    expect(result.readings).toEqual(["Catalog number VT-1976", "Pressing Plant: Harbor Sound"]);
    expect(result.notes).toEqual([]);
  });

  it("blanks a category that wasn't offered, a condition the category lacks and a bad barcode", () => {
    const result = parseIdentification(
      { item: "x", categoryId: 12345, conditionId: 3000, specifics: [], upc: "036000291453", unplaced: [] },
      offered,
    );
    expect(result.categoryId).toBeNull();
    expect(result.conditionId).toBeNull();
    expect(result.upc).toBeNull();
    expect(result.notes).toHaveLength(2);

    const badCondition = parseIdentification({ categoryId: 176985, conditionId: 7000 }, offered);
    expect(badCondition.conditionId).toBeNull();
  });

  it("keeps a card condition only for Ungraded cards", () => {
    const cards = {
      categoryIds: new Set([183454]),
      conditions: [{ ID: "4000", DisplayName: "Ungraded" }],
      aspects: [],
    };
    expect(parseIdentification({ categoryId: 183454, conditionId: 4000, cardConditionId: 400015 }, cards).cardConditionId).toBe(
      400015,
    );
    expect(parseIdentification({ categoryId: 183454, conditionId: 4000, cardConditionId: 1 }, cards).cardConditionId).toBeNull();
  });
});

describe("filling the draft like Add Item", () => {
  it("picks the named template for the category, else the first", () => {
    const extra = { ...demoTemplates[0], id: "demo-tpl-lp-2", name: "Another LP" };
    const templates = [...demoTemplates, extra];
    expect(pickTemplate(templates, 176985, "Vinyl LP").id).toBe("demo-tpl-lp");
    expect(pickTemplate(templates, 176985, null).id).toBe("demo-tpl-lp-2"); // "Another LP" sorts first
    expect(pickTemplate(templates, 176984, null)).toBeUndefined();
    expect(pickTemplate(templates, null, "Vinyl LP")).toBeUndefined();
  });

  it("starts from the template's specifics and fills in what Claude read", () => {
    const template = pickTemplate(demoTemplates, 176985, null);
    const merged = mergeSpecifics(template, recordsAspects, [
      { key: "Artist", value: "The Velvet Tides" },
      { key: "Speed", value: "45 RPM" },
    ]);
    expect(merged).toEqual([
      { key: "Format", value: "Record" },
      { key: "Record Size", value: '12"' },
      { key: "Speed", value: "45 RPM" },
      { key: "Artist", value: "The Velvet Tides" },
    ]);
  });

  it("without a template, lists the category's specifics, required first, blanks left blank", () => {
    const merged = mergeSpecifics(undefined, recordsAspects, [{ key: "Genre", value: "Rock" }]);
    expect(merged.slice(0, 3).map((entry) => entry.key)).toEqual(["Artist", "Release Title", "Format"]);
    expect(merged.find((entry) => entry.key === "Genre").value).toBe("Rock");
    expect(merged.find((entry) => entry.key === "Artist").value).toBe("");
  });

  it("copies the template's shipping, location and price like Add Item", () => {
    const fields = templateFields(pickTemplate(demoTemplates, 176985, null));
    expect(fields).toEqual({
      templateId: "demo-tpl-lp",
      shipWeightPounds: 1,
      shipWeightOunces: 4,
      shipSizeWidthInches: 14,
      shipSizeHeightInches: 14,
      shipSizeDepthInches: 2,
      location: "Shelf R",
      shippingType: 99,
      shippingPrice: shippingPriceFor(99, 1, { width: 14, height: 14, length: 2 }).toFixed(2),
    });
    expect(templateFields(undefined)).toEqual({});
  });

  it("prices shipping the way Add Item does", () => {
    expect(shippingPriceFor(1, 0, { width: 0, height: 0, length: 0 })).toBe(1);
    expect(shippingPriceFor(5, 0, { width: 0, height: 0, length: 0 })).toBe(19);
    expect(shippingPriceFor(0, 3, { width: 1, height: 1, length: 1 })).toBe(0);
    // 14x14x2 = 392 / 166 -> 3 lb dimensional; (5 + 2*3) * 0.8 = 8.8
    expect(shippingPriceFor(99, 1, { width: 14, height: 14, length: 2 })).toBe(8.8);
  });

  it("hands the title generation what Claude found, never Locotoko's remarks", () => {
    const prompt = generationPrompt({
      item: "Midnight Harbor LP",
      categoryId: 176985,
      templateName: null,
      conditionId: null,
      cardConditionId: null,
      specifics: [],
      upc: "036000291452",
      readings: ["Catalog number VT-1976"],
      notes: ["Claude suggested category 1"],
    });
    expect(prompt).toBe("Midnight Harbor LP\nUPC: 036000291452\nAlso read on the item: Catalog number VT-1976");
  });
});

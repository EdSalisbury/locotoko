// The parts of identifying a draft from photos that don't talk to Claude,
// eBay or the database, kept apart so they can be tested on their own.
import { normalizeGtin } from "./gtin";

export interface CategoryRow {
  id: number;
  name: string;
  parentId: number | null;
  level?: number;
}

export interface TemplateRow {
  id: string;
  name: string;
  ebayCategoryId: number;
  specifics?: string | null;
  shippingType?: number | null;
  shipWeightPounds?: number | null;
  shipWeightOunces?: number | null;
  shipSizeHeightInches?: number | null;
  shipSizeWidthInches?: number | null;
  shipSizeDepthInches?: number | null;
  location?: string | null;
  title?: string | null;
}

export interface CategoryChoice {
  id: number;
  path: string;
  templates: string[];
}

export interface Aspect {
  localizedAspectName: string;
  aspectConstraint?: {
    aspectRequired?: boolean;
    aspectMode?: string;
    itemToAspectCardinality?: string;
  };
  aspectValues?: { localizedValue: string }[];
}

export interface Condition {
  ID: string | number;
  DisplayName: string;
}

export interface Specific {
  key: string;
  value: string;
}

// The four card conditions Add Item offers for "Ungraded" (4000) cards; these
// are the values eBay actually accepts (see the eBay API note).
export const UNGRADED_CONDITION_ID = 4000;
export const CARD_CONDITIONS: { id: number; name: string }[] = [
  { id: 400010, name: "Mint/Unplayed" },
  { id: 400015, name: "Lightly Played" },
  { id: 400016, name: "Moderately Played" },
  { id: 400017, name: "Heavily Played" },
];

const MAX_CATEGORY_CHOICES = 500;
const MAX_SPECIFIC_LENGTH = 65; // eBay's limit for an item specific's value

export function categoryPath(categoryId: number, byId: Map<number, CategoryRow>): string {
  const names: string[] = [];
  const seen = new Set<number>();
  let current = byId.get(categoryId);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    names.unshift(current.name);
    if (current.parentId === null || current.parentId === current.id) {
      break;
    }
    current = byId.get(current.parentId);
  }
  return names.join(" > ");
}

// Locotoko's own categories: the ones its templates and items use, most used
// first (templates count as used). Not eBay's whole tree, which is far too
// big to hand Claude.
export function buildCategoryChoices(
  categories: CategoryRow[],
  templates: TemplateRow[],
  usage: { ebayCategoryId: number; count: number }[],
): CategoryChoice[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const counts = new Map<number, number>();
  for (const row of usage) {
    counts.set(row.ebayCategoryId, (counts.get(row.ebayCategoryId) ?? 0) + row.count);
  }
  const templatesByCategory = new Map<number, string[]>();
  for (const template of templates) {
    const names = templatesByCategory.get(template.ebayCategoryId) ?? [];
    names.push(template.name);
    templatesByCategory.set(template.ebayCategoryId, names);
    counts.set(template.ebayCategoryId, (counts.get(template.ebayCategoryId) ?? 0) + 1000000);
  }
  return [...counts.entries()]
    .filter(([id]) => id !== 0 && byId.has(id))
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .slice(0, MAX_CATEGORY_CHOICES)
    .map(([id]) => ({
      id,
      path: categoryPath(id, byId),
      templates: templatesByCategory.get(id) ?? [],
    }));
}

export function describeCategoryChoices(choices: CategoryChoice[]): string {
  return choices
    .map((choice) => {
      const templates = choice.templates.length ? ` (templates: ${choice.templates.join(", ")})` : "";
      return `${choice.id}: ${choice.path}${templates}`;
    })
    .join("\n");
}

// What Claude is told about a category once it picks one: its conditions and
// item specifics (eBay's aspects), with the allowed values where eBay limits
// them and a few examples otherwise.
export function describeCategoryDetails(conditions: Condition[], aspects: Aspect[]) {
  return {
    conditions: conditions.map((condition) => ({ id: Number(condition.ID), name: condition.DisplayName })),
    cardConditions:
      conditions.some((condition) => Number(condition.ID) === UNGRADED_CONDITION_ID) ? CARD_CONDITIONS : undefined,
    itemSpecifics: aspects.map((aspect) => {
      const selectionOnly = aspect.aspectConstraint?.aspectMode === "SELECTION_ONLY";
      const values = (aspect.aspectValues ?? []).map((value) => value.localizedValue);
      return {
        name: aspect.localizedAspectName,
        required: aspect.aspectConstraint?.aspectRequired === true,
        ...(selectionOnly ? { allowedValues: values.slice(0, 60) } : { examples: values.slice(0, 12) }),
      };
    }),
  };
}

export interface RawIdentification {
  item?: unknown;
  categoryId?: unknown;
  templateName?: unknown;
  conditionId?: unknown;
  cardConditionId?: unknown;
  specifics?: unknown;
  upc?: unknown;
  unplaced?: unknown;
}

export interface Identification {
  item: string;
  categoryId: number | null;
  templateName: string | null;
  conditionId: number | null;
  cardConditionId: number | null;
  specifics: Specific[];
  upc: string | null;
  // What Claude read but couldn't place (it goes into the description's
  // prompt and the draft's notes), and Locotoko's own remarks on the answer.
  readings: string[];
  notes: string[];
}

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function asInt(value: unknown): number | null {
  const number = typeof value === "string" ? Number(value.trim()) : value;
  return typeof number === "number" && Number.isInteger(number) ? number : null;
}

// Checks Claude's answer against what was actually offered: a category that
// wasn't in the list, a condition the category doesn't have or a barcode with
// a wrong check digit is left blank (and noted) rather than kept.
export function parseIdentification(
  raw: RawIdentification,
  offered: { categoryIds: Set<number>; conditions?: Condition[]; aspects?: Aspect[] },
): Identification {
  const notes: string[] = [];
  const readings = Array.isArray(raw.unplaced) ? raw.unplaced.map(asText).filter(Boolean) : [];

  let categoryId = asInt(raw.categoryId);
  if (categoryId !== null && !offered.categoryIds.has(categoryId)) {
    notes.push(`Claude suggested category ${categoryId}, which isn't one of Locotoko's; category left blank.`);
    categoryId = null;
  }

  let conditionId = categoryId === null ? null : asInt(raw.conditionId);
  if (conditionId !== null) {
    const allowed = (offered.conditions ?? []).map((condition) => Number(condition.ID));
    if (!allowed.includes(conditionId)) {
      conditionId = null;
    }
  }

  let cardConditionId = conditionId === UNGRADED_CONDITION_ID ? asInt(raw.cardConditionId) : null;
  if (cardConditionId !== null && !CARD_CONDITIONS.some((card) => card.id === cardConditionId)) {
    cardConditionId = null;
  }

  const aspectNames = new Map(
    (offered.aspects ?? []).map((aspect) => [aspect.localizedAspectName.toLowerCase(), aspect.localizedAspectName]),
  );
  const specifics: Specific[] = [];
  const seen = new Set<string>();
  for (const entry of Array.isArray(raw.specifics) ? raw.specifics : []) {
    const key = asText(entry?.key);
    const value = asText(entry?.value);
    if (!key || !value || seen.has(key.toLowerCase())) {
      continue;
    }
    const name = categoryId === null ? undefined : aspectNames.get(key.toLowerCase());
    if (!name) {
      readings.push(`${key}: ${value}`);
      continue;
    }
    seen.add(key.toLowerCase());
    specifics.push({ key: name, value: value.slice(0, MAX_SPECIFIC_LENGTH) });
  }

  const upcText = asText(raw.upc);
  const upc = normalizeGtin(upcText);
  if (upcText && !upc) {
    notes.push(`Read a barcode number ${upcText}, but it doesn't check out (a digit is likely misread); UPC left blank.`);
  }

  const templateName = asText(raw.templateName) || null;

  return {
    item: asText(raw.item),
    categoryId,
    templateName,
    conditionId,
    cardConditionId,
    specifics,
    upc,
    readings,
    notes,
  };
}

// The template Add Item would use for this category: the one Claude named if
// it's for this category, else the first one for it.
export function pickTemplate(
  templates: TemplateRow[],
  categoryId: number | null,
  templateName: string | null,
): TemplateRow | undefined {
  if (categoryId === null) {
    return undefined;
  }
  const candidates = templates
    .filter((template) => template.ebayCategoryId === categoryId)
    .sort((a, b) => a.name.localeCompare(b.name));
  const named = templateName
    ? candidates.find((template) => template.name.toLowerCase() === templateName.toLowerCase())
    : undefined;
  return named ?? candidates[0];
}

function parseSpecificsList(text: string | null | undefined): Specific[] {
  if (!text) {
    return [];
  }
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => (typeof entry === "string" ? { key: entry, value: "" } : entry))
        .filter((entry) => entry && typeof entry.key === "string")
        .map((entry) => ({ key: entry.key, value: entry.value == null ? "" : String(entry.value) }));
    }
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed).map(([key, value]) => ({ key, value: value == null ? "" : String(value) }));
    }
  } catch {
    // not JSON: no specifics
  }
  return [];
}

// The item specifics list as Add Item would start it (the template's, or the
// category's own with required ones first), filled with what Claude read.
export function mergeSpecifics(template: TemplateRow | undefined, aspects: Aspect[], identified: Specific[]): Specific[] {
  let base: Specific[];
  if (template) {
    base = parseSpecificsList(template.specifics);
  } else {
    const required = aspects.filter((aspect) => aspect.aspectConstraint?.aspectRequired === true);
    const other = aspects.filter((aspect) => aspect.aspectConstraint?.aspectRequired !== true);
    base = [...required, ...other].map((aspect) => ({ key: aspect.localizedAspectName, value: "" }));
  }
  const merged = base.map((entry) => ({ ...entry }));
  for (const specific of identified) {
    const existing = merged.find((entry) => entry.key.toLowerCase() === specific.key.toLowerCase());
    if (existing) {
      existing.value = specific.value;
    } else {
      merged.push({ ...specific });
    }
  }
  return merged;
}

// Add Item's shipping price for a shipping type (the same table and rough
// calculation as ItemAdd.vue).
export function shippingPriceFor(
  shippingType: number,
  pounds: number,
  size: { width: number; height: number; length: number },
): number {
  const flat: Record<number, number> = { 1: 1, 2: 5, 3: 8, 4: 14, 5: 19 };
  if (flat[shippingType] !== undefined) {
    return flat[shippingType];
  }
  if (shippingType !== 99) {
    return 0;
  }
  const dimensionalWeight = Math.ceil((size.length * size.width * size.height) / 166) || 0;
  const billableWeight = Math.max(1, Math.max(pounds || 0, dimensionalWeight));
  const rawPrice = 5 + 2 * billableWeight;
  return Number((rawPrice * 0.8).toFixed(2));
}

// The fields a template fills when it's chosen in Add Item.
export function templateFields(template: TemplateRow | undefined) {
  if (!template) {
    return {};
  }
  const pounds = template.shipWeightPounds || 0;
  const size = {
    width: template.shipSizeWidthInches || 0,
    height: template.shipSizeHeightInches || 0,
    length: template.shipSizeDepthInches || 0,
  };
  const shippingType = template.shippingType ?? 99;
  return {
    templateId: template.id,
    shipWeightPounds: pounds,
    shipWeightOunces: template.shipWeightOunces || 0,
    shipSizeWidthInches: size.width,
    shipSizeHeightInches: size.height,
    shipSizeDepthInches: size.length,
    location: template.location || "",
    shippingType,
    shippingPrice: shippingPriceFor(shippingType, pounds, size).toFixed(2),
  };
}

// The prompt the existing title and description generation gets.
export function generationPrompt(identification: Identification): string {
  const lines = [identification.item];
  if (identification.upc) {
    lines.push(`UPC: ${identification.upc}`);
  }
  if (identification.readings.length) {
    lines.push("Also read on the item: " + identification.readings.join("; "));
  }
  return lines.filter(Boolean).join("\n");
}

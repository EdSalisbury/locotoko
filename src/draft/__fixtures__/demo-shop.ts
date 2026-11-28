// The demo shop (demo/data.json) as the draft tests' Locotoko: its users,
// owners, categories and templates, in the shapes Prisma returns. Plus the
// eBay details for its Records category, standing in for eBay's lookups.
import * as fs from "fs";
import * as path from "path";
import { Aspect, Condition, TemplateRow } from "../identify";

const repoRoot = path.join(__dirname, "..", "..", "..");
const demo = JSON.parse(fs.readFileSync(path.join(repoRoot, "demo", "data.json"), "utf8"));

export const demoCategories: { id: number; name: string; parentId: number; leaf: boolean; level: number }[] =
  demo.categories;

export const demoOwners: { id: string; name: string; rate: string }[] = demo.owners;

export const demoTemplates: TemplateRow[] = demo.templates.map((template) => ({
  ...template,
  specifics: JSON.stringify(template.specifics ?? []),
  shippingType: template.shippingType ?? 99,
}));

export function demoPhoto(name: string): Buffer {
  return fs.readFileSync(path.join(repoRoot, "demo", "images", name));
}

export const recordsConditions: Condition[] = [
  { ID: "1000", DisplayName: "Brand New" },
  { ID: "3000", DisplayName: "Used" },
];

export const recordsAspects: Aspect[] = [
  { localizedAspectName: "Artist", aspectConstraint: { aspectRequired: true, aspectMode: "FREE_TEXT" } },
  { localizedAspectName: "Release Title", aspectConstraint: { aspectRequired: true, aspectMode: "FREE_TEXT" } },
  {
    localizedAspectName: "Format",
    aspectConstraint: { aspectRequired: true, aspectMode: "SELECTION_ONLY" },
    aspectValues: [{ localizedValue: "Record" }],
  },
  { localizedAspectName: "Genre", aspectConstraint: { aspectRequired: false, aspectMode: "FREE_TEXT" } },
  { localizedAspectName: "Release Year", aspectConstraint: { aspectRequired: false, aspectMode: "FREE_TEXT" } },
  { localizedAspectName: "Record Size", aspectConstraint: { aspectRequired: false, aspectMode: "FREE_TEXT" } },
  { localizedAspectName: "Speed", aspectConstraint: { aspectRequired: false, aspectMode: "FREE_TEXT" } },
];

export const claudeLp = JSON.parse(fs.readFileSync(path.join(__dirname, "claude-lp.json"), "utf8"));

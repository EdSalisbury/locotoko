// Checks an item for problems that would make an eBay listing fail, and
// describes each one in plain language so the user knows what to fix.
// The client's "ready" checkbox runs the same shipping rules, but the eBay
// button lists directly and skips those, so the server checks too.
// Kept separate from EbayListingService so it can be unit tested without
// Prisma, EbayService (ebay-api/axios), or NestJS's DI container.

import { ShippingDimensions } from "./build-shipping-package-details";

export function findShippingProblems(item: ShippingDimensions): string[] {
  const problems: string[] = [];

  const pounds = item.shipWeightPounds ?? 0;
  const ounces = item.shipWeightOunces ?? 0;
  if (pounds * 16 + ounces <= 0) {
    problems.push(`Shipping weight is missing (${pounds} lb ${ounces} oz)`);
  }

  // Labels match the item form: "length" is stored as shipSizeDepthInches.
  const dimensions: [keyof ShippingDimensions, string][] = [
    ["shipSizeDepthInches", "length"],
    ["shipSizeWidthInches", "width"],
    ["shipSizeHeightInches", "height"],
  ];
  for (const [field, label] of dimensions) {
    const value = item[field];
    if (!(typeof value === "number" && value > 0)) {
      problems.push(`Package ${label} is missing`);
    }
  }

  return problems;
}

// Shape the client already knows how to display: a bulleted list of
// ShortMessage entries (see client itemUtils.js listItem).
export function toClientErrors(messages: string[]) {
  return { message: messages.map((m) => ({ ShortMessage: m })) };
}

// eBay's Errors field is a single object for one error and an array for
// several. Passing the array straight through gave the client a body it
// couldn't read, so it showed "undefined". Errors that didn't come from
// eBay (no meta) used to crash the handler itself. Normalize all of them.
export function ebayErrorToClientErrors(e: any) {
  const errors = e?.meta?.Errors;
  if (!errors) {
    return toClientErrors([e?.message ?? "Unknown error"]);
  }
  const list = Array.isArray(errors) ? errors : [errors];
  return toClientErrors(list.map(describeEbayError));
}

// eBay sometimes says only "Unknown Error." and puts the real reason in
// ErrorParameters (e.g. "FCC ID must be 4 to 19 characters long..."), so
// prefer that text when it's there.
function describeEbayError(err: any): string {
  const short = err?.ShortMessage ?? err?.LongMessage ?? "Unknown eBay error";
  if (/^unknown error\.?$/i.test(String(short).trim())) {
    const params = err?.ErrorParameters;
    const first = Array.isArray(params) ? params[0] : params;
    if (typeof first?.Value === "string" && first.Value.trim()) {
      return first.Value.trim();
    }
  }
  return short;
}

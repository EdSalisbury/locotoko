import { buildProductListingDetails, DOES_NOT_APPLY } from "./build-product-listing-details";

describe("buildProductListingDetails", () => {
  it("sends the item's UPC as both UPC and ISBN (existing behavior)", () => {
    expect(buildProductListingDetails("012569749252")).toEqual({ UPC: "012569749252", ISBN: "012569749252" });
  });

  it("trims stray whitespace", () => {
    expect(buildProductListingDetails(" 012569749252 ").UPC).toBe("012569749252");
  });

  // The real failure: a new DVD (category 617) with no UPC was rejected with
  // "The UPC field is missing"; eBay's VerifyAddItem accepts "Does not apply".
  it.each([null, undefined, "", "   "])("sends 'Does not apply' when the UPC is %p", (upc) => {
    expect(buildProductListingDetails(upc)).toEqual({ UPC: DOES_NOT_APPLY, ISBN: DOES_NOT_APPLY });
  });
});

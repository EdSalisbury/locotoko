import { buildEbaySku } from "./build-ebay-sku";

describe("buildEbaySku", () => {
  it("joins location and acquisition name with a pipe", () => {
    expect(buildEbaySku("Shelf A3", "Estate Sale Lot 12")).toBe(
      "Shelf A3|Estate Sale Lot 12",
    );
  });

  it("treats a null location as empty", () => {
    expect(buildEbaySku(null, "Estate Sale Lot 12")).toBe("|Estate Sale Lot 12");
  });

  it("treats a null acquisition name as empty", () => {
    expect(buildEbaySku("Shelf A3", null)).toBe("Shelf A3|");
  });

  it("returns just the separator when both are null", () => {
    expect(buildEbaySku(null, null)).toBe("|");
  });

  it("truncates to 50 characters", () => {
    const location = "a".repeat(30);
    const acquisition = "b".repeat(30);
    const sku = buildEbaySku(location, acquisition);
    expect(sku.length).toBe(50);
    expect(sku).toBe((location + "|" + acquisition).slice(0, 50));
  });
});

import { isValidGtin, normalizeGtin } from "./gtin";

describe("barcode check digits", () => {
  it("accepts real UPC-A, EAN-13 and EAN-8 numbers", () => {
    expect(isValidGtin("036000291452")).toBe(true); // UPC-A
    expect(isValidGtin("4006381333931")).toBe(true); // EAN-13
    expect(isValidGtin("73513537")).toBe(true); // EAN-8
  });

  it("rejects a number with one digit misread", () => {
    expect(isValidGtin("036000291453")).toBe(false);
    expect(isValidGtin("036000291462")).toBe(false);
  });

  it("keeps only valid numbers, without spaces or dashes", () => {
    expect(normalizeGtin("0 36000 29145 2")).toBe("036000291452");
    expect(normalizeGtin("036000-291452")).toBe("036000291452");
    expect(normalizeGtin("036000291453")).toBeNull();
    expect(normalizeGtin("12345")).toBeNull();
    expect(normalizeGtin("not a number")).toBeNull();
    expect(normalizeGtin(null)).toBeNull();
    expect(normalizeGtin("")).toBeNull();
  });
});

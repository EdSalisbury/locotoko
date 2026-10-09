import { buildShippingPackageDetails } from "./build-shipping-package-details";

const full = {
  shipSizeDepthInches: 2,
  shipSizeHeightInches: 4,
  shipSizeWidthInches: 7,
  shipWeightPounds: 1,
  shipWeightOunces: 3,
};

describe("buildShippingPackageDetails", () => {
  it("passes real dimensions and weights through unchanged", () => {
    const d = buildShippingPackageDetails(full);
    expect(d.PackageDepth).toEqual({ "@_unit": "inches", "#value": 2 });
    expect(d.PackageLength).toEqual({ "@_unit": "inches", "#value": 4 });
    expect(d.PackageWidth).toEqual({ "@_unit": "inches", "#value": 7 });
    expect(d.WeightMajor).toEqual({ "#value": 1, "@_unit": "lbs" });
    expect(d.WeightMinor).toEqual({ "#value": 3, "@_unit": "oz" });
  });

  it("maps PackageLength from shipSizeHeightInches (existing behavior)", () => {
    const d = buildShippingPackageDetails({ ...full, shipSizeHeightInches: 9 });
    expect(d.PackageLength["#value"]).toBe(9);
  });

  // The real failure: the Kodak EasyShare item had shipWeightPounds = null,
  // which produced "<WeightMajor unit="lbs"><#value/></WeightMajor>" and an
  // "XML Parse error" from eBay.
  it.each([
    "shipSizeDepthInches",
    "shipSizeHeightInches",
    "shipSizeWidthInches",
    "shipWeightPounds",
    "shipWeightOunces",
  ] as const)("sends 0 instead of null when %s is missing", (field) => {
    const d = buildShippingPackageDetails({ ...full, [field]: null });
    const values = [d.PackageDepth, d.PackageLength, d.PackageWidth, d.WeightMajor, d.WeightMinor].map((v) => v["#value"]);
    expect(values).not.toContain(null);
    expect(values).not.toContain(undefined);
    expect(values).toContain(0);
  });

  it("keeps a real 0 as 0", () => {
    const d = buildShippingPackageDetails({ ...full, shipWeightPounds: 0 });
    expect(d.WeightMajor["#value"]).toBe(0);
  });

  it("keeps the fixed package settings", () => {
    const d = buildShippingPackageDetails(full);
    expect(d.ShippingIrregular).toBe(false);
    expect(d.ShippingPackage).toBe("PackageThickEnvelope");
  });
});

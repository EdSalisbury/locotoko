// Builds the ShippingPackageDetails block for eBay's AddItem/ReviseItem.
// Kept separate from EbayListingService so it can be unit tested without
// pulling in Prisma, EbayService (and transitively ebay-api/axios), or
// NestJS's DI container.

export interface ShippingDimensions {
  shipSizeDepthInches: number | null;
  shipSizeHeightInches: number | null;
  shipSizeWidthInches: number | null;
  shipWeightPounds: number | null;
  shipWeightOunces: number | null;
}

// A null "#value" on an element that also has an attribute makes ebay-api's
// XML builder (fast-xml-parser) emit "<#value/>", which isn't valid XML, and
// eBay rejects the whole request with "XML Parse error". Send 0 instead.
const orZero = (n: number | null | undefined): number => n ?? 0;

export function buildShippingPackageDetails(item: ShippingDimensions) {
  return {
    ShippingIrregular: false,
    ShippingPackage: "PackageThickEnvelope",
    PackageDepth: {
      "@_unit": "inches",
      "#value": orZero(item.shipSizeDepthInches),
    },
    PackageLength: {
      "@_unit": "inches",
      "#value": orZero(item.shipSizeHeightInches),
    },
    PackageWidth: {
      "@_unit": "inches",
      "#value": orZero(item.shipSizeWidthInches),
    },
    WeightMajor: {
      "#value": orZero(item.shipWeightPounds),
      "@_unit": "lbs",
    },
    WeightMinor: {
      "#value": orZero(item.shipWeightOunces),
      "@_unit": "oz",
    },
  };
}

// Pure logic for building an eBay listing's SKU. Kept separate from
// EbayListingService so it can be unit tested without pulling in Prisma,
// EbayService (and transitively ebay-api/axios), or NestJS's DI container.

const EBAY_SKU_MAX_LENGTH = 50;

export function buildEbaySku(location: string | null, acquisitionName: string | null): string {
    const loc = location || '';
    const acq = acquisitionName || '';
    const sku = `${loc}|${acq}`;
    return sku.slice(0, EBAY_SKU_MAX_LENGTH);
}

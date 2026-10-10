// Builds the ProductListingDetails block for eBay's AddItem/ReviseItem.
// Kept separate from EbayListingService so it can be unit tested without
// Prisma, EbayService (ebay-api/axios), or NestJS's DI container.

// eBay's accepted value for "this item has no product identifier".
export const DOES_NOT_APPLY = "Does not apply";

// Some categories (e.g. DVDs, 617) require a product identifier and reject a
// listing with no UPC ("The UPC field is missing"); they accept "Does not
// apply". Categories that don't require one accept it too. The same value is
// sent as ISBN, as before.
export function buildProductListingDetails(upc: string | null | undefined) {
  const value = upc && upc.trim() ? upc.trim() : DOES_NOT_APPLY;
  return {
    UPC: value,
    ISBN: value,
  };
}

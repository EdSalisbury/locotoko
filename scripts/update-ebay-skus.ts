import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { EbayService } from "../src/ebay/ebay.service";

/**
 * One-time script to update all active eBay listings with the new SKU format:
 * <item_id>|<location>|<acquisition_name>
 *
 * Run with: npx ts-node scripts/update-ebay-skus.ts
 */
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const ebay = app.get(EbayService);

  console.log("Fetching all active items with eBay listings...");

  // Get all items that have an active eBay listing (have ebayListingId and not ended)
  const items = await prisma.item.findMany({
    where: {
      ebayListingId: {
        not: "",
      },
      endedAt: null,
    },
    include: {
      acquisition: true,
    },
  });

  console.log(`Found ${items.length} active listings to update.`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    const newSku = `${item.id}|${item.location || ""}|${item.acquisition?.name || ""}`;

    try {
      console.log(`Updating item ${item.id} (${item.title}) - SKU: ${newSku}`);

      await ebay.trading.ReviseItem({
        Item: {
          ItemID: item.ebayListingId,
          SKU: newSku,
        },
      });

      successCount++;
      console.log(`  ✓ Updated successfully`);

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (error) {
      errorCount++;
      console.error(`  ✗ Failed to update: ${error.message || error}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Total: ${items.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  await app.close();
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

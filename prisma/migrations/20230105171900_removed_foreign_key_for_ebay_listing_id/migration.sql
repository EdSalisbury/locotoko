/*
  Warnings:

  - You are about to drop the `ebayListings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_ebayListingId_fkey";

-- DropIndex
DROP INDEX "items_ebayListingId_key";

-- DropTable
DROP TABLE "ebayListings";

/*
  Warnings:

  - The primary key for the `ebayListings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_ebayListingId_fkey";

-- AlterTable
ALTER TABLE "ebayListings" DROP CONSTRAINT "ebayListings_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ebayListings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "ebayListingId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ebayListingId_fkey" FOREIGN KEY ("ebayListingId") REFERENCES "ebayListings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

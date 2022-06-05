/*
  Warnings:

  - The primary key for the `ebayListings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `title` on the `ebayListings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ebayListingId]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `ebayListings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ebayListings" DROP CONSTRAINT "ebayListings_pkey",
DROP COLUMN "title",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "ebayListings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "ebayListingId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "items_ebayListingId_key" ON "items"("ebayListingId");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ebayListingId_fkey" FOREIGN KEY ("ebayListingId") REFERENCES "ebayListings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - Made the column `ebayListingId` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "items" ALTER COLUMN "ebayListingId" SET NOT NULL,
ALTER COLUMN "ebayListingId" SET DEFAULT E'';

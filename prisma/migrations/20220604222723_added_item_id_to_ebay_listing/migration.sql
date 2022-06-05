/*
  Warnings:

  - Added the required column `itemId` to the `ebayListings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ebayListings" ADD COLUMN     "itemId" INTEGER NOT NULL;

/*
  Warnings:

  - You are about to drop the `itemImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "itemImages" DROP CONSTRAINT "itemImages_itemId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "itemImages";

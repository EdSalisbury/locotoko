/*
  Warnings:

  - Added the required column `ebayCategoryId` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" ADD COLUMN     "ebayCategoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ebayCategoryId_fkey" FOREIGN KEY ("ebayCategoryId") REFERENCES "ebayCategories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

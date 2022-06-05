/*
  Warnings:

  - You are about to drop the column `categoryId` on the `templates` table. All the data in the column will be lost.
  - Added the required column `ebayCategoryId` to the `templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "categoryId",
ADD COLUMN     "ebayCategoryId" INTEGER NOT NULL;

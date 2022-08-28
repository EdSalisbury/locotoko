/*
  Warnings:

  - You are about to drop the column `quanitySold` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "quanitySold",
ADD COLUMN     "quantitySold" INTEGER NOT NULL DEFAULT 0;

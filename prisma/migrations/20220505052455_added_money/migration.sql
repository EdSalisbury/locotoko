/*
  Warnings:

  - You are about to drop the column `shippedDate` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `soldDate` on the `items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "shippedDate",
DROP COLUMN "soldDate",
ADD COLUMN     "cost" MONEY,
ADD COLUMN     "price" MONEY,
ADD COLUMN     "shippedAt" TIMESTAMP(3),
ADD COLUMN     "soldAt" TIMESTAMP(3),
ADD COLUMN     "soldPrice" MONEY;

/*
  Warnings:

  - You are about to drop the column `acquisitionDate` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `cost` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `soldPrice` on the `items` table. All the data in the column will be lost.
  - Made the column `price` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "acquisitionDate",
DROP COLUMN "cost",
DROP COLUMN "soldPrice",
ADD COLUMN     "acquisitionId" TEXT,
ALTER COLUMN "price" SET NOT NULL;

-- CreateTable
CREATE TABLE "acquisitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" MONEY NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acquisitions_pkey" PRIMARY KEY ("id")
);

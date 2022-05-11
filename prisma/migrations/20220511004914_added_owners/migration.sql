/*
  Warnings:

  - Added the required column `ownerId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Made the column `listingUserId` on table `items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_listingUserId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "listingUserId" SET NOT NULL;

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_listingUserId_fkey" FOREIGN KEY ("listingUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

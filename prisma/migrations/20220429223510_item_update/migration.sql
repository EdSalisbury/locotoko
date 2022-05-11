/*
  Warnings:

  - You are about to drop the column `listingAgentId` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAgentId` on the `items` table. All the data in the column will be lost.
  - Added the required column `listingUserId` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "listingAgentId",
DROP COLUMN "shippingAgentId",
ADD COLUMN     "listingUserId" TEXT NOT NULL,
ADD COLUMN     "shippingUserId" TEXT,
ALTER COLUMN "quantity" SET DEFAULT 1;

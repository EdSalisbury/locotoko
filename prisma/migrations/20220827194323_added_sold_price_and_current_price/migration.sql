-- AlterTable
ALTER TABLE "items" ADD COLUMN     "currentPrice" MONEY,
ADD COLUMN     "soldPrice" MONEY NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "ebayCategories" ADD COLUMN     "leaf" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0;

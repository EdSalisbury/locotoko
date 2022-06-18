/*
  Warnings:

  - You are about to drop the column `conditions` on the `templates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "items" DROP CONSTRAINT "items_templateId_fkey";

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "conditions";

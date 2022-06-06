/*
  Warnings:

  - You are about to drop the column `fields` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "fields",
ADD COLUMN     "specifics" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "templateId" TEXT;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

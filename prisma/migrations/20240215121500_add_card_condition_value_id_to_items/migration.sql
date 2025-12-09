-- Add ebayCardConditionValueId column for detailed card grading
ALTER TABLE "items"
ADD COLUMN IF NOT EXISTS "ebayCardConditionValueId" INTEGER;

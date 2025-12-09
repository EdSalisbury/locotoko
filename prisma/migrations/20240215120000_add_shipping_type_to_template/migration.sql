-- Add shippingType to templates with default Calculated (99)
ALTER TABLE "templates"
ADD COLUMN     "shippingType" INTEGER NOT NULL DEFAULT 99;

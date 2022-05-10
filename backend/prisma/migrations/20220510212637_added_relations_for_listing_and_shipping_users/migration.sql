-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_listingUserId_fkey" FOREIGN KEY ("listingUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_shippingUserId_fkey" FOREIGN KEY ("shippingUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

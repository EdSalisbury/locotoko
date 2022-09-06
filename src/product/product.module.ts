import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { EbayListingService } from "../ebay-listing/ebay-listing.service";

@Module({
  controllers: [ProductController],
  providers: [ProductService, EbayListingService],
})
export class ProductModule {}

import { Module } from "@nestjs/common";
import { EbayListingController } from "./ebay-listing.controller";
import { EbayListingService } from "./ebay-listing.service";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";

@Module({
  controllers: [EbayListingController],
  providers: [EbayListingService, EbayCategoryService],
})
export class EbayListingModule {}

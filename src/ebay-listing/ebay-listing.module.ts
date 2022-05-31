import { Module } from "@nestjs/common";
import { EbayListingController } from "./ebay-listing.controller";
import { EbayListingService } from "./ebay-listing.service";

@Module({
  controllers: [EbayListingController],
  providers: [EbayListingService],
})
export class EbayListingModule {}

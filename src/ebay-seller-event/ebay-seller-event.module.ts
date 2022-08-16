import { Module } from "@nestjs/common";
import { EbaySellerEventController } from "./ebay-seller-event.controller";
import { EbaySellerEventService } from "./ebay-seller-event.service";

@Module({
  controllers: [EbaySellerEventController],
  providers: [EbaySellerEventService],
})
export class EbaySellerEventModule {}

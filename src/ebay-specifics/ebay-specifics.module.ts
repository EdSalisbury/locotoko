import { Module } from "@nestjs/common";
import { EbaySpecificsService } from "./ebay-specifics.service";
import { EbaySpecificsController } from "./ebay-specifics.controller";

@Module({
  controllers: [EbaySpecificsController],
  providers: [EbaySpecificsService],
})
export class EbaySpecificsModule {}

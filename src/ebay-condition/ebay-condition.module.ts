import { Module } from "@nestjs/common";
import { EbayConditionService } from "./ebay-condition.service";
import { EbayConditionController } from "./ebay-condition.controller";

@Module({
  controllers: [EbayConditionController],
  providers: [EbayConditionService],
})
export class EbayConditionModule {}

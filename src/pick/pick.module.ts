import { Module } from "@nestjs/common";
import { PickController } from "./pick.controller";
import { EbayOrderService } from "../ebay-order/ebay-order.service";
import { PickService } from "./pick.service";

@Module({
  providers: [EbayOrderService, PickService],
  controllers: [PickController],
})
export class PickModule {}

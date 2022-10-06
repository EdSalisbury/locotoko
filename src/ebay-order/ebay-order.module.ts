import { Module } from "@nestjs/common";
import { EbayOrderService } from "./ebay-order.service";
import { EbayOrderController } from "./ebay-order.controller";

@Module({
  providers: [EbayOrderService],
  controllers: [EbayOrderController],
})
export class EbayOrderModule {}

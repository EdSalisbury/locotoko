import { Controller, Get, Param, UseGuards, Query } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayOrderService } from "./ebay-order.service";

@UseGuards(JwtGuard)
@Controller("ebayOrders")
export class EbayOrderController {
  constructor(private ebayOrderService: EbayOrderService) {}

  @Get(":id")
  getEbayOrder(@Param("id") orderID: string) {
    return this.ebayOrderService.getEbayOrder(orderID);
  }

  @Get("")
  getEbayOrders(@Query("numberOfDays") numberOfDays: string) {
    return this.ebayOrderService.getEbayOrders(parseInt(numberOfDays) | 4);
  }
}

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
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
  getEbayOrders() {
    return this.ebayOrderService.getEbayOrders();
  }
}

import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayOrderService } from "./ebay-order.service";

@UseGuards(JwtGuard)
@Controller("ebayOrders")
export class EbayOrderController {
  constructor(private ebayOrderService: EbayOrderService) {}

  @Get("")
  getEbayOrders() {
    return this.ebayOrderService.getEbayOrders();
  }
}

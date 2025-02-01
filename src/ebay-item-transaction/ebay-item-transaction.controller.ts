import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { EbayItemTransactionService } from "./ebay-item-transaction.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("ebayItemTransactions")
export class EbayItemTransactionController {
  constructor(private ebayItemTransactionService: EbayItemTransactionService) { }

  @Get(":itemId")
  getConditions(@Param("itemId") itemId: string) {
    return this.ebayItemTransactionService.getItemTransactions(itemId);
  }
}

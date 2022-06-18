import { Controller, Get, UseGuards, Param } from "@nestjs/common";
import { EbayConditionService } from "./ebay-condition.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("ebayConditions")
export class EbayConditionController {
  constructor(private ebayConditionService: EbayConditionService) {}

  @Get(":categoryId")
  getConditions(@Param("categoryId") categoryId: number) {
    return this.ebayConditionService.getConditions(categoryId);
  }
}

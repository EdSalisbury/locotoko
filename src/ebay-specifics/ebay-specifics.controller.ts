import { Controller, Get, UseGuards, Param } from "@nestjs/common";
import { EbaySpecificsService } from "./ebay-specifics.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("ebaySpecifics")
export class EbaySpecificsController {
  constructor(private ebaySpecificsService: EbaySpecificsService) {}

  @Get(":categoryId")
  getSpecifics(@Param("categoryId") categoryId: number) {
    return this.ebaySpecificsService.getSpecifics(categoryId);
  }
}

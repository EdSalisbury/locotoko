import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "../auth/guard";
import { EbayService } from "./ebay.service";

//@UseGuards(JwtGuard)
@Controller("ebay")
export class EbayController {
  constructor(private ebayService: EbayService) {}

  @Get("categories")
  getCategories() {
    return this.ebayService.ebay.trading.GetCategories(
      {
        detailLevel: "ReturnAll",
        viewAllNodes: true,
      },
    );
  }
}

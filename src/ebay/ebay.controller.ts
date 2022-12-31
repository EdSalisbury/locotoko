import { Controller, Get, UseGuards, Param } from "@nestjs/common";
import { EbayService } from "./ebay.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("ebay")
export class EbayController {
  constructor(private ebayService: EbayService) {}

  @Get("")
  auth() {
    return this.ebayService.userAuth();
  }
}

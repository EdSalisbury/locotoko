import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Param,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbaySellerEventService } from "./ebay-seller-event.service";

@UseGuards(JwtGuard)
@Controller("ebaySellerEvents")
export class EbaySellerEventController {
  constructor(private ebaySellerEventService: EbaySellerEventService) {}

  @Get("")
  getEbaySellerEvents() {
    return this.ebaySellerEventService.getEbaySellerEvents();
  }
}

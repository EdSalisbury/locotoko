import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "../auth/guard";
import { EbayService } from "./ebay.service";
import { CreateCategoriesDto } from "./dto";

//@UseGuards(JwtGuard)
@Controller("ebay")
export class EbayController {
  constructor(private ebayService: EbayService) {}

  @Post("categories/refresh")
  refreshCategories() {
    this.ebayService.refreshCategories();
  }

  @Get("categories")
  getCategories() {
    return this.ebayService.getCategories();
  }
}

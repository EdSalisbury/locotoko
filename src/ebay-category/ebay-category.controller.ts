import {
  Controller,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayCategoryService } from "./ebay-category.service";

@UseGuards(JwtGuard)
@Controller("ebayCategories")
export class EbayCategoryController {
  constructor(
    private ebayCategoryService: EbayCategoryService,
  ) {}

  @Get()
  getCategories() {
    return this.ebayCategoryService.getCategories();
  }

  @Post("refresh")
  refreshCategories() {
    return this.ebayCategoryService.refreshCategories();
  }
}

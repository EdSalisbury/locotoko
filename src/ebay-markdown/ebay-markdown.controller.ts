import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
  Delete,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayMarkdownService } from "./ebay-markdown.service";
import { CreateMarkdownDto, EditMarkdownDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("ebayMarkdowns")
export class EbayMarkdownController {
  constructor(private ebayMarkdownService: EbayMarkdownService) {}

  @Get(":id")
  getMarkdown(@Param("id") id: string) {
    return this.ebayMarkdownService.getMarkdown(id);
  }

  @Get()
  getMarkdowns() {
    return this.ebayMarkdownService.getMarkdowns();
  }

  @Post()
  createMarkdown(@Body() dto: CreateMarkdownDto) {
    return this.ebayMarkdownService.createMarkdown(dto);
  }

  @Patch(":id")
  updateMarkdown(@Param("id") id: string, @Body() dto: EditMarkdownDto) {
    return this.ebayMarkdownService.updateMarkdown(id, dto);
  }

  @Delete(":id")
  deleteMarkdown(@Param("id") id: string) {
    return this.ebayMarkdownService.deleteMarkdown(id);
  }
}

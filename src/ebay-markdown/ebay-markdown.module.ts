import { Module } from "@nestjs/common";
import { EbayMarkdownController } from "./ebay-markdown.controller";
import { EbayMarkdownService } from "./ebay-markdown.service";

@Module({
  controllers: [EbayMarkdownController],
  providers: [EbayMarkdownService],
  exports: [EbayMarkdownService],
})
export class EbayMarkdownModule {}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EbayService } from "../ebay/ebay.service";

@Injectable()
export class EbayMarkdownService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getMarkdowns() {
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_USER_TOKEN"));

    return await this.ebay.sell.marketing.getPromotions("EBAY_US", {
      promotionType: "MARKDOWN_SALE",
      limit: 200,
      offset: 0,
      promotionStatus: "SCHEDULED",
    });
  }

  async getMarkdown(id: string) {
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_USER_TOKEN"));
    return await this.ebay.sell.marketing.getItemPriceMarkdownPromotion(id);
  }
}

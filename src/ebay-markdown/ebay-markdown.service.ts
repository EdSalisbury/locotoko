import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CurrencyCode, MarketplaceId } from "ebay-api/lib/enums";

import { EbayService } from "../ebay/ebay.service";
import { CreateMarkdownDto, EditMarkdownDto } from "./dto";

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

  async createMarkdown(dto: CreateMarkdownDto) {
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_USER_TOKEN"));
    let dateTmp = new Date();
    dateTmp.setDate(dateTmp.getDate() + 1);
    const startDate = dateTmp.toISOString();
    dateTmp = new Date();

    dateTmp.setDate(dateTmp.getDate() + 45);
    const endDate = dateTmp.toISOString();

    try {
      const payload = {
        name: dto.name,
        description: dto.description,
        applyFreeShipping: true,
        autoSelectFutureInventory: false,
        startDate: startDate,
        endDate: endDate,
        blockPriceIncreaseInItemRevision: true,
        marketplaceId: MarketplaceId.EBAY_US,
        priority: "",
        promotionImageUrl:
          "https://i.ebayimg.com/********/********/********/s-l500.jpg",
        promotionStatus: "SCHEDULED",
        selectedInventoryDiscounts: [
          {
            discountBenefit: {
              percentageOffItem: "5",
              percentageOffOrder: "0",
              amountOffItem: {
                value: "0",
                currency: CurrencyCode.USD,
              },
              amountOffOrder: {
                value: "0",
                currency: CurrencyCode.USD,
              },
            },
            discountId: "",
            ruleOrder: null,
            inventoryCriterion: {
              inventoryCriterionType: "INVENTORY_BY_VALUE",
              listingIds: ["144592240180"],
              inventoryItems: null,
              // ruleCriteria: {
              //   selectionRules: null,
              //   excludeInventoryItems: null,
              //   excludeListingIds: null,
              //   markupListingIds: null,
              //   markupInventoryItems: null,
              // },
            },
          },
        ],
      };
      const response = await this.ebay.sell.marketing.post(
        `/item_price_markdown`,
        payload,
      );
      // await this.ebay.sell.marketing.createItemPriceMarkdownPromotion(
      //   payload,
      // );
      return response;
    } catch (e) {
      console.log(e.meta);
      return { errors: e.meta.res.data.errors };
    }
  }
}

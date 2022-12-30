import { Injectable, PayloadTooLargeException } from "@nestjs/common";
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
        "https://i.ebayimg.com/images/g/H34AAOSwElJjOGkj/s-l140.webp",
      promotionStatus: "SCHEDULED",
      selectedInventoryDiscounts: [
        {
          discountBenefit: {
            percentageOffItem: dto.percentage,
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
            listingIds: dto.itemIds,
            inventoryItems: null,
          },
        },
      ],
    };

    try {
      return await this.ebay.sell.marketing.post(
        `/item_price_markdown`,
        payload,
      );
    } catch (e) {
      console.log(e.meta);
      return { errors: e.meta.res.data.errors };
    }
  }

  async updateMarkdown(id: string, dto: EditMarkdownDto) {
    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_USER_TOKEN"));

    let payload = await this.getMarkdown(id);

    if (dto.name) {
      payload.name = dto.name;
    }
    if (dto.description) {
      payload.description = dto.description;
    }
    if (dto.percentage) {
      payload.selectedInventoryDiscounts[0].discountBenefit.percentageOffItem =
        dto.percentage;
    }
    if (dto.itemIds) {
      payload.selectedInventoryDiscounts[0].inventoryCriterion.listingIds =
        dto.itemIds;
    }

    try {
      return await this.ebay.sell.marketing.put(
        `/item_price_markdown/${id}`,
        payload,
      );
    } catch (e) {
      console.log(e.meta);
      return { errors: e.meta.res.data.errors };
    }
  }
}

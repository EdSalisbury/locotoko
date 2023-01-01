import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CurrencyCode, MarketplaceId } from "ebay-api/lib/enums";

import { EbayService } from "../ebay/ebay.service";
import { CreateMarkdownDto, EditMarkdownDto } from "./dto";

@Injectable()
export class EbayMarkdownService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getMarkdowns() {
    return await this.ebay.sell.marketing.getPromotions("EBAY_US", {
      promotionType: "MARKDOWN_SALE",
      limit: 200,
      offset: 0,
    });
  }

  async getMarkdown(id: string) {
    return await this.ebay.sell.marketing.getItemPriceMarkdownPromotion(id);
  }

  async createMarkdown(dto: CreateMarkdownDto) {
    let dateTmp = new Date();
    //dateTmp = new Date(dateTmp.getTime() + 5000);
    dateTmp = new Date(dateTmp.getTime() + 1000 * 60 * 60 * 24 * 5);
    const startDate = dateTmp.toISOString();
    dateTmp = new Date();

    dateTmp.setDate(dateTmp.getDate() + 45);
    const endDate = dateTmp.toISOString();

    const name = `md-${dto.percentage}`;
    const description = `Take ${dto.percentage}% off!`;
    const payload = {
      name: name,
      description: description,
      applyFreeShipping: true,
      autoSelectFutureInventory: false,
      startDate: startDate,
      endDate: endDate,
      blockPriceIncreaseInItemRevision: false,
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
    let payload = await this.getMarkdown(id);

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

  async deleteMarkdown(id: string) {
    let payload = await this.getMarkdown(id);
    if (payload.promotionStatus === "RUNNING") {
      let dateTmp = new Date();
      dateTmp = new Date(dateTmp.getTime() + 5000);
      payload.endDate = dateTmp.toISOString();
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
    return await this.ebay.sell.marketing.deleteItemPriceMarkdownPromotion(id);
  }
}

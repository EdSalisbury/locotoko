import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EbayConditionService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getConditions(categoryId: number) {
    if (categoryId === 0) {
      return "";
    }

    const features = await this.ebay.trading.GetCategoryFeatures({
      DetailLevel: "ReturnAll",
      CategoryID: categoryId,
    });
    return JSON.stringify(features.Category.ConditionValues?.Condition) || [];
  }
}

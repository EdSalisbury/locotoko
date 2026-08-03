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

    try {
      const features = await this.ebay.trading.GetCategoryFeatures({
        DetailLevel: "ReturnAll",
        CategoryID: categoryId,
      });
      return JSON.stringify(features.Category.ConditionValues?.Condition) || [];
    } catch (error) {
      console.error("❌ eBay GetCategoryFeatures Error:", {
        categoryId,
        errorMessage: error?.message,
        errorResponse: error?.response || error?.data,
        errorStack: error?.stack,
        fullError: JSON.stringify(error, null, 2),
      });
      throw error;
    }
  }
}

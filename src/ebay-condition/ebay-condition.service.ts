import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import axios from "axios";

interface ItemCondition {
  conditionId: string;
  conditionDescription: string;
  conditionHelpText?: string;
}

@Injectable()
export class EbayConditionService {
  private ebayApiBaseUrl = "https://api.ebay.com";

  constructor(private ebay: EbayService) {}

  async getConditions(categoryId: number): Promise<string> {
    if (categoryId === 0) {
      return "";
    }

    try {
      const accessToken = await this.ebay.getAccessToken();
      const response = await axios.get(
        `${this.ebayApiBaseUrl}/sell/metadata/v1/marketplace/EBAY_US/get_item_condition_policies`,
        {
          params: {
            filter: `categoryIds:{${categoryId}}`,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.categoryPolicies?.[0]?.itemConditions) {
        const conditions: ItemCondition[] =
          response.data.categoryPolicies[0].itemConditions;
        return JSON.stringify(conditions.map((c) => ({
          id: c.conditionId,
          name: c.conditionDescription,
          description: c.conditionHelpText,
        })));
      }

      return "[]";
    } catch (error) {
      console.error("❌ eBay getItemConditionPolicies Error:", {
        categoryId,
        errorMessage: error?.message,
        errorResponse: error?.response?.data || error?.data,
        errorStatus: error?.response?.status,
        errorStack: error?.stack,
      });
      throw error;
    }
  }
}

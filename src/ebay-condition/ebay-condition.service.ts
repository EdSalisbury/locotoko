import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

interface ItemCondition {
  conditionId: string;
  conditionDescription: string;
  conditionHelpText?: string;
}

@Injectable()
export class EbayConditionService {
  private ebayApiBaseUrl = "https://api.ebay.com";

  constructor(private config: ConfigService) {}

  async getConditions(categoryId: number): Promise<string> {
    if (categoryId === 0) {
      return "";
    }

    try {
      const accessToken = await this.getAccessToken();
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

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get("EBAY_CLIENT_ID");
    const clientSecret = this.config.get("EBAY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET");
    }

    try {
      const response = await axios.post(
        `${this.ebayApiBaseUrl}/identity/v1/oauth2/token`,
        "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("❌ Failed to get eBay OAuth token:", {
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
      });
      throw error;
    }
  }
}

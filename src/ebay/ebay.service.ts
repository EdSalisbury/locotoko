import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import ebayApi from "ebay-api";

@Injectable()
export class EbayService extends ebayApi {
  constructor(config: ConfigService) {
    super({
      appId: config.get("EBAY_APP_ID"),
      certId: config.get("EBAY_CERT_ID"),
      sandbox: false,
      devId: config.get("EBAY_DEV_ID"),
      ruName: config.get("EBAY_RU_NAME"),
      //authToken: config.get("EBAY_AUTH_TOKEN"),
    });
    this.OAuth2.setCredentials({
      access_token: config.get("EBAY_USER_TOKEN"),
      expires_in: 7200,
      refresh_token: config.get("EBAY_REFRESH_TOKEN"),
      refresh_token_expires_in: 47304000,
      token_type: "User Access Token",
    });
  }

  async userAuth() {
    this.OAuth2.setScope([
      "https://api.ebay.com/oauth/api_scope",
      "https://api.ebay.com/oauth/api_scope/sell.marketing.readonly",
      "https://api.ebay.com/oauth/api_scope/sell.marketing",
      "https://api.ebay.com/oauth/api_scope/sell.inventory.readonly",
      "https://api.ebay.com/oauth/api_scope/sell.inventory",
      "https://api.ebay.com/oauth/api_scope/sell.account.readonly",
      "https://api.ebay.com/oauth/api_scope/sell.account",
      "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
      "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      "https://api.ebay.com/oauth/api_scope/sell.analytics.readonly",
      "https://api.ebay.com/oauth/api_scope/sell.finances",
      "https://api.ebay.com/oauth/api_scope/sell.payment.dispute",
      "https://api.ebay.com/oauth/api_scope/commerce.identity.readonly",
      "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription",
      "https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
    ]);

    // 2. Generate and open Url and Grant Access
    const url = this.OAuth2.generateAuthUrl();
    return url;
  }
}

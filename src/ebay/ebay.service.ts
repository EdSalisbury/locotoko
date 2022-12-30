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
      // ruName:
      //   "https://auth.ebay.com/oauth2/authorize?client_id=EdSalisb-LocoToko-PRD-101fb4833-8e9906e9&response_type=code&redirect_uri=Ed_Salisbury-EdSalisb-LocoTo-kuvou&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly",
      //authToken: config.get("EBAY_AUTH_TOKEN"),
    });
  }
}

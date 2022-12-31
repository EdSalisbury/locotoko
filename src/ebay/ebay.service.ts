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
      authToken: config.get("EBAY_AUTH_TOKEN"),
    });
  }

  async userAuth() {
    this.OAuth2.setScope([
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.marketing.readonly',
      'https://api.ebay.com/oauth/api_scope/sell.marketing'
    ]);
    
    // 2. Generate and open Url and Grant Access
    const url = this.OAuth2.generateAuthUrl();
    return url;
  }
}

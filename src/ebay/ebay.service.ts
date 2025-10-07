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
    });

    this.OAuth2.setCredentials({
      access_token: config.get("EBAY_ACCESS_TOKEN"),
      expires_in: 7200,
      refresh_token: config.get("EBAY_REFRESH_TOKEN"),
      refresh_token_expires_in: 47304000,
      token_type: "User Access Token",
    });

  }
  async userAuth() {
    const url = this.OAuth2.generateAuthUrl();
    return url;
  }
}

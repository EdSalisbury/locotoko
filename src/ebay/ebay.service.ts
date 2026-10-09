import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import ebayApi from "ebay-api";

// Scopes requested every time the user token is refreshed. A refreshed token
// only carries what the refresh asks for, and ebay-api's default is the base
// scope alone, which isn't enough for the Media API photo upload
// (createImageFromFile needs sell.inventory; it returned 403 "Access denied"
// without it). All three were granted when Locotoko was authorized, so no
// re-consent is needed. Add a scope here before calling an API that needs it.
const BASE_SCOPE = "https://api.ebay.com/oauth/api_scope";
export const EBAY_REFRESH_SCOPES = [
  BASE_SCOPE,
  `${BASE_SCOPE}/sell.inventory`, // Media API photo upload
  `${BASE_SCOPE}/sell.marketing`, // markdown promotions
];

@Injectable()
export class EbayService extends ebayApi {
  constructor(config: ConfigService) {
    super({
      appId: config.get("EBAY_APP_ID"),
      certId: config.get("EBAY_CERT_ID"),
      sandbox: false,
      devId: config.get("EBAY_DEV_ID"),
      ruName: config.get("EBAY_RU_NAME"),
      scope: EBAY_REFRESH_SCOPES,
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

  async getAccessToken(): Promise<string> {
    try {
      await this.OAuth2.refreshToken();
    } catch (error) {
      console.log("Token refresh skipped (may already be valid)");
    }

    const credentials = this.OAuth2.getCredentials();

    if (!credentials?.access_token) {
      throw new Error("No eBay access token configured");
    }

    return credentials.access_token;
  }
}

import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import { ConfigService } from "@nestjs/config";
const eBay = require("ebay-node-api");

@Injectable()
export class EbayProductService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getEbayProduct(upc: string) {
    // Use ebay-node-api to get the token
    // TODO: Make this not so janky
    let ebay = new eBay({
      clientID: this.config.get("EBAY_APP_ID"),
      clientSecret: this.config.get("EBAY_CERT_ID"),
    });
    const token = await ebay.getAccessToken();

    const request = {
      ProductID: {
        "#value": upc,
        "@_type": "UPC",
      },
    };
    this.ebay.OAuth2.setCredentials(token.access_token);
    const product = await this.ebay.shopping.FindProducts(request);
    return product;
  }
}

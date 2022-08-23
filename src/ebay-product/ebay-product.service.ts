import { Injectable } from "@nestjs/common";
const eBay = require("ebay-node-api");
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EbayProductService {
  constructor(private config: ConfigService) {}

  async getEbayProduct(upc: string) {
    const ebay = new eBay({
      clientID: this.config.get("EBAY_APP_ID"),
    });

    const results = await ebay.findItemsByKeywords(upc);
    return results[0];
  }
}

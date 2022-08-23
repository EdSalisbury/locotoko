import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";

@Injectable()
export class EbayProductService {
  constructor(private ebay: EbayService) {}

  async getEbayProduct(upc: string) {
    const request = {
      ProductID: {
        "#value": upc,
        "@_type": "UPC",
      },
    };
    const items = await this.ebay.shopping.FindProducts(request);
    return items[0];
  }
}

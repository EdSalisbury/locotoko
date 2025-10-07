import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EbaySpecificsService {
  constructor(private ebay: EbayService, private config: ConfigService) { }

  async getSpecifics(categoryId: number) {
    if (categoryId === 0) {
      return "";
    }
    try {
      const treeData = await this.ebay.commerce.taxonomy.getDefaultCategoryTreeId("EBAY_US");
      const data = await this.ebay.commerce.taxonomy.getItemAspectsForCategory(treeData.categoryTreeId, categoryId.toString());
      return JSON.stringify(data.aspects);
    } catch (e) {
      console.error("Error when trying to get specifics.")
      console.error(`Full error: ${e}`)
    }
  }
}

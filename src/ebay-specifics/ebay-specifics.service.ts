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
      const saved = this.ebay.OAuth2.getCredentials();

      this.ebay.OAuth2.setScope(['https://api.ebay.com/oauth/api_scope/commerce.taxonomy.readonly']);

      const treeData = await this.ebay.commerce.taxonomy.getDefaultCategoryTreeId("EBAY_US");
      console.log("treedata")
      console.log(treeData);
      const data = await this.ebay.commerce.taxonomy.getItemAspectsForCategory(treeData.categoryTreeId, categoryId.toString());
      console.log("data")
      console.log(data);
      return JSON.stringify(data.aspects);
    } catch (e) {
      console.error("Error when trying to get specifics.")
      console.error(`Full error: ${e}`)
      console.error(`message: ${e.message}`)
      console.error(`code: ${e.code}`)
      console.error(`url: ${e.config.url}`)
      console.error(`method: ${e.config.method}`)
      console.error(`payload: ${e.config.data}`)
    }
  }
}

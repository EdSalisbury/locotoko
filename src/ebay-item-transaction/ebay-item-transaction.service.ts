import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EbayService } from "src/ebay/ebay.service";

@Injectable()
export class EbayItemTransactionService {
  constructor(private ebay: EbayService, private config: ConfigService) {}

  async getItemTransactions(itemId: string) {
    if (itemId === "") {
      return "";
    }

    this.ebay.OAuth2.setCredentials(this.config.get("EBAY_AUTH_TOKEN"));
    try {
      const response = await this.ebay.trading.GetItemTransactions({
        ItemID: itemId,
      });
      return JSON.stringify(response.TransactionArray.Transaction);
    } catch {
      return [];
    }
  }
}

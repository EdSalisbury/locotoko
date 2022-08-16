import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
@Injectable()
export class EbaySellerEventService {
  constructor(private ebay: EbayService) {}

  async getEbaySellerEvents() {
    const daysAgo = 7;
    const date = new Date(new Date().setDate(new Date().getDate() - daysAgo));

    let request = {
      EndTimeFrom: date.toISOString(),
      IncludeWatchCount: "true",
      DetailLevel: "ReturnAll",
    };

    return await this.ebay.trading.GetSellerEvents(request);
  }
}

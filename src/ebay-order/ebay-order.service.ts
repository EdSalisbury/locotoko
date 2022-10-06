import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";

@Injectable()
export class EbayOrderService {
  constructor(private ebay: EbayService) {}

  async getEbayOrders() {
    let pageNumber = 1;
    let maxPages = 1;

    let request = {
      NumberOfDays: 14,
      OrderRole: "Seller",
      Pagination: {
        PageNumber: pageNumber,
      },
    };

    let orders = [];

    const response = await this.ebay.trading.GetOrders(request);
    orders.push(...response.OrderArray.Order);
    maxPages = response.PaginationResult.TotalNumberOfPages;

    if (maxPages > 1) {
      while (pageNumber < maxPages) {
        pageNumber++;
        request.Pagination.PageNumber = pageNumber;
        const response = await this.ebay.trading.GetOrders(request);
        orders.push(...response.OrderArray.Order);
      }
    }
    return orders;
  }
}

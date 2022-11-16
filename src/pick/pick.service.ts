import { Injectable } from "@nestjs/common";
import { EbayOrderService } from "../ebay-order/ebay-order.service";

@Injectable()
export class PickService {
  constructor(private ebayOrders: EbayOrderService) {}

  async getPicks() {
    const response = await this.ebayOrders.getEbayOrders();

    const items = response.map((order) =>
      order.items.map((item) => ({
        title: item.title,
        id: item.id,
        location: item.location,
      })),
    );
    let flattenedItems = [];
    items.forEach((item) => {
      flattenedItems.push(...item);
    });
    return flattenedItems;
  }
}

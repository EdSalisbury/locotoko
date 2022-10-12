import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EbayOrderService {
  constructor(private ebay: EbayService, private prisma: PrismaService) {}

  transactionMap = (transaction) => ({
    title: transaction.Item.Title,
    ebayItemId: transaction.Item.ItemID,
    price: transaction.TransactionPrice.value,
    quantity: transaction.QuantityPurchased,
    salesTax: transaction.Taxes?.TotalTaxAmount?.value,
    extended:
      transaction.QuantityPurchased * transaction.TransactionPrice.value,
  });

  orderMap = (order) => ({
    id: order.OrderID,
    name: order.ShippingAddress.Name,
    address: order.ShippingAddress,
    subtotal: order.Subtotal.value,
    items: order.TransactionArray.Transaction.map(this.transactionMap),
    shippingMethod: order.ShippingServiceSelected.ShippingService,
    shippingCost:
      order.ShippingServiceSelected.ShippingServiceCost.value.toFixed(2),
    paidTime: order.PaidTime,
  });

  async getEbayOrders() {
    let pageNumber = 1;
    let maxPages = 1;

    let request = {
      NumberOfDays: 4,
      OrderRole: "Seller",
      // OutputSelector: [
      //   "PaginationResult.TotalNumberOfPages",
      //   "OrderArray.Order.OrderID",
      //   "OrderArray.Order.TransactionArray.Transaction.ShippedTime",
      // ],
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
    return (
      orders
        // .filter(
        //   (order) =>
        //     order.TransactionArray.Transaction[0].ShippedTime === undefined,
        // )
        .map(this.orderMap)
    );
  }

  async getEbayOrder(orderId: string) {
    let request = {
      OrderIDArray: {
        OrderID: orderId,
      },
      DetailLevel: "ReturnAll",
      OrderRole: "Seller",
    };

    const response = await this.ebay.trading.GetOrders(request);
    const order = response.OrderArray.Order.map(this.orderMap)[0];

    let taxes = 0;
    let total = 0;

    for (let i = 0; i < order.items.length; i++) {
      const item = await this.prisma.item.findFirst({
        select: { id: true, location: true },
        where: { ebayListingId: order.items[i].ebayItemId.toString() },
      });
      if (item) {
        order.items[i].id = item.id;
        order.items[i].location = item.location;
      }
      taxes += order.items[i].salesTax;
      total += order.items[i].extended;
      total += taxes;
    }
    order.salesTax = taxes.toFixed(2);
    order.total = total.toFixed(2);
    return order;
  }
}

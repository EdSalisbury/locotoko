import { Injectable } from "@nestjs/common";
import { EbayService } from "../ebay/ebay.service";
import { PrismaService } from "../prisma/prisma.service";
import { decodeSpecialCharsInObject } from "src/util";
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
    shippingMethod: this.shippingMethod(
      order.ShippingServiceSelected.ShippingService,
    ),
    shippingCost: order.ShippingServiceSelected.ShippingServiceCost.value,
    paidTime: order.PaidTime,
  });

  orderTotal = async (order) => {
    let taxes = 0.0;
    let total = 0.0;

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
    order.salesTax = taxes;
    order.total = total;
    return order;
  };

  shippingMethod = (method) => {
    if (method === "USPSFirstClass") return "USPS First Class";
    if (method === "USPSPriority") return "USPS Priority";
    return method;
  };

  async getEbayOrders(numberOfDays = 4) {
    let pageNumber = 1;
    let maxPages = 1;
    if (numberOfDays > 30) {
      numberOfDays = 30;
    }
    let request = {
      NumberOfDays: numberOfDays,
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

    return decodeSpecialCharsInObject(
      await Promise.all(
        orders
          .filter(
            (order) =>
              order.TransactionArray.Transaction[0].ShippedTime === undefined,
          )
          .map(this.orderMap)
          .map(this.orderTotal),
      ),
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
    return decodeSpecialCharsInObject(
      await response.OrderArray.Order.map(this.orderMap).map(
        this.orderTotal,
      )[0],
    );
  }
}

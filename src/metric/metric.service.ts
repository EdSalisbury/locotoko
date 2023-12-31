import { Injectable } from "@nestjs/common";
import { ItemService } from "../item/item.service";
import { AcquisitionService } from "../acquisition/acquisition.service";
import { OwnerService } from "../owner/owner.service";

@Injectable()
export class MetricService {
  constructor(
    private itemService: ItemService,
    private acquisitionService: AcquisitionService,
    private ownerService: OwnerService,
  ) {}

  cacheTimeoutMinutes = 5;
  cache = {};
  cacheTime = new Date();

  getLocalDate(date) {
    const getYear = date.toLocaleString("default", { year: "numeric" });
    const getMonth = date.toLocaleString("default", { month: "2-digit" });
    const getDay = date.toLocaleString("default", { day: "2-digit" });
    return getYear + "-" + getMonth + "-" + getDay;
  }

  async getMetricData() {
    let listedDates = {};
    let createdDates = {};
    let soldDates = {};

    let currentDrafts = 0;
    let totalSales = 0;

    let items = await this.itemService.getItems();
    for (let item of items) {
      if (item.listedAt) {
        const listedDate = this.getLocalDate(item.listedAt);
        if (!(listedDate in listedDates)) {
          listedDates[listedDate] = {};
          listedDates[listedDate].count = 0;
          listedDates[listedDate].amount = 0.0;
        }
        listedDates[listedDate].count++;
        listedDates[listedDate].amount += parseFloat(item.price);
      }

      if (item.soldAt) {
        const soldDate = this.getLocalDate(item.soldAt);
        if (!(soldDate in soldDates)) {
          soldDates[soldDate] = {};
          soldDates[soldDate].count = 0;
          soldDates[soldDate].amount = 0.0;
        }
        soldDates[soldDate].count++;
        totalSales += parseFloat(item.soldPrice);
        soldDates[soldDate].amount += parseFloat(item.soldPrice);
      }

      if (item.createdAt) {
        const createdDate = this.getLocalDate(item.createdAt);
        if (!(createdDate in createdDates)) {
          createdDates[createdDate] = {};
          createdDates[createdDate].count = 0;
          createdDates[createdDate].amount = 0.0;
        }
        createdDates[createdDate].count++;
        createdDates[createdDate].amount += parseFloat(item.price);
      }

      if (item.createdAt && !item.listedAt && !item.soldAt && item.ready) {
        currentDrafts++;
      }
    }

    const now = new Date();
    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    let dates = this.getDatesInRange(oneYearAgo, now);

    let newEbayListings = [];
    let newDrafts = [];
    let newSales = [];
    let newEbayListingAmounts = [];
    let newDraftAmounts = [];
    let newSalesAmounts = [];

    for (let date of dates) {
      let listedMetric = { x: date, y: 0 };
      let listedAmountMetric = { x: date, y: 0 };
      if (date in listedDates) {
        listedMetric = { x: date, y: listedDates[date].count };
        listedAmountMetric = { x: date, y: listedDates[date].amount };
      }
      newEbayListings.push(listedMetric);
      newEbayListingAmounts.push(listedAmountMetric);

      let createdMetric = { x: date, y: 0 };
      let createdAmountMetric = { x: date, y: 0 };
      if (date in createdDates) {
        createdMetric = { x: date, y: createdDates[date].count };
        createdAmountMetric = { x: date, y: createdDates[date].amount };
      }
      newDrafts.push(createdMetric);
      newDraftAmounts.push(createdAmountMetric);

      let soldMetric = { x: date, y: 0 };
      let soldAmountMetric = { x: date, y: 0 };
      if (date in soldDates) {
        soldMetric = { x: date, y: soldDates[date].count };
        soldAmountMetric = { x: date, y: soldDates[date].amount };
      }
      newSales.push(soldMetric);
      newSalesAmounts.push(soldAmountMetric);
    }

    const data = {
      currentDrafts: currentDrafts,
      createdToday: newDrafts.slice(-1)[0].y,
      listedToday: newEbayListings.slice(-1)[0].y,
      soldToday: newSales.slice(-1)[0].y,
      newDrafts: newDrafts,
      newEbayListings: newEbayListings,
      newSales: newSales,
      newEbayListingAmounts: newEbayListingAmounts,
      newDraftAmounts: newDraftAmounts,
      newSalesAmounts: newSalesAmounts,
    };

    this.cache = data;
    this.cacheTime = new Date();
    return data;
  }

  async getMetrics() {
    const rightNow = new Date();
    if (
      Math.floor((+rightNow - +this.cacheTime) / 1000) / 60 >
      this.cacheTimeoutMinutes
    ) {
      // Send the cached data, then clear it
      const data = this.cache;
      this.cache = {};
      this.getMetricData(); // Not async so that it will happen in the background
      return data;
    } else if (Object.keys(this.cache).length > 0) {
      return this.cache;
    }

    return this.getMetricData();
  }

  getDatesInRange(startDate, endDate) {
    let date = new Date(startDate.getTime());
    let dates = [];
    while (date <= endDate) {
      dates.push(this.getLocalDate(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }
}

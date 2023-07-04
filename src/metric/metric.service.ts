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

  getLocalDate(date) {
    const getYear = date.toLocaleString("default", { year: "numeric" });
    const getMonth = date.toLocaleString("default", { month: "2-digit" });
    const getDay = date.toLocaleString("default", { day: "2-digit" });
    return getYear + "-" + getMonth + "-" + getDay;
  }

  async getMetrics() {
    let listedDates = {};
    let createdDates = {};
    let soldDates = {};
    let currentDrafts = 0;

    let items = await this.itemService.getItems();
    for (let item of items) {
      if (item.listedAt) {
        const listedDate = this.getLocalDate(item.listedAt);
        if (!(listedDate in listedDates)) {
          listedDates[listedDate] = 0;
        }
        listedDates[listedDate]++;
      }

      if (item.soldAt) {
        const soldDate = this.getLocalDate(item.soldAt);
        if (!(soldDate in soldDates)) {
          soldDates[soldDate] = 0;
        }
        soldDates[soldDate]++;
      }

      if (item.createdAt) {
        const createdDate = this.getLocalDate(item.createdAt);
        if (!(createdDate in createdDates)) {
          createdDates[createdDate] = 0;
        }
        createdDates[createdDate]++;
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

    for (let date of dates) {
      let listedMetric = { x: date, y: 0 };
      if (date in listedDates) {
        listedMetric = { x: date, y: listedDates[date] };
      }
      newEbayListings.push(listedMetric);

      let createdMetric = { x: date, y: 0 };
      if (date in createdDates) {
        createdMetric = { x: date, y: createdDates[date] };
      }
      newDrafts.push(createdMetric);

      let soldMetric = { x: date, y: 0 };
      if (date in soldDates) {
        soldMetric = { x: date, y: soldDates[date] };
      }
      newSales.push(soldMetric);
    }

    return {
      currentDrafts: currentDrafts,
      createdToday: newDrafts.slice(-1)[0].y,
      listedToday: newEbayListings.slice(-1)[0].y,
      soldToday: newSales.slice(-1)[0].y,
      newDrafts: newDrafts,
      newEbayListings: newEbayListings,
      newSales: newSales,
    };
  }

  getDatesInRange(startDate, endDate) {
    console.log("endDate = " + endDate);
    let date = new Date(startDate.getTime());
    let dates = [];
    while (date <= endDate) {
      dates.push(this.getLocalDate(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  async getInventory() {
    let items = await this.itemService.getActiveItems();
    let totalItems = 0;
    let totalValue = 0;

    items = items.filter((item) => !item.soldAt && !item.endedAt);

    let acquisitions = {};
    const allAcquisitions = await this.acquisitionService.getAcquisitions();
    for (const acquisition of allAcquisitions) {
      const thisAcquisition = await this.acquisitionService.getAcquisition(
        acquisition.id,
      );
      acquisitions[acquisition.id] = thisAcquisition;
    }

    let owners = {};
    const allOwners = await this.ownerService.getOwners();
    for (const owner of allOwners) {
      owners[owner.id] = owner;
    }

    let csv = "";
    for (const item of items) {
      const acquisition = acquisitions[item.acquisitionId];
      const owner = owners[item.ownerId];
      const fields = [
        item.id,
        item.title.replaceAll('"', ""),
        item.quantity,
        owner.name || "Unknown",
        acquisition ? acquisition.name : "None",
        acquisition ? acquisition.costPerItem : "0.00",

        item.price.toFixed(2),
      ];
      csv += '"' + fields.join('","') + '"' + "<br />\n";
    }

    return csv;
  }
}
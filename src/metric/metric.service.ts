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

  async getMetrics() {
    let listedDates = {};
    let items = await this.itemService.getActiveItems();
    for (let item of items) {
      if (item.listedAt) {
        const date = item.listedAt.toISOString().split("T")[0];
        if (!(date in listedDates)) {
          listedDates[date] = 0;
        }
        listedDates[date]++;
      }
    }

    const now = new Date();
    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    let dates = this.getDatesInRange(oneYearAgo, now);

    let output = [];

    for (let date of dates) {
      let metric = { x: new Date(date), y: 0 };
      if (date in listedDates) {
        metric = { x: new Date(date), y: listedDates[date] };
      }
      output.push(metric);
    }
    return {
      newEbayListings: output,
    };
  }

  getDatesInRange(startDate, endDate) {
    let date = new Date(startDate.getTime());
    let dates = [];
    while (date <= endDate) {
      dates.push(date.toISOString().split("T")[0]);
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

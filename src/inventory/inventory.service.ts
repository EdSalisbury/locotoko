import { Injectable } from "@nestjs/common";
import { ItemService } from "../item/item.service";
import { AcquisitionService } from "../acquisition/acquisition.service";
import { OwnerService } from "../owner/owner.service";

@Injectable()
export class InventoryService {
  constructor(
    private itemService: ItemService,
    private acquisitionService: AcquisitionService,
    private ownerService: OwnerService,
  ) {}

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

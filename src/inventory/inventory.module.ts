import { Module } from "@nestjs/common";
import { ItemService } from "../item/item.service";
import { InventoryService } from "./inventory.service";
import { InventoryController } from "./inventory.controller";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";
import { AcquisitionService } from "../acquisition/acquisition.service";
import { OwnerService } from "../owner/owner.service";

@Module({
  providers: [
    ItemService,
    InventoryService,
    EbayCategoryService,
    AcquisitionService,
    OwnerService,
  ],
  controllers: [InventoryController],
})
export class InventoryModule {}

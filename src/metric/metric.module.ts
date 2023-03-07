import { Module } from "@nestjs/common";
import { ItemService } from "../item/item.service";
import { MetricService } from "./metric.service";
import { MetricController } from "./metric.controller";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";
import { AcquisitionService } from "../acquisition/acquisition.service";
import { OwnerService } from "../owner/owner.service";

@Module({
  providers: [
    ItemService,
    MetricService,
    EbayCategoryService,
    AcquisitionService,
    OwnerService,
  ],
  controllers: [MetricController],
})
export class MetricModule {}

import { Module } from "@nestjs/common";
import { ItemService } from "./item.service";
import { ItemController } from "./item.controller";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";

@Module({
  providers: [ItemService, EbayCategoryService],
  controllers: [ItemController],
})
export class ItemModule {}

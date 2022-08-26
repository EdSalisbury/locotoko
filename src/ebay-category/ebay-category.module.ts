import { Module } from "@nestjs/common";
import { EbayCategoryController } from "./ebay-category.controller";
import { EbayCategoryService } from "./ebay-category.service";

@Module({
  controllers: [EbayCategoryController],
  providers: [EbayCategoryService],
  exports: [EbayCategoryService],
})
export class EbayCategoryModule {}

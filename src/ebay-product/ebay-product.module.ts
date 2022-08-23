import { Module } from '@nestjs/common';
import { EbayProductController } from './ebay-product.controller';
import { EbayProductService } from "./ebay-product.service";

@Module({
  controllers: [EbayProductController],
  providers: [EbayProductService],
})
export class EbayProductModule {}

import { Module } from '@nestjs/common';
import { EbayListingController } from './ebay-listing.controller';

@Module({
  controllers: [EbayListingController]
})
export class EbayListingModule {}

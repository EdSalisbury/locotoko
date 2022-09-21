import { Module } from '@nestjs/common';
import { EbayItemTransactionController } from './ebay-item-transaction.controller';
import { EbayItemTransactionService } from './ebay-item-transaction.service';

@Module({
  controllers: [EbayItemTransactionController],
  providers: [EbayItemTransactionService],
})
export class EbayItemTransactionModule {}

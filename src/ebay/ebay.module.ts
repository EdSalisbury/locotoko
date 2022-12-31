import { Global, Module } from "@nestjs/common";
import { EbayService } from "./ebay.service";
import { EbayController } from "./ebay.controller";

@Global()
@Module({
  controllers: [EbayController],
  providers: [EbayService],
  exports: [EbayService],
})
export class EbayModule {}

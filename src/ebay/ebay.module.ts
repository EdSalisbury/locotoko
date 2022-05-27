import { Global, Module } from "@nestjs/common";
import { EbayService } from "./ebay.service";
import { EbayController } from "./ebay.controller";

@Global()
@Module({
  providers: [EbayService],
  exports: [EbayService],
  controllers: [EbayController],
})
export class EbayModule {}

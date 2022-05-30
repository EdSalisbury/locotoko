import { Global, Module } from "@nestjs/common";
import { EbayService } from "./ebay.service";

@Global()
@Module({
  providers: [EbayService],
  exports: [EbayService],
})
export class EbayModule {}

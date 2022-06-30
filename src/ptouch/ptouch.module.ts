import { Global, Module } from "@nestjs/common";
import { PtouchService } from "./ptouch.service";

@Global()
@Module({
  providers: [PtouchService],
  exports: [PtouchService],
})
export class PtouchModule {}

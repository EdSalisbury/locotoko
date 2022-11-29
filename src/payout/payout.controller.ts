import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";

import { JwtGuard } from "../auth/guard";
import { PayoutService } from "./payout.service";
import { CreatePayoutDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("Payouts")
export class PayoutController {
  constructor(private payoutService: PayoutService) {}

  @Get()
  getPayouts() {
    return this.payoutService.getPayouts();
  }

  @Get(":id")
  getPayout(@Param("id") payoutId: string) {
    return this.payoutService.getPayout(payoutId);
  }

  @Post()
  createPayout(@Body() dto: CreatePayoutDto) {
    return this.payoutService.createPayout(dto);
  }
}

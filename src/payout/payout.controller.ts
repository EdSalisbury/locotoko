import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "../auth/decorator";
import { JwtGuard } from "../auth/guard";
import { PayoutService } from "./payout.service";
import { CreatePayoutDto, EditPayoutDto } from "./dto";

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

  @Patch(":id")
  editPayout(@Param("id") payoutId: string, @Body() dto: EditPayoutDto) {
    return this.payoutService.editPayout(payoutId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deletePayout(@Param("id") payoutId: string) {
    return this.payoutService.deletePayout(payoutId);
  }
}

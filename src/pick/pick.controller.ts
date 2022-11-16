import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { PickService } from "./pick.service";

@Controller("picks")
@UseGuards(JwtGuard)
export class PickController {
  constructor(private pickService: PickService) {}
  @Get("")
  getPicks() {
    return this.pickService.getPicks();
  }
}

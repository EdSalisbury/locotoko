import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Post,
  UseGuards,
} from "@nestjs/common";

import { JwtGuard } from "../auth/guard";
import { InventoryService } from "./inventory.service";

@UseGuards(JwtGuard)
@Controller("Inventory")
export class InventoryController {
  constructor(private metricService: InventoryService) {}

  @Get()
  getInventory() {
    return this.metricService.getInventory();
  }
}

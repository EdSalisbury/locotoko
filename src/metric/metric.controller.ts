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
import { MetricService } from "./metric.service";

@UseGuards(JwtGuard)
@Controller('Metrics')
export class MetricController {
  constructor(private metricService: MetricService) {}

  @Get()
  getMetrics() {
    return this.metricService.getMetrics();
  }

}

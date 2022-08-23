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

import { JwtGuard } from "../auth/guard";
import { AcquisitionService } from "./acquisition.service";
import { CreateAcquisitionDto, EditAcquisitionDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("Acquisitions")
export class AcquisitionController {
  constructor(private acquisitionService: AcquisitionService) {}

  @Get()
  getAcquisitions() {
    return this.acquisitionService.getAcquisitions();
  }

  @Get(":id")
  getAcquisition(@Param("id") acquisitionId: string) {
    return this.acquisitionService.getAcquisition(acquisitionId);
  }

  @Post()
  createAcquisition(@Body() dto: CreateAcquisitionDto) {
    return this.acquisitionService.createAcquisition(dto);
  }

  @Patch(":id")
  editAcquisition(@Param("id") acquisitionId: string, @Body() dto: EditAcquisitionDto) {
    return this.acquisitionService.editAcquisition(acquisitionId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteAcquisition(@Param("id") acquisitionId: string) {
    return this.acquisitionService.deleteAcquisition(acquisitionId);
  }
}

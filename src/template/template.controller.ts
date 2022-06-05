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
import { TemplateService } from "./template.service";
import {
  CreateTemplateDto,
  EditTemplateDto,
} from "./dto";

@UseGuards(JwtGuard)
@Controller("Templates")
export class TemplateController {
  constructor(
    private templateService: TemplateService,
  ) {}

  @Get()
  getTemplates() {
    return this.templateService.getTemplates();
  }

  @Get(":id")
  getTemplate(@Param("id") templateId: string) {
    return this.templateService.getTemplate(
      templateId,
    );
  }

  @Post()
  createTemplate(@Body() dto: CreateTemplateDto) {
    return this.templateService.createTemplate(
      dto,
    );
  }

  @Patch(":id")
  editTemplate(
    @Param("id") templateId: string,
    @Body() dto: EditTemplateDto,
  ) {
    return this.templateService.editTemplate(
      templateId,
      dto,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteTemplate(
    @Param("id") templateId: string,
  ) {
    return this.templateService.deleteTemplate(
      templateId,
    );
  }
}

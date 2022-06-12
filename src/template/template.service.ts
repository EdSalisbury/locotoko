import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateTemplateDto, EditTemplateDto } from "./dto";

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService, private ebay: EbayService) {}

  getTemplates() {
    return this.prisma.template.findMany();
  }

  getTemplate(templateId: string) {
    return this.prisma.template.findUnique({
      where: { id: templateId },
    });
  }

  async getConditions(categoryId: number) {
    if (categoryId === 0) {
      return "";
    }
    const features = await this.ebay.trading.GetCategoryFeatures({
      DetailLevel: "ReturnAll",
      CategoryID: categoryId,
    });
    return JSON.stringify(features.Category.ConditionValues.Condition);
  }

  async createTemplate(dto: CreateTemplateDto) {
    const conditions = await this.getConditions(dto.ebayCategoryId);

    const template = await this.prisma.template.create({
      data: {
        ...dto,
        conditions: conditions,
      },
    });
    return template;
  }

  async editTemplate(templateId: string, dto: EditTemplateDto) {
    // get the Template by id
    const template = await this.prisma.template.findUnique({
      where: {
        id: templateId,
      },
    });

    // Throw if the template doesn't exist
    if (!template) {
      throw new NotFoundException();
    }

    const conditions = await this.getConditions(dto.ebayCategoryId);

    return this.prisma.template.update({
      where: {
        id: templateId,
      },
      data: {
        ...dto,
        conditions: conditions,
      },
    });
  }

  async deleteTemplate(templateId: string) {
    // get the template by id
    const template = await this.prisma.template.findUnique({
      where: {
        id: templateId,
      },
    });

    // Throw if the Template doesn't exist
    if (!template) {
      throw new NotFoundException();
    }

    return this.prisma.template.delete({
      where: {
        id: templateId,
      },
    });
  }
}

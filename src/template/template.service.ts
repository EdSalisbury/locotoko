import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateTemplateDto,
  EditTemplateDto,
} from "./dto";

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  getTemplates() {
    return this.prisma.template.findMany();
  }

  getTemplate(templateId: string) {
    return this.prisma.template.findUnique({
      where: { id: templateId },
    });
  }

  async createTemplate(dto: CreateTemplateDto) {
    const template =
      await this.prisma.template.create({
        data: {
          ...dto,
        },
      });
    return template;
  }

  async editTemplate(
    templateId: string,
    dto: EditTemplateDto,
  ) {
    // get the Template by id
    const template =
      await this.prisma.template.findUnique({
        where: {
          id: templateId,
        },
      });

    // Throw if the template doesn't exist
    if (!template) {
      throw new NotFoundException();
    }

    return this.prisma.template.update({
      where: {
        id: templateId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteTemplate(templateId: string) {
    // get the template by id
    const template =
      await this.prisma.template.findUnique({
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

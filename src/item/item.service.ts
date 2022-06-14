import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateItemDto, EditItemDto } from "./dto";

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async getItems() {
    const templates = await this.prisma.template.findMany();

    const items = await this.prisma.item.findMany();
    return items.map(({ templateId, images, ...rest }) => ({
      ...rest,
      templateName:
        templates.find((template) => templateId === template.id).name || "",
    }));
  }

  getItemById(itemId: string) {
    return this.prisma.item.findUnique({
      where: { id: itemId },
    });
  }

  async createItem(dto: CreateItemDto) {
    const listingUser = await this.prisma.user.findUnique({
      where: {
        id: dto.listingUserId,
      },
    });

    if (!listingUser) {
      throw new BadRequestException();
    }

    const owner = await this.prisma.owner.findUnique({
      where: {
        id: dto.ownerId,
      },
    });

    if (!owner) {
      throw new BadRequestException();
    }

    if (dto.shippingUserId) {
      const shippingUser = await this.prisma.user.findUnique({
        where: {
          id: dto.shippingUserId,
        },
      });
      if (!shippingUser) {
        throw new BadRequestException();
      }
    }

    const item = await this.prisma.item.create({
      data: {
        ...dto,
      },
    });
    return item;
  }

  async editItemById(itemId: string, dto: EditItemDto) {
    // get the Item by id
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    // Throw if the item doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    return this.prisma.item.update({
      where: {
        id: itemId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteItemById(itemId: string) {
    // get the item by id
    const item = await this.prisma.item.findUnique({
      where: {
        id: itemId,
      },
    });

    // Throw if the Item doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    return this.prisma.item.delete({
      where: {
        id: itemId,
      },
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CategoryType } from "ebay-api/lib/enums";
import { PrismaService } from "../prisma/prisma.service";
import { CreateItemDto, EditItemDto } from "./dto";

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async getItems() {
    const categories = await this.prisma.ebayCategory.findMany();

    const items = await this.prisma.item.findMany();
    return items.map(({ ebayCategoryId, images, ...rest }) => ({
      ...rest,
      ebayCategoryName:
        categories.find((category) => ebayCategoryId === category.id).name ||
        "",
    }));
  }

  async getItemById(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    const newItem = Object(item);
    newItem.ebayCategoryName = (
      await this.prisma.ebayCategory.findUnique({
        where: { id: item.ebayCategoryId },
      })
    ).name;
    return item;
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

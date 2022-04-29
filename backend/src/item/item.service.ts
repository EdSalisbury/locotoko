import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateItemDto,
  EditItemDto,
} from "./dto";

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}
  
  getItems() {
    return this.prisma.item.findMany();
  }

  getItemById(
    itemId: string,
  ) {
    return this.prisma.item.findUnique({
      where: {id: itemId },
    });
  }

  async createItem(
    dto: CreateItemDto,
  ) {
    const item =
      await this.prisma.item.create({
        data: {
          ...dto,
        },
      });
    return item;
  }

  async editItemById(
    itemId: string,
    dto: EditItemDto,
  ) {
    // get the Item by id
    const item =
      await this.prisma.item.findUnique({
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

  async deleteItemById(
    itemId: string,
  ) {
    // get the item by id
    const item =
      await this.prisma.item.findUnique({
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

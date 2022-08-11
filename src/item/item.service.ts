import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PtouchService } from "../ptouch/ptouch.service";
import { ConfigService } from "@nestjs/config";
import { CreateItemDto, EditItemDto } from "./dto";

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private ptouch: PtouchService,
    private config: ConfigService,
  ) {}

  async getItems() {
    const categories = await this.prisma.ebayCategory.findMany();

    const items = await this.prisma.item.findMany({
      select: {
        id: true,
        title: true,
        ebayCategoryId: true,
        ebayListingId: true,
        ownerId: true,
        listingUserId: true,
        location: true,
        quantity: true,
        updatedAt: true,
        price: true,
      },
    });
    return items.map((item) => ({
      ...item,
      ebayCategoryName:
        categories
          .find((category) => item.ebayCategoryId === category.id)
          .name.replaceAll("&amp;", "&") || "",
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
    ).name.replaceAll("&amp;", "&");
    return item;
  }

  async printItemLabel(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });
    // Throw if the item doesn't exist
    if (!item) {
      throw new NotFoundException();
    }

    const base_url = this.config.get("VUE_APP_API_BASE_URL");
    const url = `${base_url}/viewItem/${item.id}`;
    this.ptouch.printItemLabel(url, item.id, item.title);
  }

  async createItem(dto: CreateItemDto) {
    const listingUser = await this.prisma.user.findUnique({
      where: {
        id: dto.listingUserId,
      },
    });

    if (!listingUser) {
      throw new BadRequestException("Invalid listing user ID");
    }

    const owner = await this.prisma.owner.findUnique({
      where: {
        id: dto.ownerId,
      },
    });

    if (!owner) {
      throw new BadRequestException("Invalid Owner ID");
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
    try {
      const item = await this.prisma.item.create({
        data: {
          ...dto,
        },
      });
      return item;
    } catch (e) {
      console.error("Cannot create item: " + e);
      throw new BadRequestException(e);
    }
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

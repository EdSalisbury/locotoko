import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PtouchService } from "../ptouch/ptouch.service";
import { ConfigService } from "@nestjs/config";
import { CreateItemDto, EditItemDto } from "./dto";
import { decodeSpecialChars } from "../util";
import { EbayCategoryService } from "../ebay-category/ebay-category.service";

@Injectable()
export class ItemService {
  itemSelection = {
    id: true,
    title: true,
    ebayCategoryId: true,
    ebayListingId: true,
    ownerId: true,
    listingUserId: true,
    location: true,
    quantity: true,
    quantitySold: true,
    soldAt: true,
    updatedAt: true,
    createdAt: true,
    price: true,
    currentPrice: true,
  };

  categories = [];

  categoryMap = (item) => ({
    ...item,
    ebayCategoryName: decodeSpecialChars(
      this.categories.find((category) => item.ebayCategoryId === category.id)
        .name || "",
    ),
  });

  constructor(
    private prisma: PrismaService,
    private ptouch: PtouchService,
    private config: ConfigService,
    private cat: EbayCategoryService,
  ) {}

  async getCategories() {
    if (this.categories.length === 0) {
      this.categories = await this.cat.getCategories();
    }
  }

  async getSoldItems() {
    await this.getCategories();
    const items = await this.prisma.item.findMany({
      select: this.itemSelection,
      where: {
        quantitySold: {
          gt: 0,
        },
      },
    });
    return items.map(this.categoryMap);
  }

  async getActiveItems() {
    await this.getCategories();
    const items = await this.prisma.item.findMany({
      select: this.itemSelection,
    });

    return items
      .filter((item) => item.quantitySold < item.quantity)
      .map(this.categoryMap);
  }

  async getItems() {
    await this.getCategories();
    const items = await this.prisma.item.findMany({
      select: this.itemSelection,
    });

    return items.map(this.categoryMap);
  }

  async getItemById(itemId: string) {
    try {
      const item = await this.prisma.item.findUnique({
        where: { id: itemId },
      });
      const newItem = Object(item);
      newItem.ebayCategoryName = (
        await this.cat.getCategory(item.ebayCategoryId)
      ).name;

      return item;
    } catch {
      throw new NotFoundException();
    }
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

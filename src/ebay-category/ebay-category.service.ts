import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";

@Injectable()
export class EbayCategoryService {
  constructor(private prisma: PrismaService, private ebay: EbayService) {}

  async refreshCategories() {
    const data = await this.ebay.trading.GetCategories({
      detailLevel: "ReturnAll",
      viewAllNodes: true,
    });
    for (const category of data.CategoryArray.Category) {
      await this.prisma.ebayCategory.upsert({
        where: {
          id: category.CategoryID,
        },
        update: {
          name: category.CategoryName.toString(),
          parentId: category.CategoryParentID,
          leaf: category.LeafCategory,
          level: category.CategoryLevel,
        },
        create: {
          name: category.CategoryName.toString(),
          id: category.CategoryID,
          parentId: category.CategoryParentID,
          leaf: category.LeafCategory,
          level: category.CategoryLevel,
        },
      });
    }
  }
  async getCategories() {
    const categories = await this.prisma.ebayCategory.findMany();
    return categories
      .map((cat) => ({
        ...cat,
        name: cat.name.replaceAll("&amp;", "&"),
      }))
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }
}

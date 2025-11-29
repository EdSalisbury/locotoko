import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { decodeSpecialChars } from "../util";
@Injectable()
export class EbayCategoryService {
  constructor(private prisma: PrismaService, private ebay: EbayService) {}

  async refreshCategories() {
    const data = await this.ebay.trading.GetCategories({
      detailLevel: "ReturnAll",
      viewAllNodes: true,
    });
    const categories = Array.isArray(data.CategoryArray.Category)
      ? data.CategoryArray.Category
      : [data.CategoryArray.Category];
    for (const category of categories) {
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
        name: decodeSpecialChars(cat.name),
      }))
      .sort((a, b) => (a.name > b.name ? 1 : -1));
  }

  async getCategory(categoryId: number) {
    let category = await this.prisma.ebayCategory.findUnique({
      where: { id: categoryId },
    });
    category.name = decodeSpecialChars(category.name);
    return category;
  }
}

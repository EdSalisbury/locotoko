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
    return categories;

    let categoryList = [];
    let output = [];

    for (const category of categories) {
      categoryList[category.id] = category;
    }

    const keys = Object.keys(categoryList);

    for (let id of keys) {
      let name = categoryList[id].name;
      let catId = id;

      while (parseInt(id) != categoryList[id].parentId) {
        name = categoryList[categoryList[id].parentId].name + " > " + name;

        id = categoryList[id].parentId;
      }

      const cat = {
        name: name.replaceAll("&amp;", "&"),
        id: parseInt(catId),
      };
      output.push(cat);
    }

    output.sort((a, b) => (a.name > b.name ? 1 : -1));

    return output.filter((category) => category.name.includes("Comic"));
    //return output;
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateCategoriesDto } from "./dto";
import ebayApi from "ebay-api";

import { PrismaService } from "../prisma/prisma.service";

async function sleep(seconds: number) {
  await new Promise((resolve) =>
    setTimeout(resolve, seconds * 1000),
  );
}
@Injectable()
export class EbayService {
  ebay: ebayApi;

  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.ebay = ebayApi.fromEnv();
  }

  async refreshCategories() {
    const data =
      await this.ebay.trading.GetCategories({
        detailLevel: "ReturnAll",
        viewAllNodes: true,
      });
    for (const category of data.CategoryArray
      .Category) {
      await this.prisma.ebayCategory.upsert({
        where: {
          id: category.CategoryID,
        },
        update: {
          name: category.CategoryName.toString(),
          parentId: category.CategoryParentID,
        },
        create: {
          name: category.CategoryName.toString(),
          id: category.CategoryID,
          parentId: category.CategoryParentID,
        },
      });
    }
  }
  async getCategories() {
    const categories =
      await this.prisma.ebayCategory.findMany();

    let categoryList = [];
    let output = [];

    for (const category of categories) {
      categoryList[category.id] = category;
    }

    const keys = Object.keys(categoryList);

    for (let id of keys) {
      let name = categoryList[id].name;
      let catId = id;

      while (
        parseInt(id) != categoryList[id].parentId
      ) {
        name =
          categoryList[categoryList[id].parentId]
            .name +
          " > " +
          name;

        id = categoryList[id].parentId;
      }

      const cat = {
        name: name,
        id: parseInt(catId),
      };
      output.push(cat);
    }

    output.sort((a, b) =>
      a.name > b.name ? 1 : -1,
    );
    return output;
  }
}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateCategoriesDto } from "./dto";
import ebayApi from "ebay-api";

import { PrismaService } from "../prisma/prisma.service";

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
}

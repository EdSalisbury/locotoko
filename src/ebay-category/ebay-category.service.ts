import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { decodeSpecialChars } from "../util";

interface CategoryTreeNode {
  category: {
    categoryId: string;
    categoryName: string;
  };
  categoryTreeNodeLevel: number;
  leafCategoryTreeNode?: boolean;
  childCategoryTreeNodes?: CategoryTreeNode[];
}

interface CategorySubtree {
  categorySubtreeNode: CategoryTreeNode;
}

@Injectable()
export class EbayCategoryService {
  private ebayApiBaseUrl = "https://api.ebay.com";

  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async refreshCategories() {
    try {
      const accessToken = await this.getAccessToken();
      const categoryTreeId = await this.getCategoryTreeId(accessToken);
      const subtree = await this.getCategorySubtree(
        accessToken,
        categoryTreeId,
        "0"
      );

      const categories = this.flattenCategoryTree(subtree.categorySubtreeNode);

      for (const category of categories) {
        await this.prisma.ebayCategory.upsert({
          where: {
            id: parseInt(category.categoryId),
          },
          update: {
            name: category.categoryName,
            parentId: category.parentId || null,
            leaf: category.leaf,
            level: category.level,
          },
          create: {
            name: category.categoryName,
            id: parseInt(category.categoryId),
            parentId: category.parentId || null,
            leaf: category.leaf,
            level: category.level,
          },
        });
      }
    } catch (error) {
      console.error("❌ eBay Taxonomy API Error:", {
        errorMessage: error?.message,
        errorResponse: error?.response?.data || error?.data,
        errorStatus: error?.response?.status,
        errorStack: error?.stack,
      });
      throw error;
    }
  }

  private flattenCategoryTree(
    node: CategoryTreeNode,
    parentId?: number
  ): Array<{
    categoryId: string;
    categoryName: string;
    parentId: number | null;
    leaf: boolean;
    level: number;
  }> {
    const result = [
      {
        categoryId: node.category.categoryId,
        categoryName: node.category.categoryName,
        parentId: parentId ?? null,
        leaf: node.leafCategoryTreeNode ?? false,
        level: node.categoryTreeNodeLevel,
      },
    ];

    if (node.childCategoryTreeNodes && node.childCategoryTreeNodes.length > 0) {
      for (const child of node.childCategoryTreeNodes) {
        result.push(
          ...this.flattenCategoryTree(child, parseInt(node.category.categoryId))
        );
      }
    }

    return result;
  }

  private async getCategoryTreeId(accessToken: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.ebayApiBaseUrl}/commerce/taxonomy/v1/get_default_category_tree_id`,
        {
          params: {
            marketplace_id: "EBAY_US",
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.categoryTreeId;
    } catch (error) {
      console.error("❌ Failed to get category tree ID:", {
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
      });
      throw error;
    }
  }

  private async getCategorySubtree(
    accessToken: string,
    categoryTreeId: string,
    categoryId: string
  ): Promise<CategorySubtree> {
    try {
      const response = await axios.get(
        `${this.ebayApiBaseUrl}/commerce/taxonomy/v1/category_tree/${categoryTreeId}/get_category_subtree`,
        {
          params: {
            category_id: categoryId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("❌ Failed to get category subtree:", {
        categoryTreeId,
        categoryId,
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
      });
      throw error;
    }
  }

  private async getAccessToken(): Promise<string> {
    const clientId = this.config.get("EBAY_CLIENT_ID");
    const clientSecret = this.config.get("EBAY_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET");
    }

    try {
      const response = await axios.post(
        `${this.ebayApiBaseUrl}/identity/v1/oauth2/token`,
        "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
        {
          auth: {
            username: clientId,
            password: clientSecret,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error("❌ Failed to get eBay OAuth token:", {
        errorMessage: error?.message,
        errorStatus: error?.response?.status,
      });
      throw error;
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

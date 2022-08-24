import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { ProductService } from "./product.service";

@UseGuards(JwtGuard)
@Controller("products")
export class ProductController {
  constructor(private ProductService: ProductService) {}

  @Get(":upc")
  getEbayListing(@Param("upc") upc: string) {
    return this.ProductService.getProduct(upc);
  }
}

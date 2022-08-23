import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayProductService } from "./ebay-product.service";

@UseGuards(JwtGuard)
@Controller("ebayProducts")
export class EbayProductController {
  constructor(private ebayProductService: EbayProductService) {}

  @Get(":upc")
  getEbayListing(@Param("upc") upc: string) {
    return this.ebayProductService.getEbayProduct(upc);
  }
}

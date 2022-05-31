import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { EbayService } from "../ebay/ebay.service";
import { CreateEbayListingDto } from "./dto";
@Injectable()
export class EbayListingService {
  constructor(
    private prisma: PrismaService,
    private ebay: EbayService,
    private config: ConfigService,
  ) {}

  async createEbayListing(
    dto: CreateEbayListingDto,
  ) {
    return this.ebay.trading.AddItem({
      Item: {
        Title: dto.title,
        Currency: this.config.get("CURRENCY"),
        Country: this.config.get("COUNTRY"),
      },
    });
  }
}

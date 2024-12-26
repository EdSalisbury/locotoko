import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  Query,
  Param,
} from "@nestjs/common";
import { JwtGuard } from "../auth/guard";
import { EbayListingService } from "./ebay-listing.service";

import { CreateEbayListingDto, UpdateEbayListingDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("ebayListings")
export class EbayListingController {
  constructor(private ebayListingService: EbayListingService) { }

  @Post("")
  createEbayListing(@Body() dto: CreateEbayListingDto) {
    return this.ebayListingService.createEbayListing(dto);
  }

  @Get(":id")
  getEbayListing(@Param("id") itemID: string) {
    return this.ebayListingService.getEbayListing(itemID);
  }

  @Get()
  getEbayListings() {
    return this.ebayListingService.getEbayListings();
  }

  @Patch(":id")
  updateEbayListing(
    @Query("end") end: string = "false",
    @Body() dto: UpdateEbayListingDto,
  ) {
    return this.ebayListingService.updateEbayListing(
      end.toLowerCase() == "true",
      dto,
    );
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { CreateEbayListingDto } from "./dto";

@Injectable()
export class EbayListingService {
  constructor(private prisma: PrismaService) {}

  async createEbayListing(
    dto: CreateEbayListingDto,
  ) {

  }
}

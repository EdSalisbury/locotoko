import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePayoutDto } from "./dto";

@Injectable()
export class PayoutService {
  constructor(private prisma: PrismaService) {}

  getPayouts() {
    return this.prisma.payout.findMany();
  }

  getPayout(payoutId: string) {
    return this.prisma.payout.findUnique({
      where: { id: payoutId },
    });
  }

  async createPayout(dto: CreatePayoutDto) {
    const payout = await this.prisma.payout.create({
      data: {
        ...dto,
      },
    });
    return payout;
  }
}

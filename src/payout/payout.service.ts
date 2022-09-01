import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePayoutDto, EditPayoutDto } from "./dto";

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

  async editPayout(payoutId: string, dto: EditPayoutDto) {
    // get the Payout by id
    const payout = await this.prisma.payout.findUnique({
      where: {
        id: payoutId,
      },
    });

    // Throw if the payout doesn't exist
    if (!payout) {
      throw new NotFoundException();
    }

    return this.prisma.payout.update({
      where: {
        id: payoutId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deletePayout(payoutId: string) {
    // get the payout by id
    const payout = await this.prisma.payout.findUnique({
      where: {
        id: payoutId,
      },
    });

    // Throw if the Payout doesn't exist
    if (!payout) {
      throw new NotFoundException();
    }

    return this.prisma.payout.delete({
      where: {
        id: payoutId,
      },
    });
  }
}

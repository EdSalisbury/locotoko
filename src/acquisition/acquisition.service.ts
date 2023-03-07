import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAcquisitionDto, EditAcquisitionDto } from "./dto";
@Injectable()
export class AcquisitionService {
  constructor(private prisma: PrismaService) {}

  getAcquisitions() {
    return this.prisma.acquisition.findMany();
  }

  async getAcquisition(acquisitionId: string) {
    const acquisition = await this.prisma.acquisition.findUnique({
      where: { id: acquisitionId },
    });
    let acquisitions = [acquisition];
    const items = await this.prisma.item.findMany({
      where: { acquisitionId: acquisitionId },
    });

    return acquisitions.map((acquisition) => ({
      ...acquisition,
      totalItems: items.length,
      costPerItem: Number(acquisition.price) / items.length,
    }))[0];
  }

  async createAcquisition(dto: CreateAcquisitionDto) {
    const acquisition = await this.prisma.acquisition.create({
      data: {
        ...dto,
      },
    });
    return acquisition;
  }

  async editAcquisition(acquisitionId: string, dto: EditAcquisitionDto) {
    // get the Acquisition by id
    const acquisition = await this.prisma.acquisition.findUnique({
      where: {
        id: acquisitionId,
      },
    });

    // Throw if the acquisition doesn't exist
    if (!acquisition) {
      throw new NotFoundException();
    }

    return this.prisma.acquisition.update({
      where: {
        id: acquisitionId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteAcquisition(acquisitionId: string) {
    // get the acquisition by id
    const acquisition = await this.prisma.acquisition.findUnique({
      where: {
        id: acquisitionId,
      },
    });

    // Throw if the Acquisition doesn't exist
    if (!acquisition) {
      throw new NotFoundException();
    }

    return this.prisma.acquisition.delete({
      where: {
        id: acquisitionId,
      },
    });
  }
}

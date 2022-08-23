import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAcquisitionDto, EditAcquisitionDto } from "./dto";
@Injectable()
export class AcquisitionService {
  constructor(private prisma: PrismaService) {}

  getAcquisitions() {
    return this.prisma.acquisition.findMany();
  }

  getAcquisition(acquisitionId: string) {
    return this.prisma.acquisition.findUnique({
      where: { id: acquisitionId },
    });
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

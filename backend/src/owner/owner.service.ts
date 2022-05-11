import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateOwnerDto,
  EditOwnerDto,
} from "./dto";

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}
  
  getOwners() {
    return this.prisma.owner.findMany();
  }

  getOwner(
    ownerId: string,
  ) {
    return this.prisma.owner.findUnique({
      where: {id: ownerId },
    });
  }

  async createOwner(
    dto: CreateOwnerDto,
  ) {
      const owner =
      await this.prisma.owner.create({
        data: {
          ...dto,
        },
      });
    return owner;
  }

  async editOwner(
    ownerId: string,
    dto: EditOwnerDto,
  ) {
    // get the Owner by id
    const owner =
      await this.prisma.owner.findUnique({
        where: {
          id: ownerId,
        },
      });

    // Throw if the owner doesn't exist
    if (!owner) {
      throw new NotFoundException();
    }

    return this.prisma.owner.update({
      where: {
        id: ownerId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteOwner(
    ownerId: string,
  ) {
    // get the owner by id
    const owner =
      await this.prisma.owner.findUnique({
        where: {
          id: ownerId,
        },
      });

    // Throw if the Owner doesn't exist
    if (!owner) {
      throw new NotFoundException();
    }

    return this.prisma.owner.delete({
      where: {
        id: ownerId,
      },
    });
  }
}

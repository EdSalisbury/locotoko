import { Injectable } from "@nestjs/common";
import { EditUserDto } from "./dto";
import { PrismaService } from "../prisma/prisma.service";
import { PUBLIC_USER_FIELDS } from "./public-user-fields";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  getUsers() {
    return this.prisma.user.findMany({ select: PUBLIC_USER_FIELDS });
  }

  async editUser(
    userId: string,
    dto: EditUserDto,
  ) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.hash;
    return user;
  }
}

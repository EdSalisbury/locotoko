import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, LoginDto } from "./dto";
import * as argon from "argon2";
import { Prisma } from '@prisma/client';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async login(dto: LoginDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist, throw exception
    if (!user) throw new ForbiddenException("Incorrect email or password");

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);

    // if password is incorrect, throw exception
    if (!pwMatches) {
      throw new ForbiddenException("Incorrect email or password");
    }

    // send back the token for the user
    return this.signToken(user.id, user.email);
  }

  async register(dto: AuthDto) {
    // Disallow registration in production
    const env = this.config.get('NODE_ENV');
    if (env === "production") {
      throw new ForbiddenException("Registration not allowed at this time");
    }

    // Generate the password hash
    const hash = await argon.hash(dto.password);

    // Save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          hash,
        },
      });

      // send back the token for the user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ForbiddenException("Email address already in use");
        }
      }
      throw error;
    }
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ id: string; access_token: string, email: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get("JWT_SECRET");

    const token = await this.jwt.signAsync(payload, {
      expiresIn: "24h",
      secret,
    });

    return {
      id: userId,
      access_token: token,
      email: email,
    };
  }
}

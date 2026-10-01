import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto, ChangePasswordDto, LoginDto } from "./dto";
import * as argon from "argon2";
import { Prisma } from '@prisma/client';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { BruteForceService } from "./brute-force.service";

// Deliberate delay on every wrong password, win or lose on the lockout check -
// slows brute force even before the lockout threshold hits.
const FAILED_LOGIN_DELAY_MS = 1000;

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private bruteForce: BruteForceService,
  ) { }

  async login(dto: LoginDto, address: string) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist, throw exception
    if (!user) {
      this.bruteForce.recordFailure(address);
      await this.delay();
      throw new ForbiddenException("Incorrect email or password");
    }

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);

    // if password is incorrect, throw exception
    if (!pwMatches) {
      this.bruteForce.recordFailure(address);
      await this.delay();
      throw new ForbiddenException("Incorrect email or password");
    }

    this.bruteForce.recordSuccess(address);

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

  async changePassword(userId: string, dto: ChangePasswordDto, address: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException("User not found");

    // compare current password
    const pwMatches = await argon.verify(user.hash, dto.currentPassword);

    if (!pwMatches) {
      this.bruteForce.recordFailure(address);
      await this.delay();
      throw new ForbiddenException("Current password is incorrect");
    }

    // generate the new password hash
    const hash = await argon.hash(dto.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hash },
    });

    this.bruteForce.recordSuccess(address);

    return { message: "Password updated successfully" };
  }

  private delay(ms: number = FAILED_LOGIN_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

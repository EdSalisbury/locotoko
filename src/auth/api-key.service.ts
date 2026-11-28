import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { generateApiKey, hashApiKey } from "./api-key";

const keyFields = {
  id: true,
  name: true,
  createdAt: true,
  lastUsedAt: true,
};

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  // The key itself is only in this answer; afterwards only its hash exists.
  async createKey(userId: string, name: string) {
    const key = generateApiKey();
    const created = await this.prisma.apiKey.create({
      data: { userId, name: name.trim(), hash: hashApiKey(key) },
      select: keyFields,
    });
    return { ...created, key };
  }

  listKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      select: keyFields,
      orderBy: { createdAt: "asc" },
    });
  }

  async revokeKey(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id: keyId, userId, revokedAt: null },
    });
    if (!key) {
      throw new NotFoundException("No such API key");
    }
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });
  }

  // The user a key belongs to (without the password hash), or null if the
  // key is unknown or revoked.
  async authenticate(key: string) {
    const found = await this.prisma.apiKey.findUnique({
      where: { hash: hashApiKey(key) },
      include: { user: true },
    });
    if (!found || found.revokedAt) {
      return null;
    }
    await this.prisma.apiKey.update({
      where: { id: found.id },
      data: { lastUsedAt: new Date() },
    });
    const { hash, ...user } = found.user;
    void hash;
    return user;
  }
}

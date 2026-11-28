import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { GetUser } from "./decorator";
import { JwtGuard } from "./guard";
import { ApiKeyService } from "./api-key.service";

@UseGuards(JwtGuard)
@Controller("apiKeys")
export class ApiKeyController {
  constructor(private apiKeys: ApiKeyService) {}

  @Get()
  listKeys(@GetUser("id") userId: string) {
    return this.apiKeys.listKeys(userId);
  }

  @Post()
  createKey(@GetUser("id") userId: string, @Body("name") name: unknown) {
    if (typeof name !== "string" || !name.trim()) {
      throw new BadRequestException("Give the key a name");
    }
    if (name.trim().length > 100) {
      throw new BadRequestException("Keep the name under 100 characters");
    }
    return this.apiKeys.createKey(userId, name);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  revokeKey(@GetUser("id") userId: string, @Param("id") keyId: string) {
    return this.apiKeys.revokeKey(userId, keyId);
  }
}

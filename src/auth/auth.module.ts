import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BruteForceService } from "./brute-force.service";
import { JwtStrategy } from "./strategy";
import { BruteForceGuard } from "./guard";
import { ApiKeyService } from "./api-key.service";
import { ApiKeyController } from "./api-key.controller";

// Global so every module's JwtGuard can reach the API keys and the lockout.
@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController, ApiKeyController],
  providers: [AuthService, JwtStrategy, BruteForceService, BruteForceGuard, ApiKeyService],
  exports: [ApiKeyService, BruteForceService],
})
export class AuthModule {}

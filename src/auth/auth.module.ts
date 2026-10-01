import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BruteForceService } from "./brute-force.service";
import { JwtStrategy } from "./strategy";
import { BruteForceGuard } from "./guard";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BruteForceService, BruteForceGuard],
})
export class AuthModule {}

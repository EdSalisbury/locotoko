import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, ChangePasswordDto, LoginDto } from "./dto";
import { ClientIp, GetUser } from "./decorator";
import { BruteForceGuard, JwtGuard } from "./guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post("register")
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @UseGuards(BruteForceGuard)
  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto, @ClientIp() address: string) {
    return this.authService.login(dto, address);
  }

  @UseGuards(JwtGuard, BruteForceGuard)
  @HttpCode(HttpStatus.OK)
  @Patch("change-password")
  changePassword(
    @GetUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
    @ClientIp() address: string,
  ) {
    return this.authService.changePassword(userId, dto, address);
  }
}

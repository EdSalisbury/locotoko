import { Body, Controller, HttpCode, HttpStatus, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, ChangePasswordDto, LoginDto } from "./dto";
import { GetUser } from "./decorator";
import { JwtGuard } from "./guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post("register")
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Patch("change-password")
  changePassword(
    @GetUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}

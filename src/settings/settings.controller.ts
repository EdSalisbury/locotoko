import { Controller, Get, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("settings")
export class SettingsController {
    constructor(private readonly config: ConfigService) {}

    @Get("")
    getSettings() {
        return {
            minPrice: parseFloat(this.config.get<string>("MIN_PRICE") || "0"),
        };
    }
}

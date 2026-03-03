import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AnthropicService } from "./anthropic.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("anthropic")
export class AnthropicController {
    constructor(private readonly anthropicService: AnthropicService) { }

    @Post("")
    async generateListing(@Body() body: { prompt: string; specifics: { key: string; value: string }[] }) {
        // ✅ Controller only forwards request
        return this.anthropicService.generateListing(body.prompt, body.specifics);
    }
}

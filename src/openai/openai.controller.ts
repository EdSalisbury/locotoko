import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { OpenaiService } from "./openai.service";
import { JwtGuard } from "../auth/guard";

@UseGuards(JwtGuard)
@Controller("openai")
export class OpenaiController {
    constructor(private readonly openaiService: OpenaiService) { }

    @Post("")
    async generateListing(@Body() body: { prompt: string; specifics: { key: string; value: string }[] }) {
        // ✅ Controller only forwards request
        return this.openaiService.generateListing(body.prompt, body.specifics);
    }
}

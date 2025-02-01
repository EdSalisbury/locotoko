import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenAI } from "openai";

@Injectable()
export class OpenaiService {
    private openai: OpenAI;
    private listingRules: string;

    constructor(private readonly configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>("OPENAI_API_KEY"),
        });

        this.listingRules = this.configService.get<string>("LISTING_RULES") || "";
    }

    async generateListing(prompt: string, existingSpecifics: { key: string; value: string }[]) {
        // 🔥 Convert existing specifics array into an object
        const existingSpecificsObj = existingSpecifics.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as Record<string, string>);

        const specificsText = Object.entries(existingSpecificsObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");

        const systemPrompt = `You are an expert eBay listing generator. Follow these global rules: ${this.listingRules}.`;

        const userPrompt = `Generate an eBay listing based on the following details:
  - Prompt: ${prompt}
  - Existing Specifics: ${specificsText}

  Return a JSON object with:
  - title (string)
  - description (string)
  - specifics (object, key-value pairs)`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
        });

        try {
            const result = JSON.parse(response.choices[0]?.message?.content || "{}");

            // Ensure specifics exist and is an object
            if (!result.specifics || typeof result.specifics !== "object") {
                result.specifics = {};
            }

            // Merge OpenAI specifics with existing ones
            const mergedSpecifics = { ...existingSpecificsObj, ...result.specifics };

            // Convert merged specifics back into an array of { key, value } pairs
            result.specifics = Object.entries(mergedSpecifics).map(([key, value]) => ({
                key,
                value: String(value), // Ensure value is always a string
            }));

            return result;
        } catch (error) {
            throw new Error("Failed to parse OpenAI response");
        }
    }



}

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Anthropic from "@anthropic-ai/sdk";

@Injectable()
export class AnthropicService {
    private anthropic: Anthropic;
    private listingRules: string;

    constructor(private readonly configService: ConfigService) {
        this.anthropic = new Anthropic({
            apiKey: this.configService.get<string>("ANTHROPIC_API_KEY"),
        });

        this.listingRules = this.configService.get<string>("LISTING_RULES") || "";
    }

    async generateListing(prompt: string, existingSpecifics: { key: string; value: string }[]) {
        // 🔥 Ensure existingSpecifics is always an array
        if (!Array.isArray(existingSpecifics)) {
            existingSpecifics = [];
        }

        // 🔥 Normalize specifics, ensuring no empty keys or undefined values
        existingSpecifics = existingSpecifics
            .filter(s => s.key && typeof s.key === "string") // Remove empty entries
            .map(s => {
                const trimmedKey = s.key.trim();
                return {
                    key: trimmedKey, // Trim whitespace
                    value: this.normalizeSpecificValue(trimmedKey, s.value), // Default empty values safely
                };
            });

        // 🔥 Convert array to an object for easier handling
        const existingSpecificsObj = existingSpecifics.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {} as Record<string, string>);

        // 🔥 Format specifics as a readable string for Claude
        const specificsText = Object.entries(existingSpecificsObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");

        console.log("🟢 Sending to Claude:", { prompt, specificsText });

        // 🔥 Claude System & User Prompts
        const systemPrompt = `You are an expert eBay listing generator. Follow these global rules: ${this.listingRules}.

IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code blocks, no explanations. Just the raw JSON object.`;

        const userPrompt = `Generate an eBay listing based on the following details:
        - Prompt: ${prompt}
        - Existing Specifics: ${specificsText}

        For the description, ensure that:
        - Use bulleted lists (with emojis instead of other symbols).
        - Use newlines after every bullet.

        For the specifics, ensure that:
        - All specifics are fully filled in (do NOT leave anything undefined).
        - If a specific is missing, infer a reasonable default value.
        - Correct any incorrect specifics (e.g., "Model" should match the correct calculator model).
        - Maintain an array structure where each specific has a { "key": "Some Key", "value": "Some Value" } pair.
        - Ensure that no key is a number or an object.

        Return a JSON object with:
        {
          "title": "Generated Title",
          "description": "Generated Description",
          "specifics": [
            { "key": "Brand", "value": "Texas Instruments" },
            { "key": "Model", "value": "TI-84 Plus Silver Edition" }
          ]
        }`;

        // 🔥 Call Claude API
        const response = await this.anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt },
            ],
        });

        try {
            // 🔥 Parse Claude's Response
            const textContent = response.content.find(block => block.type === "text");
            const responseText = textContent?.type === "text" ? textContent.text : "{}";
            const result = JSON.parse(responseText);

            console.log("🟢 Claude Response:", result);

            // 🔥 Ensure the response contains valid specifics
            if (!result.specifics || !Array.isArray(result.specifics)) {
                console.error("❌ Invalid specifics format received:", result.specifics);
                result.specifics = [];
            }

            // 🔥 Merge Claude-generated specifics with existing ones
            const mergedSpecifics = {
                ...existingSpecificsObj, ...Object.fromEntries(
                    result.specifics.map(s => {
                        const key = String(s.key).trim();
                        return [key, this.normalizeSpecificValue(key, s.value)];
                    })
                )
            };

            // 🔥 Convert merged specifics back into an array format
            result.specifics = Object.entries(mergedSpecifics).map(([key, value]) => {
                const trimmedKey = String(key).trim();
                return {
                    key: trimmedKey,
                    value: this.normalizeSpecificValue(trimmedKey, value),
                };
            });

            console.log("🟢 Final specifics sent to frontend:", result.specifics);

            return result;
        } catch (error) {
            const textContent = response.content.find(block => block.type === "text");
            const responseText = textContent?.type === "text" ? textContent.text : "unknown";
            console.error("❌ Failed to parse Claude response:", responseText);
            throw new Error("Failed to parse Claude response");
        }
    }

    private normalizeSpecificValue(key: string, value?: unknown): string {
        const trimmedValue = value ? String(value).trim() : "";
        if (trimmedValue) {
            return trimmedValue;
        }

        // eBay rejects "N/A" for Device Charging Range, so leave it blank
        if (key === "Device Charging Range") {
            return "";
        }

        return "N/A";
    }

}

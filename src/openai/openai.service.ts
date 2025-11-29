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

        // 🔥 Format specifics as a readable string for OpenAI
        const specificsText = Object.entries(existingSpecificsObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");

        console.log("🟢 Sending to OpenAI:", { prompt, specificsText });

        // 🔥 OpenAI System & User Prompts
        const systemPrompt = `You are an expert eBay listing generator. Follow these global rules: ${this.listingRules}.`;

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

        // 🔥 Call OpenAI API
        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
        });

        try {
            // 🔥 Parse OpenAI's Response
            const result = JSON.parse(response.choices[0]?.message?.content || "{}");

            console.log("🟢 OpenAI Response:", result);

            // 🔥 Ensure the response contains valid specifics
            if (!result.specifics || !Array.isArray(result.specifics)) {
                console.error("❌ Invalid specifics format received:", result.specifics);
                result.specifics = [];
            }

            // 🔥 Merge OpenAI-generated specifics with existing ones
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
            console.error("❌ Failed to parse OpenAI response:", response.choices[0]?.message?.content);
            throw new Error("Failed to parse OpenAI response");
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

// Pure logic for cleaning up an eBay item specific's value before it is sent
// to eBay. Kept separate from AnthropicService so it can be unit tested
// without constructing the Anthropic client or NestJS's DI container.

// eBay rejects "N/A" for these fields; leave them blank instead.
export const BLANK_INSTEAD_OF_NA = new Set([
    "Device Charging Range",
    "Durability Guarantee",
    "FCC ID",
]);

// Max characters eBay accepts for a specific's value.
export const MAX_SPECIFIC_LENGTH: Record<string, number> = {
    "Features": 65,
};

export function normalizeSpecificValue(key: string, value?: unknown): string {
    const trimmedValue = value ? String(value).trim() : "";
    if (trimmedValue) {
        return capLength(key, trimmedValue);
    }

    if (BLANK_INSTEAD_OF_NA.has(key)) {
        return "";
    }

    return "N/A";
}

// eBay rejects values over these limits, so drop whole comma-separated items until it fits.
export function capLength(key: string, value: string): string {
    const maxLength = MAX_SPECIFIC_LENGTH[key];
    if (!maxLength || value.length <= maxLength) {
        return value;
    }

    const kept: string[] = [];
    for (const item of value.split(",").map(s => s.trim())) {
        const candidate = [...kept, item].join(", ");
        if (candidate.length > maxLength) {
            break;
        }
        kept.push(item);
    }
    return kept.join(", ");
}

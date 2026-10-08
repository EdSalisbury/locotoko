import { normalizeSpecificValue, capLength } from "./specifics-normalizer";

describe("normalizeSpecificValue", () => {
    it("passes through a normal value unchanged", () => {
        expect(normalizeSpecificValue("Brand", "Sony")).toBe("Sony");
    });

    it("trims whitespace", () => {
        expect(normalizeSpecificValue("Brand", "  Sony  ")).toBe("Sony");
    });

    it("defaults a missing value to N/A for an ordinary field", () => {
        expect(normalizeSpecificValue("Color", undefined)).toBe("N/A");
        expect(normalizeSpecificValue("Color", "")).toBe("N/A");
    });

    // eBay's AddItem rejects "N/A" for these; a real listing failed on each
    // of them before this was fixed (Locotoko PR #9).
    it.each([
        "Device Charging Range",
        "Durability Guarantee",
        "FCC ID",
    ])("leaves %s blank instead of N/A when missing", (key) => {
        expect(normalizeSpecificValue(key, undefined)).toBe("");
        expect(normalizeSpecificValue(key, "")).toBe("");
    });

    it("does not blank an exception field that has a real value", () => {
        expect(normalizeSpecificValue("Durability Guarantee", "17")).toBe("17");
    });

    it("caps Features at 65 characters by dropping whole items", () => {
        // The real rejected value from the Ring Fit Adventure listing.
        const value =
            "Fitness Game, Ring-Con Controller, Adventure Mode, Custom Workouts, Mini-games, Exercise Tracking";
        const result = normalizeSpecificValue("Features", value);
        expect(result.length).toBeLessThanOrEqual(65);
        expect(result).toBe("Fitness Game, Ring-Con Controller, Adventure Mode");
    });

    it("leaves Features alone when already within the limit", () => {
        const value = "Backlight, USB Connectivity, Programmable";
        expect(normalizeSpecificValue("Features", value)).toBe(value);
    });
});

describe("capLength", () => {
    it("returns the value unchanged for a key with no configured limit", () => {
        const long = "a".repeat(200);
        expect(capLength("Some Unlimited Field", long)).toBe(long);
    });

    it("drops the first item entirely if it alone exceeds the limit", () => {
        const value = "a".repeat(100) + ", short";
        expect(capLength("Features", value)).toBe("");
    });
});

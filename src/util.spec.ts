import {
  encodeSpecialChars,
  decodeSpecialChars,
  encodeSpecialCharsInObject,
  decodeSpecialCharsInObject,
  getWeeksDiff,
} from "./util";

describe("encodeSpecialChars / decodeSpecialChars", () => {
  it("encodes & to &amp;", () => {
    expect(encodeSpecialChars("Salt & Pepper")).toBe("Salt &amp; Pepper");
  });

  it("encodes ' to &apos;", () => {
    expect(encodeSpecialChars("Ed's Item")).toBe("Ed&apos;s Item");
  });

  it("encodes an escaped quote to &quot;", () => {
    expect(encodeSpecialChars('He said \\"hi\\"')).toBe("He said &quot;hi&quot;");
  });

  it("round-trips through encode then decode", () => {
    const original = 'Ed\'s "Big & Small" Shop';
    // decode expects the escaped-quote form JSON.stringify would have
    // produced, so run the round trip the way encodeSpecialCharsInObject
    // and decodeSpecialCharsInObject actually use it: via JSON.stringify.
    const jsonStr = JSON.stringify(original);
    const encoded = encodeSpecialChars(jsonStr);
    const decoded = decodeSpecialChars(encoded);
    expect(decoded).toBe(jsonStr);
    expect(JSON.parse(decoded)).toBe(original);
  });
});

describe("encodeSpecialCharsInObject / decodeSpecialCharsInObject", () => {
  it("encodes special characters in every string field of an object", () => {
    const input = { title: "Ed's Lot #1: Cars & Trucks" };
    const encoded = encodeSpecialCharsInObject(input);
    expect(encoded.title).toBe("Ed&apos;s Lot #1: Cars &amp; Trucks");
  });

  it("round-trips an object through encode then decode", () => {
    const input = { title: "Ed's Lot: Cars & Trucks", qty: 3 };
    const encoded = encodeSpecialCharsInObject(input);
    const decoded = decodeSpecialCharsInObject(encoded);
    expect(decoded).toEqual(input);
  });

  it("returns the original object unchanged if it can't be stringified", () => {
    const circular: any = { title: "loop" };
    circular.self = circular;
    expect(encodeSpecialCharsInObject(circular)).toBe(circular);
    expect(decodeSpecialCharsInObject(circular)).toBe(circular);
  });
});

describe("getWeeksDiff", () => {
  it("returns 0 when there is no start date", () => {
    expect(getWeeksDiff(undefined as unknown as Date, new Date())).toBe(0);
  });

  it("returns the number of whole weeks between two dates", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = new Date("2026-01-22T00:00:00Z"); // 3 weeks later
    expect(getWeeksDiff(start, end)).toBe(3);
  });

  it("is order-independent (uses the absolute difference)", () => {
    const start = new Date("2026-01-22T00:00:00Z");
    const end = new Date("2026-01-01T00:00:00Z");
    expect(getWeeksDiff(start, end)).toBe(3);
  });

  it("rounds down a partial week", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const end = new Date("2026-01-10T00:00:00Z"); // 9 days
    expect(getWeeksDiff(start, end)).toBe(1);
  });
});

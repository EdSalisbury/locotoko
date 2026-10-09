import { parseImageDataUrl } from "./parse-image-data-url";

const toDataUrl = (type: string, bytes: number[]) =>
  `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;

describe("parseImageDataUrl", () => {
  it("decodes a JPEG data URL", () => {
    const parsed = parseImageDataUrl(toDataUrl("image/jpeg", [0xff, 0xd8, 0xff, 0xe0]));
    expect(parsed.contentType).toBe("image/jpeg");
    expect(parsed.filename).toBe("image.jpg");
    expect([...parsed.bytes]).toEqual([0xff, 0xd8, 0xff, 0xe0]);
  });

  it("decodes a PNG data URL with a .png file name", () => {
    const parsed = parseImageDataUrl(toDataUrl("image/png", [0x89, 0x50, 0x4e, 0x47]));
    expect(parsed.contentType).toBe("image/png");
    expect(parsed.filename).toBe("image.png");
  });

  it("falls back to .jpg for an image type it doesn't map", () => {
    expect(parseImageDataUrl(toDataUrl("image/heic", [1, 2, 3])).filename).toBe("image.jpg");
  });

  it("rejects something that isn't a data URL", () => {
    expect(() => parseImageDataUrl("https://example.com/a.jpg")).toThrow("not a base64 data URL");
    expect(() => parseImageDataUrl("")).toThrow("not a base64 data URL");
  });

  it("rejects an empty photo", () => {
    expect(() => parseImageDataUrl("data:image/jpeg;base64,")).toThrow("Photo is empty");
  });
});

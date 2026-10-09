// Turns a stored photo (a "data:image/jpeg;base64,..." data URL) into the
// bytes, content type, and file name that eBay's Media API upload needs.
// Kept separate from EbayListingService so it can be unit tested without
// pulling in Prisma, EbayService (and transitively ebay-api/axios), or
// NestJS's DI container.

export interface ParsedImage {
  bytes: Buffer;
  contentType: string;
  filename: string;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function parseImageDataUrl(dataUrl: string): ParsedImage {
  const match = /^data:([^;,]+);base64,([\s\S]*)$/.exec(dataUrl ?? "");
  if (!match) {
    throw new Error("Photo is not a base64 data URL");
  }
  const contentType = match[1].toLowerCase();
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length === 0) {
    throw new Error("Photo is empty");
  }
  const extension = EXTENSIONS[contentType] ?? "jpg";
  return { bytes, contentType, filename: `image.${extension}` };
}

import sharp from "sharp";

// Photos sent for a draft are stored the way Add Item stores them: a JPEG
// data URL, longest side at most 1600 px, quality 70 (the browser's 0.7).
// Claude gets its own copy at about 1,568 px, the most it uses.

const STORED_MAX_SIDE = 1600;
const STORED_QUALITY = 70;
const CLAUDE_MAX_SIDE = 1568;

export const MAX_PHOTOS = 12;

async function toJpeg(input: Buffer, maxSide: number, quality: number): Promise<Buffer> {
  return sharp(input, { failOn: "error" })
    .rotate() // follow the camera's orientation tag, as a browser does
    .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer();
}

export async function toStoredPhoto(input: Buffer): Promise<string> {
  const jpeg = await toJpeg(input, STORED_MAX_SIDE, STORED_QUALITY);
  return "data:image/jpeg;base64," + jpeg.toString("base64");
}

// A stored photo (data URL) as base64 JPEG for Claude.
export async function toClaudePhoto(dataUrl: string): Promise<string> {
  const match = /^data:[^;,]+;base64,([\s\S]*)$/.exec(dataUrl ?? "");
  if (!match) {
    throw new Error("A photo isn't stored as an image");
  }
  const jpeg = await toJpeg(Buffer.from(match[1], "base64"), CLAUDE_MAX_SIDE, 85);
  return jpeg.toString("base64");
}

export interface UploadedPhoto {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
}

// Turns uploaded files into stored photos, in the order sent. Throws with a
// plain reason when there are none, too many, or one isn't an image.
export async function storeUploadedPhotos(files: UploadedPhoto[] | undefined): Promise<string[]> {
  if (!files || files.length === 0) {
    throw new PhotoError("No photos were sent");
  }
  if (files.length > MAX_PHOTOS) {
    throw new PhotoError(`Too many photos (${files.length}); the most is ${MAX_PHOTOS}`);
  }
  const stored: string[] = [];
  for (const file of files) {
    try {
      stored.push(await toStoredPhoto(file.buffer));
    } catch {
      throw new PhotoError(`${file.originalname || "A photo"} isn't an image Locotoko can read`);
    }
  }
  return stored;
}

export class PhotoError extends Error {}

import { createHash, randomBytes } from "crypto";

// API keys let another program (Lucida) act as a user without logging in.
// They're random (32 bytes), so a plain SHA-256 is enough to store them:
// there's nothing to guess from the hash, and it can be looked up directly.

export const API_KEY_PREFIX = "lk_";

export function generateApiKey(): string {
  return API_KEY_PREFIX + randomBytes(32).toString("base64url");
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

interface HeaderSource {
  headers: Record<string, string | string[] | undefined>;
}

function firstHeader(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export type ApiKeyCheck<User> =
  | { result: "no-key" }
  | { result: "user"; user: User }
  | { result: "locked" }
  | { result: "invalid" };

interface AttemptCounter {
  isLocked(address: string): boolean;
  recordFailure(address: string): void;
  delay(): Promise<void>;
}

// What to do with a request that may carry an API key. A wrong key counts
// toward the same lockout as a wrong password, with the same delay; a right
// key doesn't reset the count, so it can't wipe out password guesses.
export async function checkApiKey<User>(
  request: HeaderSource,
  address: string,
  authenticate: (key: string) => Promise<User | null>,
  attempts: AttemptCounter,
): Promise<ApiKeyCheck<User>> {
  const key = extractApiKey(request);
  if (key === null) {
    return { result: "no-key" };
  }
  if (attempts.isLocked(address)) {
    return { result: "locked" };
  }
  const user = await authenticate(key);
  if (!user) {
    attempts.recordFailure(address);
    await attempts.delay();
    return { result: "invalid" };
  }
  return { result: "user", user };
}

// The key a request carries, or null when it carries none (then it's a
// normal logged-in request with a JWT, or no credentials at all). Accepted
// as "X-API-Key: lk_..." or "Authorization: Bearer lk_..."; a JWT never
// starts with "lk_".
export function extractApiKey(request: HeaderSource): string | null {
  const header = firstHeader(request.headers["x-api-key"]).trim();
  if (header) {
    return header;
  }
  const authorization = firstHeader(request.headers["authorization"]).trim();
  const match = /^Bearer\s+(\S+)$/i.exec(authorization);
  if (match && match[1].startsWith(API_KEY_PREFIX)) {
    return match[1];
  }
  return null;
}

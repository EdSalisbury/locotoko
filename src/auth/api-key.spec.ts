import { API_KEY_PREFIX, checkApiKey, extractApiKey, generateApiKey, hashApiKey } from "./api-key";
import { FailedAttempts } from "./failed-attempts";

describe("API keys", () => {
  it("makes long random keys with the lk_ prefix", () => {
    const a = generateApiKey();
    const b = generateApiKey();
    expect(a.startsWith(API_KEY_PREFIX)).toBe(true);
    expect(a.length).toBeGreaterThanOrEqual(40);
    expect(a).not.toEqual(b);
  });

  it("stores a hash that isn't the key", () => {
    const key = generateApiKey();
    expect(hashApiKey(key)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashApiKey(key)).not.toContain(key);
    expect(hashApiKey(key)).toEqual(hashApiKey(key));
  });

  it("reads a key from X-API-Key or a Bearer lk_ header, and leaves JWTs alone", () => {
    expect(extractApiKey({ headers: { "x-api-key": "lk_abc" } })).toBe("lk_abc");
    expect(extractApiKey({ headers: { authorization: "Bearer lk_abc" } })).toBe("lk_abc");
    expect(extractApiKey({ headers: { authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.x.y" } })).toBeNull();
    expect(extractApiKey({ headers: {} })).toBeNull();
  });
});

describe("a request with an API key", () => {
  const user = { id: "user-1", email: "riley@example.com", name: "Riley Park" };
  const goodKey = "lk_good";
  const address = "203.0.113.9";

  function setup() {
    const attempts = new FailedAttempts();
    attempts.failedAttemptDelayMs = 0;
    const authenticate = jest.fn(async (key: string) => (key === goodKey ? user : null));
    const check = (headers: Record<string, string>) => checkApiKey({ headers }, address, authenticate, attempts);
    return { attempts, authenticate, check };
  }

  it("acts as the key's user", async () => {
    const { check } = setup();
    await expect(check({ "x-api-key": goodKey })).resolves.toEqual({ result: "user", user });
  });

  it("leaves a request without a key to the normal login check", async () => {
    const { check, authenticate } = setup();
    await expect(check({ authorization: "Bearer eyJ.x.y" })).resolves.toEqual({ result: "no-key" });
    expect(authenticate).not.toHaveBeenCalled();
  });

  it("refuses a wrong key and counts it toward the lockout", async () => {
    const { check, attempts } = setup();
    for (let i = 0; i < 3; i++) {
      await expect(check({ "x-api-key": "lk_wrong" })).resolves.toEqual({ result: "invalid" });
    }
    expect(attempts.isLocked(address)).toBe(true);
    // Locked out: even the right key is turned away now.
    await expect(check({ "x-api-key": goodKey })).resolves.toEqual({ result: "locked" });
  });

  it("shares the counter with wrong passwords, and a right key doesn't reset it", async () => {
    const { check, attempts } = setup();
    attempts.recordFailure(address);
    await check({ "x-api-key": goodKey });
    attempts.recordFailure(address);
    await expect(check({ "x-api-key": "lk_wrong" })).resolves.toEqual({ result: "invalid" });
    expect(attempts.isLocked(address)).toBe(true);
  });
});

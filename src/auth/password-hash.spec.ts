// Password hashes stored in the database must keep verifying across argon2
// upgrades, or every login breaks. These fixtures were generated with argon2
// 0.28.7, one per hash type an older install can have produced (argon2i and
// argon2id). argon2.verify reads the type and parameters from the hash string
// itself, so old hashes keep working whatever the new defaults are.
import * as argon from "argon2";

const PASSWORD = "locotoko-fixture-password";
const ARGON2ID_FROM_0_28 =
  "$argon2id$v=19$m=4096,t=3,p=1$TmDhA89it3uO7ndzpZSNnw$16O27/r0bHSS6JmdPRCQY7zkPlVaml5OzZvYlTIj5Mc";
const ARGON2I_FROM_0_28 =
  "$argon2i$v=19$m=4096,t=3,p=1$BSSsW1rY8zYvfaYKwxCAPg$6wHBZfJU2sPYgf6mCJHjTTj77F7eVvHPaGcuWgFrQ8A";

describe("password hashes from earlier argon2 versions", () => {
  it.each([
    ["argon2id", ARGON2ID_FROM_0_28],
    ["argon2i", ARGON2I_FROM_0_28],
  ])("verifies a stored %s hash with the right password", async (_type, hash) => {
    expect(await argon.verify(hash, PASSWORD)).toBe(true);
  });

  it.each([
    ["argon2id", ARGON2ID_FROM_0_28],
    ["argon2i", ARGON2I_FROM_0_28],
  ])("rejects a stored %s hash with the wrong password", async (_type, hash) => {
    expect(await argon.verify(hash, PASSWORD + "x")).toBe(false);
  });
});

describe("new hashes", () => {
  it("are argon2id and verify", async () => {
    const hash = await argon.hash(PASSWORD);
    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(await argon.verify(hash, PASSWORD)).toBe(true);
    expect(await argon.verify(hash, "wrong")).toBe(false);
  });
});

import { PUBLIC_USER_FIELDS } from "./public-user-fields";

describe("PUBLIC_USER_FIELDS", () => {
  it("is exactly the fields clients need", () => {
    expect(Object.keys(PUBLIC_USER_FIELDS).sort()).toEqual(["createdAt", "email", "id", "name", "updatedAt"]);
  });

  it("never includes the password hash", () => {
    expect(PUBLIC_USER_FIELDS).not.toHaveProperty("hash");
  });
});

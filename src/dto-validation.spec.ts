// Pins down how request validation behaves, so library upgrades (class-validator,
// class-transformer, validator.js) can't silently change what the API accepts.
// Runs values through the same steps as the app's global ValidationPipe
// (main.ts: new ValidationPipe({ whitelist: true })): plainToInstance, then
// validate with whitelist on and class-validator's default options otherwise.
import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { EditItemDto } from "./item/dto/editItem.dto";
import { CreateItemDto } from "./item/dto/createItem.dto";
import { LoginDto } from "./auth/dto/login.dto";
import { CreatePayoutDto } from "./payout/dto/createPayout.dto";
import { CreateAcquisitionDto } from "./acquisition/dto/createAcquisition.dto";

type Ctor<T> = new () => T;

async function errorsFor<T extends object>(dto: Ctor<T>, body: Record<string, unknown>) {
  const instance = plainToInstance(dto, body);
  const errors = await validate(instance, { whitelist: true });
  return { instance, errors };
}

// Does `value` pass the rules on `field`? Only errors on that one field count,
// so other required fields being absent doesn't matter.
async function fieldAccepts<T extends object>(dto: Ctor<T>, field: string, value: unknown) {
  const { errors } = await errorsFor(dto, { [field]: value });
  return !errors.some((e) => e.property === field);
}

const matrix = <T extends object>(dto: Ctor<T>, field: string, cases: [unknown, boolean][]) =>
  it.each(cases)(`${dto.name}.${field} = %j -> accepted: %s`, async (value, accepted) => {
    expect(await fieldAccepts(dto, field, value)).toBe(accepted);
  });

describe("@IsCurrency({ digits_after_decimal: [0, 1, 2] }) (item prices)", () => {
  matrix(EditItemDto, "price", [
    ["10", true],
    ["10.5", true],
    ["10.50", true],
    ["0", true],
    ["0.00", true],
    ["1234.56", true],
    ["1,234.56", true],
    ["$10.00", true],
    ["-10.00", true],
    ["10.555", false],
    ["abc", false],
    ["", false],
    [10.5, false],
  ]);
  matrix(CreateItemDto, "shippingPrice", [
    ["5.60", true],
    ["5.6", true],
    ["5", true],
    ["5.605", false],
  ]);
});

describe("@IsCurrency() with defaults (payout amount)", () => {
  matrix(CreatePayoutDto, "amount", [
    ["10.00", true],
    ["10", true],
    ["$10.00", true],
    ["10.5", false],
    ["10.555", false],
    ["abc", false],
  ]);
});

describe("@IsDecimal() (acquisition price)", () => {
  matrix(CreateAcquisitionDto, "price", [
    ["10", true],
    ["10.5", true],
    ["10.50", true],
    ["10.555", true],
    ["abc", false],
    ["", false],
    [10.5, false],
  ]);
});

describe("@IsDateString()", () => {
  matrix(EditItemDto, "soldAt", [
    ["2026-10-09T18:09:24.211Z", true],
    ["2026-10-09T18:09:24Z", true],
    ["2026-10-09", true],
    ["2026-10-09T18:09:24.211+02:00", true],
    ["2026-10-09 18:09:24", true],
    ["10/09/2026", false],
    ["2026-13-01", false],
    ["", false],
  ]);
});

describe("@IsEmail()", () => {
  matrix(LoginDto, "email", [
    ["ed.salisbury@gmail.com", true],
    ["a+tag@example.co", true],
    ["UPPER@EXAMPLE.COM", true],
    ["no-at-sign", false],
    ["a@b", false],
    ["a b@example.com", false],
    ["", false],
  ]);
});

// class-validator 0.14+ rejects values that aren't instances of a decorated
// class (forbidUnknownValues defaults to true). Keep it that way.
describe("unknown values are rejected", () => {
  it("rejects a plain object instead of silently passing it", async () => {
    const errors = await validate({ email: "not-an-email", password: 123 } as object);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("whole requests", () => {
  it("accepts a normal login", async () => {
    const { errors } = await errorsFor(LoginDto, { email: "ed.salisbury@gmail.com", password: "x" });
    expect(errors).toEqual([]);
  });

  it("rejects an empty login with the same messages the UI shows", async () => {
    const { errors } = await errorsFor(LoginDto, {});
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {})).sort();
    expect(messages).toEqual([
      "email must be an email",
      "email should not be empty",
      "password must be a string",
      "password should not be empty",
    ]);
  });

  it("strips unknown fields silently instead of rejecting the request", async () => {
    const { instance, errors } = await errorsFor(LoginDto, {
      email: "ed.salisbury@gmail.com",
      password: "x",
      isAdmin: true,
    });
    expect(errors).toEqual([]);
    expect(instance).not.toHaveProperty("isAdmin");
  });

  it("accepts a typical item edit (ready toggle + price change)", async () => {
    const { errors } = await errorsFor(EditItemDto, { ready: true, price: "15.60", shippingPrice: "5.6" });
    expect(errors).toEqual([]);
  });
});

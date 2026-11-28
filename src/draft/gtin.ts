// A barcode number read from a photo (UPC-A, EAN-13, EAN-8 or GTIN-14) is
// only kept when its check digit is right: a misread digit makes it wrong.
export function normalizeGtin(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") {
    return null;
  }
  const digits = String(raw).replace(/[\s-]/g, "");
  if (!/^\d+$/.test(digits) || ![8, 12, 13, 14].includes(digits.length)) {
    return null;
  }
  return isValidGtin(digits) ? digits : null;
}

export function isValidGtin(digits: string): boolean {
  if (!/^\d+$/.test(digits) || ![8, 12, 13, 14].includes(digits.length)) {
    return false;
  }
  const body = digits.slice(0, -1);
  let sum = 0;
  // From the right, digits alternate weights 3 and 1.
  for (let i = 0; i < body.length; i++) {
    const digit = Number(body[body.length - 1 - i]);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[digits.length - 1]);
}

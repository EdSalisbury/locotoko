import {
  findShippingProblems,
  toClientErrors,
  ebayErrorToClientErrors,
} from "./listing-problems";

const good = {
  shipSizeDepthInches: 2,
  shipSizeHeightInches: 4,
  shipSizeWidthInches: 7,
  shipWeightPounds: 1,
  shipWeightOunces: 3,
};

describe("findShippingProblems", () => {
  it("finds nothing wrong with a complete item", () => {
    expect(findShippingProblems(good)).toEqual([]);
  });

  // The real Kodak EasyShare item: pounds blank, 0 ounces.
  it("flags a missing weight (blank pounds, 0 ounces)", () => {
    expect(findShippingProblems({ ...good, shipWeightPounds: null, shipWeightOunces: 0 })).toEqual([
      "Shipping weight is missing (0 lb 0 oz)",
    ]);
  });

  it("flags 0 lb 0 oz", () => {
    expect(findShippingProblems({ ...good, shipWeightPounds: 0, shipWeightOunces: 0 })).toEqual([
      "Shipping weight is missing (0 lb 0 oz)",
    ]);
  });

  it("accepts an item under a pound with pounds left blank", () => {
    expect(findShippingProblems({ ...good, shipWeightPounds: null, shipWeightOunces: 8 })).toEqual([]);
  });

  it("accepts whole pounds with ounces left blank", () => {
    expect(findShippingProblems({ ...good, shipWeightPounds: 2, shipWeightOunces: null })).toEqual([]);
  });

  it.each([
    ["shipSizeDepthInches", "Package length is missing"],
    ["shipSizeWidthInches", "Package width is missing"],
    ["shipSizeHeightInches", "Package height is missing"],
  ] as const)("flags %s when blank or 0", (field, message) => {
    expect(findShippingProblems({ ...good, [field]: null })).toEqual([message]);
    expect(findShippingProblems({ ...good, [field]: 0 })).toEqual([message]);
  });

  it("lists every problem at once", () => {
    const everythingMissing = {
      shipSizeDepthInches: null,
      shipSizeHeightInches: null,
      shipSizeWidthInches: null,
      shipWeightPounds: null,
      shipWeightOunces: null,
    };
    expect(findShippingProblems(everythingMissing)).toHaveLength(4);
  });
});

describe("toClientErrors", () => {
  it("wraps messages in the shape the client displays", () => {
    expect(toClientErrors(["a", "b"])).toEqual({
      message: [{ ShortMessage: "a" }, { ShortMessage: "b" }],
    });
  });
});

describe("ebayErrorToClientErrors", () => {
  it("handles a single eBay error object", () => {
    const e = { meta: { Errors: { ShortMessage: "The UPC field is missing." } } };
    expect(ebayErrorToClientErrors(e)).toEqual({
      message: [{ ShortMessage: "The UPC field is missing." }],
    });
  });

  it("handles an array of eBay errors (previously shown as 'undefined')", () => {
    const e = {
      meta: {
        Errors: [
          { ShortMessage: "Durability Guarantee must be a number greater or equal than 3 and up to 99." },
          { ShortMessage: "Features's value is too long." },
        ],
      },
    };
    expect(ebayErrorToClientErrors(e).message).toHaveLength(2);
  });

  it("uses the error parameter text when eBay only says 'Unknown Error.'", () => {
    const e = {
      meta: {
        Errors: {
          ShortMessage: "Unknown Error.",
          ErrorParameters: [
            { Value: "FCC ID must be 4 to 19 characters long and contain only letters, numbers or hyphens.", ParamID: 0 },
          ],
        },
      },
    };
    expect(ebayErrorToClientErrors(e)).toEqual({
      message: [{ ShortMessage: "FCC ID must be 4 to 19 characters long and contain only letters, numbers or hyphens." }],
    });
  });

  it("handles errors that didn't come from eBay at all", () => {
    expect(ebayErrorToClientErrors(new Error("connect ECONNREFUSED"))).toEqual({
      message: [{ ShortMessage: "connect ECONNREFUSED" }],
    });
  });
});

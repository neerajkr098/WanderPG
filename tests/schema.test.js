const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const { listingSchema, reviewSchema } = require("../schema.js");

describe("Joi Listing Schema", () => {
  it("should validate a correct listing", () => {
    const valid = {
      listing: {
        title: "Cozy PG near AEC",
        description: "A clean, well-lit room with Wi-Fi.",
        location: "Asansol, West Bengal",
        country: "India",
        price: 4500,
      },
    };
    const { error } = listingSchema.validate(valid);
    assert.equal(error, undefined);
  });

  it("should reject when title is missing", () => {
    const invalid = {
      listing: {
        description: "Desc",
        location: "Asansol",
        country: "India",
        price: 100,
      },
    };
    const { error } = listingSchema.validate(invalid);
    assert.ok(error);
  });

  it("should reject negative price", () => {
    const invalid = {
      listing: {
        title: "Test",
        description: "Desc",
        location: "Asansol",
        country: "India",
        price: -1,
      },
    };
    const { error } = listingSchema.validate(invalid);
    assert.ok(error);
  });

  it("should reject unknown fields", () => {
    const invalid = {
      listing: {
        title: "Test",
        description: "Desc",
        location: "Asansol",
        country: "India",
        price: 100,
        hacked: true,
      },
    };
    const { error } = listingSchema.validate(invalid);
    assert.ok(error);
    assert.ok(error.message.includes("not allowed"));
  });

  it("should reject unknown fields at root level", () => {
    const invalid = {
      listing: {
        title: "Test",
        description: "Desc",
        location: "Asansol",
        country: "India",
        price: 100,
      },
      admin: true,
    };
    const { error } = listingSchema.validate(invalid);
    assert.ok(error);
  });
});

describe("Joi Review Schema", () => {
  it("should validate a correct review", () => {
    const valid = { review: { rating: 4, comment: "Great place!" } };
    const { error } = reviewSchema.validate(valid);
    assert.equal(error, undefined);
  });

  it("should reject rating above 5", () => {
    const invalid = { review: { rating: 6, comment: "Test" } };
    const { error } = reviewSchema.validate(invalid);
    assert.ok(error);
  });

  it("should reject rating below 1", () => {
    const invalid = { review: { rating: 0, comment: "Test" } };
    const { error } = reviewSchema.validate(invalid);
    assert.ok(error);
  });

  it("should reject unknown fields in review", () => {
    const invalid = { review: { rating: 3, comment: "Ok", isAdmin: true } };
    const { error } = reviewSchema.validate(invalid);
    assert.ok(error);
  });
});

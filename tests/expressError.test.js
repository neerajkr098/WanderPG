const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const ExpressError = require("../utils/ExpressError.js");

describe("ExpressError", () => {
  it("should create an error with statusCode and message", () => {
    const err = new ExpressError(404, "Not Found");
    assert.equal(err.statusCode, 404);
    assert.equal(err.message, "Not Found");
    assert.ok(err instanceof Error);
  });

  it("should default to Error prototype chain", () => {
    const err = new ExpressError(500, "Server Error");
    assert.ok(err.stack);
  });
});

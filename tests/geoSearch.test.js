const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { findNearbyPGs, DEFAULT_MAX_DISTANCE, DEFAULT_LIMIT } = require("../services/geoSearch.js");

describe("GeoSearch Service Validation", () => {
  it("should export correct defaults", () => {
    assert.equal(DEFAULT_MAX_DISTANCE, 5000);
    assert.equal(DEFAULT_LIMIT, 12);
  });

  it("should reject invalid coordinates", async () => {
    await assert.rejects(
      async () => {
        await findNearbyPGs(null);
      },
      { message: "Valid [longitude, latitude] coordinates are required for geoSearch" }
    );

    await assert.rejects(
      async () => {
        await findNearbyPGs(["invalid", "coords"]);
      },
      { message: "Invalid coordinate numbers provided" }
    );
  });
});

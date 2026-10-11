const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { getDistanceGroup } = require("../utils/distanceLabel.js");

describe("Distance Label Utility", () => {
  it("should handle under 500m", () => {
    const res = getDistanceGroup(250);
    assert.equal(res.group, "under_500m");
    assert.equal(res.groupLabel, "Under 500 m");
    assert.equal(res.formattedDistance, "250 m");
  });

  it("should handle 500m to 1km", () => {
    const res = getDistanceGroup(750);
    assert.equal(res.group, "500m_1km");
    assert.equal(res.groupLabel, "500 m – 1 km");
    assert.equal(res.formattedDistance, "750 m");
  });

  it("should handle 1km to 5km", () => {
    const res = getDistanceGroup(2400);
    assert.equal(res.group, "1km_5km");
    assert.equal(res.groupLabel, "1 – 5 km");
    assert.equal(res.formattedDistance, "2.4 km");
  });

  it("should handle above 5km", () => {
    const res = getDistanceGroup(6500);
    assert.equal(res.group, "above_5km");
    assert.equal(res.groupLabel, "> 5 km");
    assert.equal(res.formattedDistance, "6.5 km");
  });

  it("should handle invalid inputs gracefully", () => {
    assert.equal(getDistanceGroup(null).group, "unknown");
    assert.equal(getDistanceGroup(undefined).group, "unknown");
    assert.equal(getDistanceGroup(-50).group, "unknown");
  });
});

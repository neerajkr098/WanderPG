const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const User = require("../models/user.js");
const College = require("../models/college.js");
const Listing = require("../models/listing.js");

describe("User Model Validation", () => {
  it("should default role to 'student'", () => {
    const user = new User({ email: "test@example.com", username: "student1" });
    assert.equal(user.role, "student");
    assert.equal(user.isSuspended, false);
  });

  it("should allow valid roles: 'owner' and 'admin'", () => {
    const owner = new User({ email: "owner@example.com", username: "owner1", role: "owner" });
    const admin = new User({ email: "admin@example.com", username: "admin1", role: "admin" });
    assert.equal(owner.role, "owner");
    assert.equal(admin.role, "admin");
  });

  it("should fail validation with invalid role", async () => {
    const user = new User({ email: "bad@example.com", username: "bad1", role: "superhero" });
    let err;
    try {
      await user.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.ok(err.errors.role);
  });
});

describe("College Model Validation", () => {
  it("should validate a valid college document", async () => {
    const college = new College({
      name: "Delhi University North Campus",
      city: "New Delhi",
      state: "Delhi",
      slug: "du-north-campus",
      location: {
        type: "Point",
        coordinates: [77.209, 28.689],
      },
    });
    await college.validate();
    assert.equal(college.country, "India");
  });

  it("should require name, city, state, slug, and location", async () => {
    const college = new College({});
    let err;
    try {
      await college.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.ok(err.errors.name);
    assert.ok(err.errors.city);
    assert.ok(err.errors.state);
    assert.ok(err.errors.slug);
    assert.ok(err.errors["location.coordinates"]);
  });
});

describe("Listing Model PG Fields Validation", () => {
  it("should have correct PG field defaults", () => {
    const listing = new Listing({
      title: "Cozy Student PG",
      location: {
        type: "Point",
        coordinates: [77.209, 28.689],
      },
    });

    assert.equal(listing.status, "pending");
    assert.equal(listing.isAvailable, true);
    assert.equal(listing.isDeleted, false);
    assert.deepEqual(listing.roomTypes, ["double"]);
    assert.deepEqual(listing.foodOptions, ["none"]);
    assert.deepEqual(listing.facilities, []);
  });

  it("should reject invalid status", async () => {
    const listing = new Listing({
      title: "Cozy Student PG",
      status: "non-existent-status",
    });
    let err;
    try {
      await listing.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.ok(err.errors.status);
  });

  it("should reject description exceeding 2000 characters", async () => {
    const longDesc = "a".repeat(2001);
    const listing = new Listing({
      title: "Cozy Student PG",
      description: longDesc,
    });
    let err;
    try {
      await listing.validate();
    } catch (e) {
      err = e;
    }
    assert.ok(err);
    assert.ok(err.errors.description);
  });
});

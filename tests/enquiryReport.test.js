const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const Enquiry = require("../models/enquiry.js");
const Report = require("../models/report.js");
const { enquirySchema, reportSchema } = require("../schema.js");

describe("Enquiry & Report Validation", () => {
  describe("Enquiry Schema", () => {
    it("should validate a good student enquiry", () => {
      const valid = {
        enquiry: {
          message: "Hello, is a double sharing room available starting next month?",
        },
      };
      const { error } = enquirySchema.validate(valid);
      assert.equal(error, undefined);
    });

    it("should reject message shorter than 10 characters", () => {
      const invalid = {
        enquiry: {
          message: "Hi there",
        },
      };
      const { error } = enquirySchema.validate(invalid);
      assert.ok(error);
    });

    it("should reject message longer than 500 characters", () => {
      const invalid = {
        enquiry: {
          message: "a".repeat(501),
        },
      };
      const { error } = enquirySchema.validate(invalid);
      assert.ok(error);
    });

    it("should create valid Enquiry document instance", () => {
      const fakeId1 = new mongoose.Types.ObjectId();
      const fakeId2 = new mongoose.Types.ObjectId();
      const fakeId3 = new mongoose.Types.ObjectId();
      const doc = new Enquiry({
        pgId: fakeId1,
        studentId: fakeId2,
        ownerId: fakeId3,
        message: "Is food included in the monthly rent?",
      });
      assert.equal(doc.status, "new");
      assert.equal(doc.message, "Is food included in the monthly rent?");
    });
  });

  describe("Report Schema", () => {
    it("should validate valid reasons", () => {
      const reasons = ["fake", "wrong_price", "not_available", "inappropriate", "other"];
      reasons.forEach((reason) => {
        const { error } = reportSchema.validate({
          report: { reason, details: "Details here" },
        });
        assert.equal(error, undefined);
      });
    });

    it("should reject invalid report reason", () => {
      const { error } = reportSchema.validate({
        report: { reason: "unfriendly_owner", details: "Rude" },
      });
      assert.ok(error);
    });

    it("should create valid Report document instance", () => {
      const fakeId1 = new mongoose.Types.ObjectId();
      const fakeId2 = new mongoose.Types.ObjectId();
      const doc = new Report({
        pgId: fakeId1,
        reporterId: fakeId2,
        reason: "wrong_price",
        details: "Actual price is 12000, not 8000.",
      });
      assert.equal(doc.status, "open");
      assert.equal(doc.reason, "wrong_price");
    });
  });
});

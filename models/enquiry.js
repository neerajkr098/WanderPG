const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const enquirySchema = new Schema(
  {
    pgId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "read", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

enquirySchema.index({ ownerId: 1, createdAt: -1 });
enquirySchema.index({ studentId: 1, pgId: 1, createdAt: -1 });

const Enquiry = mongoose.model("Enquiry", enquirySchema);
module.exports = Enquiry;

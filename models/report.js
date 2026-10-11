const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema(
  {
    pgId: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["fake", "wrong_price", "not_available", "inappropriate", "other"],
      required: true,
    },
    details: {
      type: String,
      maxLength: 500,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "actioned", "dismissed"],
      default: "open",
    },
  },
  { timestamps: true }
);

reportSchema.index({ pgId: 1, status: 1 });
reportSchema.index({ pgId: 1, reporterId: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;

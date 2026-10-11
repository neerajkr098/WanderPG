const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxLength: 2000,
    },
    address: {
      type: String,
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
    // Maintained for backward compatibility with existing views & controllers
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },
    rentMin: {
      type: Number,
      min: 0,
    },
    rentMax: {
      type: Number,
      min: 0,
    },
    // Maintained for backward compatibility
    price: {
      type: Number,
      min: 0,
    },
    roomTypes: {
      type: [String],
      enum: ["single", "double", "triple", "quad"],
      default: ["double"],
    },
    foodOptions: {
      type: [String],
      enum: ["none", "veg", "nonveg", "both"],
      default: ["none"],
    },
    facilities: {
      type: [String],
      enum: [
        "wifi",
        "laundry",
        "parking",
        "furnished",
        "ac",
        "power_backup",
        "cctv",
        "housekeeping",
      ],
      default: [],
    },
    rules: {
      type: String,
    },
    images: [
      {
        url: String,
        filename: String,
        publicId: String,
        alt: String,
      },
    ],
    // Maintained for backward compatibility
    image: {
      url: String,
      filename: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    reviewNote: {
      type: String,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    country: {
      type: String,
      default: "India",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Maintained for backward compatibility
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true }
);

// Indexes per DATABASE.md
listingSchema.index({ location: "2dsphere" });
listingSchema.index({ status: 1, isAvailable: 1, isDeleted: 1 });
listingSchema.index({ ownerId: 1 });

// Ensure backward compatibility syncing before save
listingSchema.pre("save", function () {
  if (this.geometry && (!this.location || !this.location.coordinates || !this.location.coordinates.length)) {
    this.location = this.geometry;
  } else if (this.location && (!this.geometry || !this.geometry.coordinates || !this.geometry.coordinates.length)) {
    this.geometry = this.location;
  }

  if (this.owner && !this.ownerId) {
    this.ownerId = this.owner;
  } else if (this.ownerId && !this.owner) {
    this.owner = this.ownerId;
  }

  if (this.price != null && this.rentMin == null) {
    this.rentMin = this.price;
    this.rentMax = this.price;
  } else if (this.rentMin != null && this.price == null) {
    this.price = this.rentMin;
  }

  if (this.image && (!this.images || !this.images.length)) {
    this.images = [{ url: this.image.url, filename: this.image.filename, publicId: this.image.filename, alt: this.title }];
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

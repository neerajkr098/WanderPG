/**
 * Migration 001: PG Fields Backfill
 * WanderPG Phase 1 Data Model Migration
 *
 * Idempotent migration script that backfills existing listings with:
 * - status = 'approved' (existing WanderNest listings were already live and public)
 * - isAvailable = true
 * - isDeleted = false
 * - rentMin = rentMax = price
 * - roomTypes = ['double']
 * - ownerId = owner
 * - location = geometry
 * - area = location (if location was string)
 *
 * Also backfills existing users with role = 'student' if missing.
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
}

const mongoose = require("mongoose");
const Listing = require("../../models/listing.js");
const User = require("../../models/user.js");

const DB_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderpg";

async function runMigration() {
  console.log("Connecting to database:", DB_URL.split("@").pop()); // mask credentials
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB.");

  // 1. Backfill users missing role
  const userResult = await User.updateMany(
    { role: { $exists: false } },
    { $set: { role: "student", isSuspended: false } }
  );
  console.log(`Users updated (assigned role='student'): ${userResult.modifiedCount}`);

  // 2. Fetch all listings to perform backfill safely
  const listings = await Listing.find({});
  console.log(`Found ${listings.length} listings to verify and backfill.`);

  let updatedCount = 0;
  for (const listing of listings) {
    let changed = false;

    // Status: existing listings were public, default to 'approved'
    if (!listing.status || listing.status === "pending") {
      listing.status = "approved";
      changed = true;
    }

    if (listing.isAvailable === undefined || listing.isAvailable === null) {
      listing.isAvailable = true;
      changed = true;
    }

    if (listing.isDeleted === undefined || listing.isDeleted === null) {
      listing.isDeleted = false;
      changed = true;
    }

    // Rent backfill from price
    if (listing.price && (listing.rentMin == null || listing.rentMax == null)) {
      listing.rentMin = listing.price;
      listing.rentMax = listing.price;
      changed = true;
    }

    // Room types default
    if (!listing.roomTypes || !listing.roomTypes.length) {
      listing.roomTypes = ["double"];
      changed = true;
    }

    // Owner sync
    if (listing.owner && !listing.ownerId) {
      listing.ownerId = listing.owner;
      changed = true;
    }

    // Location / Geometry sync
    if (listing.geometry && (!listing.location || !listing.location.coordinates || !listing.location.coordinates.length)) {
      listing.location = {
        type: "Point",
        coordinates: listing.geometry.coordinates,
      };
      changed = true;
    }

    // Images array backfill
    if (listing.image && (!listing.images || !listing.images.length)) {
      listing.images = [
        {
          url: listing.image.url,
          filename: listing.image.filename,
          publicId: listing.image.filename,
          alt: listing.title,
        },
      ];
      changed = true;
    }

    if (changed) {
      await listing.save();
      updatedCount++;
    }
  }

  console.log(`Listings backfilled: ${updatedCount}/${listings.length}`);

  // 3. Ensure 2dsphere indexes
  await Listing.collection.createIndex({ location: "2dsphere" });
  console.log("Verified 2dsphere index on listings.location");

  await mongoose.disconnect();
  console.log("Migration 001 completed successfully.");
}

if (require.main === module) {
  runMigration().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}

module.exports = runMigration;

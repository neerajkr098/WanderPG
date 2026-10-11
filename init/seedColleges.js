/**
 * WanderPG College Seeder
 * Seeds launch colleges into the database with 2dsphere index.
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
}

const mongoose = require("mongoose");
const College = require("../models/college.js");
const { data: collegesData } = require("./colleges.js");

const DB_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderpg";

async function seedColleges() {
  console.log("Connecting to database for college seeding...");
  await mongoose.connect(DB_URL);
  console.log("Connected to MongoDB.");

  for (const college of collegesData) {
    const existing = await College.findOne({ slug: college.slug });
    if (!existing) {
      await College.create(college);
      console.log(`Inserted college: ${college.name} (${college.slug})`);
    } else {
      console.log(`College already exists: ${college.name}`);
    }
  }

  await College.collection.createIndex({ location: "2dsphere" });
  console.log("Verified 2dsphere index on colleges.location.");

  await mongoose.disconnect();
  console.log("College seeding finished.");
}

if (require.main === module) {
  seedColleges().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}

module.exports = seedColleges;

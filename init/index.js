require("dotenv").config({ path: "../.env" }); // Make sure to load your Mapbox token
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGO_URL = "mongodb://127.0.0.1:27017/WanderNest";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Loop through each listing and fetch its actual coordinates
  for (let i = 0; i < initData.data.length; i++) {
    const response = await geocodingClient
      .forwardGeocode({
        query: initData.data[i].location, // E.g., "Malibu", "Aspen"
        limit: 1,
      })
      .send();

    initData.data[i].owner = "6abf372877ed4b25d1fc6ce4"; // Remember to use a valid user ID!
    initData.data[i].geometry = response.body.features[0].geometry;
  }

  await Listing.insertMany(initData.data);
  console.log("data was initialized with real map coordinates!");
};

initDB();

const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../cloudConfig.js");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({
    status: "approved",
    isAvailable: true,
    isDeleted: false,
  });
  res.render("listings/index", { allListings });
};

module.exports.renderNewform = (req, res) => {
  res.render("listings/new");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner", "username");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.createListing = async (req, res) => {
  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  if (!response.body.features || response.body.features.length === 0) {
    req.flash("error", "Could not geocode the provided location. Please enter a valid location.");
    return res.redirect("/listings/new");
  }

  const url = req.file ? req.file.path : "";
  const filename = req.file ? req.file.filename : "";
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.ownerId = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = response.body.features[0].geometry;
  newlisting.location = {
    type: "Point",
    coordinates: response.body.features[0].geometry.coordinates,
  };

  // Status is pending until approved by admin per PRD Feature 5
  newlisting.status = req.user.role === "admin" ? "approved" : "pending";

  await newlisting.save();
  req.flash("success", "New PG submitted! It will appear in search once approved.");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!!");
    return res.redirect("/listings");
  }
  let originalImageUrl = (listing.image && listing.image.url) || "";
  if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  }
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Re-geocode if location string was changed
  if (
    req.body.listing &&
    req.body.listing.location &&
    req.body.listing.location !== listing.location
  ) {
    try {
      const response = await geocodingClient
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1,
        })
        .send();

      if (response.body.features && response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
        listing.location = {
          type: "Point",
          coordinates: response.body.features[0].geometry.coordinates,
        };
      }
    } catch (e) {
      console.error("Geocoding update error:", e);
    }
  }

  // Assign updated fields
  Object.assign(listing, req.body.listing);

  // If a new image was uploaded, delete old Cloudinary image and update
  if (req.file) {
    if (listing.image && listing.image.filename) {
      try {
        await cloudinary.uploader.destroy(listing.image.filename);
      } catch (err) {
        console.error("Error removing old image from Cloudinary:", err);
      }
    }
    listing.image = { url: req.file.path, filename: req.file.filename };
  }

  // Edited listings return to pending for review per PRD
  if (req.user.role !== "admin") {
    listing.status = "pending";
  }

  await listing.save();
  req.flash("success", "Listing updated! It will be reviewed before appearing publicly.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (listing && listing.image && listing.image.filename) {
    try {
      await cloudinary.uploader.destroy(listing.image.filename);
    } catch (err) {
      console.error("Error destroying image on delete:", err);
    }
  }
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

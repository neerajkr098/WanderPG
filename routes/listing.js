const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");

const { isLoggedIn, isOwner, isOwnerRole, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    isOwnerRole,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.createListing),
  );

// New Route
router.get("/new", isLoggedIn, isOwnerRole, listingController.renderNewform);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    validateListing,
    wrapAsync(listingController.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm),
);

module.exports = router;

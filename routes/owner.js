const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwnerRole, isOwner } = require("../middleware.js");
const ownerController = require("../controllers/owner.js");

// All owner routes require logged in user with owner or admin role
router.use(isLoggedIn, isOwnerRole);

// GET /owner/listings - Owner Dashboard
router.get("/listings", wrapAsync(ownerController.dashboard));

// POST /owner/listings/:id/toggle-availability - Toggle availability
router.post(
  "/listings/:id/toggle-availability",
  isOwner,
  wrapAsync(ownerController.toggleAvailability)
);

// Enquiry Inbox for Owners
const enquiryController = require("../controllers/enquiries.js");

// GET /owner/enquiries - Owner Inbox
router.get("/enquiries", wrapAsync(enquiryController.ownerInbox));

// POST /owner/enquiries/:enquiryId/status - Update enquiry status
router.post(
  "/enquiries/:enquiryId/status",
  wrapAsync(enquiryController.updateEnquiryStatus)
);

module.exports = router;

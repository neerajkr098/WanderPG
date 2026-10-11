const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdminRole } = require("../middleware.js");
const reportController = require("../controllers/reports.js");

// All admin routes require admin role
router.use(isLoggedIn, isAdminRole);

// GET /admin/dashboard - Moderation queue & reports
router.get("/dashboard", wrapAsync(reportController.adminQueue));

// POST /admin/listings/:id/status - Approve, Reject, Suspend listing
router.post(
  "/listings/:id/status",
  wrapAsync(reportController.updateListingStatus)
);

// POST /admin/reports/:reportId/resolve - Action or Dismiss report
router.post(
  "/reports/:reportId/resolve",
  wrapAsync(reportController.resolveReport)
);

module.exports = router;

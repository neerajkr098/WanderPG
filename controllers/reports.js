const Listing = require("../models/listing.js");
const Report = require("../models/report.js");

module.exports.createReport = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const reporterId = req.user._id;

  // Check if user already reported this listing
  const existingReport = await Report.findOne({
    pgId: id,
    reporterId,
  });

  if (existingReport) {
    req.flash("error", "You have already reported this listing. Our team is reviewing it.");
    return res.redirect(`/listings/${id}`);
  }

  const { reason, details } = req.body.report;

  const report = new Report({
    pgId: id,
    reporterId,
    reason,
    details: details || "",
    status: "open",
  });

  await report.save();

  // Increment reportCount on listing
  listing.reportCount = (listing.reportCount || 0) + 1;

  // Auto-hide rule per PRD: 3 distinct reports auto-hide a listing pending admin review
  if (listing.reportCount >= 3) {
    listing.status = "suspended";
    listing.reviewNote = "Auto-suspended due to multiple community reports";
  }

  await listing.save();

  req.flash(
    "success",
    "Thank you. Your report has been submitted and will be reviewed by moderation."
  );
  res.redirect(`/listings/${id}`);
};

module.exports.adminQueue = async (req, res) => {
  const pendingListings = await Listing.find({
    status: "pending",
    isDeleted: { $ne: true },
  })
    .populate("owner", "username email")
    .sort({ createdAt: -1 });

  const openReports = await Report.find({ status: "open" })
    .populate("pgId", "title location owner status")
    .populate("reporterId", "username email")
    .sort({ createdAt: -1 });

  const suspendedListings = await Listing.find({
    status: "suspended",
    isDeleted: { $ne: true },
  })
    .populate("owner", "username email")
    .sort({ updatedAt: -1 });

  res.render("admin/dashboard", {
    pendingListings,
    openReports,
    suspendedListings,
  });
};

module.exports.updateListingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, reviewNote } = req.body;

  if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
    req.flash("error", "Invalid status selection");
    return res.redirect("/admin/dashboard");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/dashboard");
  }

  listing.status = status;
  if (reviewNote) {
    listing.reviewNote = reviewNote;
  }

  await listing.save();
  req.flash("success", `Listing status updated to ${status}`);
  res.redirect("/admin/dashboard");
};

module.exports.resolveReport = async (req, res) => {
  const { reportId } = req.params;
  const { status } = req.body; // 'actioned' or 'dismissed'

  if (!["actioned", "dismissed"].includes(status)) {
    req.flash("error", "Invalid report resolution status");
    return res.redirect("/admin/dashboard");
  }

  const report = await Report.findById(reportId);
  if (!report) {
    req.flash("error", "Report not found");
    return res.redirect("/admin/dashboard");
  }

  report.status = status;
  await report.save();

  req.flash("success", `Report marked as ${status}`);
  res.redirect("/admin/dashboard");
};

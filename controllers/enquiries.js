const Listing = require("../models/listing.js");
const Enquiry = require("../models/enquiry.js");

module.exports.createEnquiry = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const studentId = req.user._id;
  const ownerId = listing.ownerId || listing.owner;

  // Prevent owner from enquiring on their own listing
  if (ownerId && ownerId.equals(studentId)) {
    req.flash("error", "You cannot send an enquiry on your own property.");
    return res.redirect(`/listings/${id}`);
  }

  // Rate limit check: 1 per student per listing per 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const existingRecentEnquiry = await Enquiry.findOne({
    pgId: id,
    studentId: studentId,
    createdAt: { $gte: oneDayAgo },
  });

  if (existingRecentEnquiry) {
    req.flash(
      "error",
      "You have already sent an enquiry for this PG in the last 24 hours. The owner will respond soon!"
    );
    return res.redirect(`/listings/${id}`);
  }

  // Rate limit check: max 5 enquiries per student per day
  const dailyCount = await Enquiry.countDocuments({
    studentId: studentId,
    createdAt: { $gte: oneDayAgo },
  });

  if (dailyCount >= 5) {
    req.flash(
      "error",
      "Daily enquiry limit reached (5 per day). Please try again tomorrow."
    );
    return res.redirect(`/listings/${id}`);
  }

  const { message } = req.body.enquiry;
  const enquiry = new Enquiry({
    pgId: id,
    studentId,
    ownerId,
    message,
    status: "new",
  });

  await enquiry.save();
  req.flash("success", "Your enquiry was sent successfully to the owner!");
  res.redirect(`/listings/${id}`);
};

module.exports.ownerInbox = async (req, res) => {
  const ownerId = req.user._id;

  const enquiries = await Enquiry.find({ ownerId })
    .populate("pgId", "title location")
    .populate("studentId", "username email phone")
    .sort({ createdAt: -1 });

  res.render("owner/enquiries", {
    enquiries,
  });
};

module.exports.updateEnquiryStatus = async (req, res) => {
  const { enquiryId } = req.params;
  const { status } = req.body;

  if (!["new", "read", "closed"].includes(status)) {
    req.flash("error", "Invalid status update");
    return res.redirect("/owner/enquiries");
  }

  const enquiry = await Enquiry.findOne({
    _id: enquiryId,
    ownerId: req.user._id,
  });

  if (!enquiry) {
    req.flash("error", "Enquiry not found");
    return res.redirect("/owner/enquiries");
  }

  enquiry.status = status;
  await enquiry.save();

  req.flash("success", `Enquiry marked as ${status}`);
  res.redirect("/owner/enquiries");
};

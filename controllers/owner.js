const Listing = require("../models/listing.js");

module.exports.dashboard = async (req, res) => {
  const ownerId = req.user._id;

  const listings = await Listing.find({
    $or: [{ ownerId: ownerId }, { owner: ownerId }],
    isDeleted: { $ne: true },
  }).sort({ createdAt: -1 });

  const stats = {
    total: listings.length,
    approved: listings.filter((l) => l.status === "approved").length,
    pending: listings.filter((l) => l.status === "pending").length,
    available: listings.filter((l) => l.isAvailable).length,
  };

  res.render("owner/dashboard", {
    listings,
    stats,
  });
};

module.exports.toggleAvailability = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/owner/listings");
  }

  listing.isAvailable = !listing.isAvailable;
  await listing.save();

  const msg = listing.isAvailable
    ? "Listing is now marked as Available for students."
    : "Listing is now marked as Occupied / Unavailable.";

  req.flash("success", msg);
  res.redirect("/owner/listings");
};

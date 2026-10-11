const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return next(new ExpressError(404, "Listing not found"));
  }
  const listing = await Listing.findById(id);
  if (!listing) {
    return next(new ExpressError(404, "Listing not found"));
  }
  const ownerId = listing.ownerId || listing.owner;
  if (!ownerId || (!ownerId.equals(res.locals.currUser._id) && res.locals.currUser.role !== "admin")) {
    return next(new ExpressError(404, "Listing not found"));
  }
  next();
};

module.exports.isOwnerRole = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in as an owner!");
    return res.redirect("/login");
  }
  if (req.user.role !== "owner" && req.user.role !== "admin") {
    req.flash("error", "Only PG owners can access this page.");
    return res.redirect("/listings");
  }
  next();
};

module.exports.isAdminRole = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in as an administrator!");
    return res.redirect("/login");
  }
  if (req.user.role !== "admin") {
    req.flash("error", "Unauthorized access.");
    return res.redirect("/listings");
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  if (
    !mongoose.isValidObjectId(id) ||
    !mongoose.isValidObjectId(reviewId)
  ) {
    return next(new ExpressError(404, "Review not found"));
  }
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new ExpressError(404, "Review not found"));
  }
  if (!review.author || !review.author.equals(res.locals.currUser._id)) {
    return next(new ExpressError(404, "Review not found"));
  }
  next();
};

module.exports.validateEnquiry = (req, res, next) => {
  const { enquirySchema } = require("./schema.js");
  const { error } = enquirySchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReport = (req, res, next) => {
  const { reportSchema } = require("./schema.js");
  const { error } = reportSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

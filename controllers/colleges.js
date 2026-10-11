const College = require("../models/college.js");
const { findNearbyPGs } = require("../services/geoSearch.js");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.index = async (req, res) => {
  const { q, page = 1 } = req.query;
  const limit = 20;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const skip = (currentPage - 1) * limit;

  let query = {};
  if (q && q.trim()) {
    const escaped = escapeRegex(q.trim());
    query = {
      $or: [
        { name: { $regex: escaped, $options: "i" } },
        { city: { $regex: escaped, $options: "i" } },
      ],
    };
  }

  const total = await College.countDocuments(query);
  const colleges = await College.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  res.render("colleges/index", {
    colleges,
    q: q || "",
    total,
    page: currentPage,
    totalPages: Math.ceil(total / limit) || 1,
  });
};

module.exports.show = async (req, res) => {
  const { identifier } = req.params;

  let college = await College.findOne({ slug: identifier });
  if (!college && /^[0-9a-fA-F]{24}$/.test(identifier)) {
    college = await College.findById(identifier);
  }

  if (!college) {
    req.flash("error", "College not found");
    return res.redirect("/colleges");
  }

  const {
    maxDistance = 5000,
    page = 1,
    minRent,
    maxRent,
    roomType,
    foodOption,
    facilities,
    sortBy = "distance",
  } = req.query;

  let searchResults = { listings: [], total: 0, page: 1, totalPages: 1, maxDistance: 5000 };

  if (
    college.location &&
    college.location.coordinates &&
    college.location.coordinates.length === 2
  ) {
    searchResults = await findNearbyPGs(college.location.coordinates, {
      maxDistance,
      page,
      minRent,
      maxRent,
      roomType,
      foodOption,
      facilities,
      sortBy,
    });
  }

  const isLoggedIn = !!req.user;

  // Approximate vs exact coordinates for Mapbox per PRD
  const pgMarkers = searchResults.listings.map((pg) => {
    const coords = (pg.location && pg.location.coordinates) || (pg.geometry && pg.geometry.coordinates) || [];
    let displayCoords = coords;
    if (!isLoggedIn && coords.length === 2) {
      // Round coordinates to ~1 km for privacy
      displayCoords = [
        Math.round(coords[0] * 100) / 100,
        Math.round(coords[1] * 100) / 100,
      ];
    }
    return {
      id: pg._id,
      title: pg.title,
      rentMin: pg.rentMin || pg.price,
      distanceFormatted: pg.distanceFormatted,
      coordinates: displayCoords,
    };
  });

  res.render("colleges/show", {
    college,
    listings: searchResults.listings,
    total: searchResults.total,
    page: searchResults.page,
    totalPages: searchResults.totalPages,
    filters: {
      maxDistance,
      minRent: minRent || "",
      maxRent: maxRent || "",
      roomType: roomType || "",
      foodOption: foodOption || "",
      facilities: Array.isArray(facilities) ? facilities : facilities ? [facilities] : [],
      sortBy,
    },
    pgMarkers,
    isLoggedIn,
  });
};

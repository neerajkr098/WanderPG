/**
 * WanderPG GeoSearch Service
 * Responsible for building and executing MongoDB $geoNear aggregation pipelines.
 * All spatial distance calculations must originate here per PRD and ARCHITECTURE.
 */

const Listing = require("../models/listing.js");
const { getDistanceGroup } = require("../utils/distanceLabel.js");

const DEFAULT_MAX_DISTANCE = 5000; // 5 km maximum allowed in MVP
const DEFAULT_LIMIT = 12; // 12 cards per page per PRD

async function findNearbyPGs(coordinates, options = {}) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Valid [longitude, latitude] coordinates are required for geoSearch");
  }

  const [lng, lat] = coordinates.map(Number);
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error("Invalid coordinate numbers provided");
  }

  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(options.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  // Max radius in meters, capped at 5000 per PRD
  const requestedMaxDistance = parseInt(options.maxDistance, 10) || DEFAULT_MAX_DISTANCE;
  const maxDistance = Math.min(requestedMaxDistance, DEFAULT_MAX_DISTANCE);

  // Match query within $geoNear
  const matchQuery = {
    $or: [{ status: "approved" }, { status: { $exists: false } }],
    isAvailable: { $ne: false },
    isDeleted: { $ne: true },
  };

  // Filter: Rent range
  if (options.minRent != null && !isNaN(options.minRent)) {
    matchQuery.rentMin = { ...matchQuery.rentMin, $gte: Number(options.minRent) };
  }
  if (options.maxRent != null && !isNaN(options.maxRent)) {
    matchQuery.rentMax = { ...matchQuery.rentMax, $lte: Number(options.maxRent) };
  }

  // Filter: Room type
  if (options.roomType) {
    matchQuery.roomTypes = { $in: [options.roomType] };
  }

  // Filter: Food option
  if (options.foodOption) {
    matchQuery.foodOptions = { $in: [options.foodOption] };
  }

  // Filter: Facilities (allow-listed array match)
  if (options.facilities) {
    const facilityList = Array.isArray(options.facilities)
      ? options.facilities
      : [options.facilities];
    if (facilityList.length > 0) {
      matchQuery.facilities = { $all: facilityList };
    }
  }

  // Primary sort stage
  const sortStage = {};
  if (options.sortBy === "rent_asc") {
    sortStage.rentMin = 1;
    sortStage.distance = 1;
  } else if (options.sortBy === "rent_desc") {
    sortStage.rentMax = -1;
    sortStage.distance = 1;
  } else {
    // Default sort: distance
    sortStage.distance = 1;
  }

  const pipeline = [
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng, lat],
        },
        distanceField: "distance",
        maxDistance: maxDistance,
        spherical: true,
        query: matchQuery,
      },
    },
    { $sort: sortStage },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const [result] = await Listing.aggregate(pipeline);
  const total = (result.metadata[0] && result.metadata[0].total) || 0;
  const listings = (result.data || []).map((item) => {
    const distInfo = getDistanceGroup(item.distance);
    return {
      ...item,
      distanceFormatted: distInfo.formattedDistance,
      distanceGroup: distInfo.group,
      distanceGroupLabel: distInfo.groupLabel,
    };
  });

  return {
    listings,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    maxDistance,
  };
}

module.exports = {
  findNearbyPGs,
  DEFAULT_MAX_DISTANCE,
  DEFAULT_LIMIT,
};

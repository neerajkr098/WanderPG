/**
 * WanderPG Distance Labeling Utility
 * Computes human-readable distance labels and PRD-compliant distance groups.
 */

function getDistanceGroup(distanceInMeters) {
  if (distanceInMeters == null || isNaN(distanceInMeters) || distanceInMeters < 0) {
    return {
      group: "unknown",
      groupLabel: "Unknown distance",
      formattedDistance: "Unknown",
    };
  }

  const roundedMeters = Math.round(distanceInMeters);

  if (roundedMeters < 500) {
    return {
      group: "under_500m",
      groupLabel: "Under 500 m",
      formattedDistance: `${roundedMeters} m`,
    };
  }

  if (roundedMeters <= 1000) {
    return {
      group: "500m_1km",
      groupLabel: "500 m – 1 km",
      formattedDistance: roundedMeters === 1000 ? "1.0 km" : `${roundedMeters} m`,
    };
  }

  const km = (distanceInMeters / 1000).toFixed(1);

  if (distanceInMeters <= 5000) {
    return {
      group: "1km_5km",
      groupLabel: "1 – 5 km",
      formattedDistance: `${km} km`,
    };
  }

  return {
    group: "above_5km",
    groupLabel: "> 5 km",
    formattedDistance: `${km} km`,
  };
}

module.exports = {
  getDistanceGroup,
};

const axios = require("axios");
const captainModel = require("../models/captain.model");

const USER_AGENT = "UberCloneApp/1.0 (contact@ubercloneapp.com)";

module.exports.getAddressCoordinate = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  // 1. Try Nominatim OpenStreetMap (Free, keyless)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000,
    });

    if (response.data && response.data.length > 0) {
      return {
        ltd: parseFloat(response.data[0].lat),
        lng: parseFloat(response.data[0].lon),
      };
    }
  } catch (err) {
    console.warn("Nominatim Geocoding fallback:", err.message);
  }

  // 2. Try Google Maps API if configured
  if (process.env.GOOGLE_MAPS_API) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API}`;
      const response = await axios.get(url, { timeout: 4000 });
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          ltd: location.lat,
          lng: location.lng,
        };
      }
    } catch (err) {
      console.warn("Google Maps Geocoding fallback:", err.message);
    }
  }

  // 3. Fallback mock coordinates (New Delhi center with pseudo-random offset based on address)
  const hash = address.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offsetLat = (hash % 100) * 0.001;
  const offsetLng = (hash % 80) * 0.001;

  return {
    ltd: 28.6139 + offsetLat,
    lng: 77.209 + offsetLng,
  };
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  // Obtain coordinates for origin & destination
  const originCoords = await module.exports.getAddressCoordinate(origin);
  const destCoords = await module.exports.getAddressCoordinate(destination);

  // 1. Try OSRM (Open Source Routing Machine - Free, keyless)
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords.lng},${originCoords.ltd};${destCoords.lng},${destCoords.ltd}?overview=full&geometries=geojson`;
    const response = await axios.get(osrmUrl, { timeout: 5000 });

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distMeters = route.distance; // meters
      const durSeconds = route.duration; // seconds

      return {
        distance: {
          text: `${(distMeters / 1000).toFixed(1)} km`,
          value: Math.round(distMeters),
        },
        duration: {
          text: `${Math.round(durSeconds / 60)} mins`,
          value: Math.round(durSeconds),
        },
        geometry: route.geometry, // GeoJSON LineString
      };
    }
  } catch (err) {
    console.warn("OSRM Distance Matrix fallback:", err.message);
  }

  // 2. Haversine distance fallback
  const distKm = getDistanceInKm(
    originCoords.ltd,
    originCoords.lng,
    destCoords.ltd,
    destCoords.lng
  );
  const distMeters = Math.round(distKm * 1000);
  const durSeconds = Math.round((distKm / 35) * 3600); // Avg 35 km/h driving speed

  return {
    distance: {
      text: `${distKm.toFixed(1)} km`,
      value: distMeters,
    },
    duration: {
      text: `${Math.round(durSeconds / 60)} mins`,
      value: durSeconds,
    },
  };
};

module.exports.getAutoCompleteSuggestions = async (input) => {
  if (!input || input.trim().length === 0) {
    return [];
  }

  // 1. Try Nominatim OpenStreetMap Suggestions (Free, keyless)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 4000,
    });

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item) => item.display_name);
    }
  } catch (err) {
    console.warn("Nominatim Autocomplete fallback:", err.message);
  }

  // 2. Fallback mock suggestions for search UI usability
  return [
    `${input}, Connaught Place, New Delhi`,
    `${input}, Hitech City, Hyderabad`,
    `${input}, Bandra Kurla Complex, Mumbai`,
    `${input}, MG Road, Bengaluru`,
  ];
};

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {
  const pickupLat = Number(ltd);
  const pickupLng = Number(lng);

  if (!Number.isFinite(pickupLat) || !Number.isFinite(pickupLng)) {
    throw new Error("Invalid pickup coordinates");
  }

  // Try 2DSphere spatial query first (only active online captains)
  try {
    const captainsGeo = await captainModel.find({
      status: "active",
      socketId: { $exists: true, $ne: null },
      locationGeo: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickupLng, pickupLat],
          },
          $maxDistance: radius * 1000, // meters
        },
      },
    });

    if (captainsGeo && captainsGeo.length > 0) {
      return captainsGeo;
    }
  } catch (err) {
    console.warn("2DSphere query fallback to Haversine:", err.message);
  }

  // Fallback to Haversine calculation for active captains
  const captains = await captainModel.find({
    status: "active",
    socketId: { $exists: true, $ne: null },
  });

  const matched = captains.filter((captain) => {
    const captainLat = Number(captain.location?.ltd);
    const captainLng = Number(captain.location?.lng);

    if (!Number.isFinite(captainLat) || !Number.isFinite(captainLng)) {
      return true;
    }

    return getDistanceInKm(pickupLat, pickupLng, captainLat, captainLng) <= radius;
  });

  return matched.length > 0 ? matched : captains;
};

function getDistanceInKm(lat1, lng1, lat2, lng2) {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

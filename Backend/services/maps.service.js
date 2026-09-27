const axios = require("axios");
const captainModel = require("../models/captain.model");

const USER_AGENT = "UberCloneApp/2.0 (contact@ubercloneapp.com)";

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

function capitalizeWords(str) {
  if (!str) return "";
  const smallWords = new Set(["and", "for", "the", "via", "of", "in", "to", "at", "by", "near", "sri"]);
  return str
    .split(" ")
    .map((w) => {
      if (w.length === 0) return "";
      const lower = w.toLowerCase();
      if (w.length <= 3 && !smallWords.has(lower)) {
        return w.toUpperCase();
      }
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

module.exports.getAddressCoordinate = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }

  // 1. Try Photon Geocoding (Free, fast, keyless)
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1`;
    const response = await axios.get(photonUrl, { timeout: 4000 });
    if (response.data?.features && response.data.features.length > 0) {
      const coords = response.data.features[0].geometry.coordinates;
      return {
        ltd: coords[1],
        lng: coords[0],
      };
    }
  } catch (err) {
    console.warn("Photon Geocoding fallback:", err.message);
  }

  // 2. Try Nominatim OpenStreetMap (Free, keyless)
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 4000,
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

  // 3. Try Google Maps API if configured
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

  // 4. Fallback mock coordinates (New Delhi center with pseudo-random offset based on address)
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

module.exports.getAutoCompleteSuggestions = async (input, userLat, userLng) => {
  if (!input || input.trim().length === 0) {
    return [];
  }

  const queryText = input.trim();
  const uLat = Number(userLat);
  const uLng = Number(userLng);
  const hasUserCoords = Number.isFinite(uLat) && Number.isFinite(uLng);

  // Helper function to query Photon
  const fetchPhoton = async (q) => {
    try {
      let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=15`;
      if (hasUserCoords) {
        url += `&lat=${uLat}&lon=${uLng}`;
      }
      const res = await axios.get(url, { timeout: 4000 });
      return res.data?.features || [];
    } catch (err) {
      console.warn(`Photon query error for "${q}":`, err.message);
      return [];
    }
  };

  let features = await fetchPhoton(queryText);

  // Check how many results are from India
  let indianCount = features.filter((f) => {
    const cc = f.properties?.countrycode;
    const country = f.properties?.country || "";
    return cc === "IN" || country.toLowerCase().includes("india");
  }).length;

  // If few or no results in India and input has multiple words (e.g. "bbd university"),
  // also search by primary keyword (e.g. "bbd") to ensure local landmarks are returned
  if (indianCount < 3 && queryText.includes(" ")) {
    const tokens = queryText.split(/\s+/);
    const stopWords = new Set([
      "university", "college", "school", "hospital", "station",
      "road", "chowk", "near", "stand", "st", "nagar", "market"
    ]);

    const meaningfulTokens = tokens.filter(
      (t) => t.length >= 3 && !stopWords.has(t.toLowerCase())
    );
    const tokenToSearch = meaningfulTokens[0] || tokens[0];

    if (tokenToSearch && tokenToSearch.length >= 2) {
      const extraFeatures = await fetchPhoton(tokenToSearch);
      features = [...features, ...extraFeatures];
    }
  }

  // Deduplicate and process features
  const seen = new Set();
  const processed = [];

  for (const f of features) {
    if (!f.geometry?.coordinates) continue;
    const [lon, lat] = f.geometry.coordinates;
    const p = f.properties || {};

    const placeName = p.name ? capitalizeWords(p.name) : "";
    if (!placeName) continue;

    // Unique key to prevent duplicates
    const key = `${placeName.toLowerCase()}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const distKm = hasUserCoords ? getDistanceInKm(uLat, uLng, lat, lon) : null;
    const isIndia =
      p.countrycode === "IN" ||
      (p.country && p.country.toLowerCase().includes("india")) ||
      (distKm !== null && distKm <= 60);

    // Filter to India
    if (!isIndia) continue;

    // Build secondary address parts
    const secondaryList = [
      p.street ? capitalizeWords(p.street) : "",
      p.suburb || p.district || p.neighbourhood ? capitalizeWords(p.suburb || p.district || p.neighbourhood) : "",
      p.city || p.town || p.county ? capitalizeWords(p.city || p.town || p.county) : "",
      p.state ? capitalizeWords(p.state) : "",
    ].filter((part) => part && part.toLowerCase() !== placeName.toLowerCase());

    // Deduplicate identical adjacent components
    const cleanSecondary = [];
    secondaryList.forEach((item) => {
      if (!cleanSecondary.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        cleanSecondary.push(item);
      }
    });

    const secondaryText = cleanSecondary.join(", ");
    const fullDescription = secondaryText ? `${placeName}, ${secondaryText}` : placeName;

    processed.push({
      description: fullDescription,
      placeName: placeName,
      secondaryText: secondaryText || (p.state ? capitalizeWords(p.state) : "India"),
      distanceKm: distKm !== null ? `${distKm.toFixed(1)} km` : "",
      distanceValue: distKm !== null ? distKm : 999999,
      ltd: lat,
      lng: lon,
    });
  }

  // Sort strictly ascending by distance (closest first!)
  if (hasUserCoords) {
    processed.sort((a, b) => a.distanceValue - b.distanceValue);
  }

  if (processed.length > 0) {
    return processed;
  }

  // 2. Fallback to Nominatim if Photon returned nothing
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryText)}&format=json&addressdetails=1&countrycodes=in&limit=5`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 4000,
    });

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      return response.data.map((item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const distKm = hasUserCoords ? getDistanceInKm(uLat, uLng, lat, lon) : null;
        return {
          description: item.display_name,
          placeName: item.display_name.split(",")[0],
          secondaryText: item.display_name.split(",").slice(1, 4).join(",").trim(),
          distanceKm: distKm !== null ? `${distKm.toFixed(1)} km` : "",
          distanceValue: distKm !== null ? distKm : 999999,
          ltd: lat,
          lng: lon,
        };
      });
    }
  } catch (err) {
    console.warn("Nominatim fallback suggestions error:", err.message);
  }

  // Fallback mock suggestions if all external APIs fail
  return [
    {
      description: `${queryText}, Hazratganj, Lucknow`,
      placeName: queryText,
      secondaryText: "Hazratganj, Lucknow, Uttar Pradesh",
      distanceKm: "5.0 km",
      distanceValue: 5,
      ltd: 26.8467,
      lng: 80.9462,
    },
    {
      description: `${queryText}, Gomti Nagar, Lucknow`,
      placeName: queryText,
      secondaryText: "Gomti Nagar, Lucknow, Uttar Pradesh",
      distanceKm: "6.5 km",
      distanceValue: 6.5,
      ltd: 26.8500,
      lng: 80.9990,
    },
    {
      description: `${queryText}, Connaught Place, New Delhi`,
      placeName: queryText,
      secondaryText: "Connaught Place, New Delhi",
      distanceKm: "450 km",
      distanceValue: 450,
      ltd: 28.6315,
      lng: 77.2167,
    },
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

module.exports.reverseGeocode = async (ltd, lng) => {
  const lat = Number(ltd);
  const lon = Number(lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Valid latitude and longitude are required");
  }

  // 1. Try Komoot Photon Reverse Geocoding (Free, fast, keyless, exact street level)
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}`;
    const response = await axios.get(photonUrl, { timeout: 4000 });

    if (response.data?.features && response.data.features.length > 0) {
      const p = response.data.features[0].properties || {};
      const parts = [
        p.name ? capitalizeWords(p.name) : "",
        p.street ? capitalizeWords(p.street) : "",
        p.suburb || p.district || p.neighbourhood ? capitalizeWords(p.suburb || p.district || p.neighbourhood) : "",
        p.city || p.town ? capitalizeWords(p.city || p.town) : "",
        p.county && p.county !== p.city ? capitalizeWords(p.county) : "",
        p.state ? capitalizeWords(p.state) : "",
      ].filter(Boolean);

      // Deduplicate parts
      const cleanParts = [];
      parts.forEach((part) => {
        if (!cleanParts.some((cp) => cp.toLowerCase() === part.toLowerCase())) {
          cleanParts.push(part);
        }
      });

      if (cleanParts.length > 0) {
        // Short readable address: e.g. "Panitanki Road, Tiwariganj, Lucknow"
        const readableAddress = cleanParts.slice(0, 3).join(", ");
        const fullAddress = [...cleanParts, p.postcode, "India"].filter(Boolean).join(", ");

        return {
          address: readableAddress,
          fullAddress: fullAddress,
          ltd: lat,
          lng: lon,
        };
      }
    }
  } catch (err) {
    console.warn("Photon reverse geocode fallback:", err.message);
  }

  // 2. Try BigDataCloud Reverse Geocoding Client (Free, keyless)
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const response = await axios.get(bdcUrl, { timeout: 4000 });

    if (response.data && (response.data.locality || response.data.city)) {
      const data = response.data;
      const parts = [
        data.locality,
        data.city,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);

      const readableAddress = parts.slice(0, 2).join(", ");
      return {
        address: readableAddress,
        fullAddress: parts.join(", "),
        ltd: lat,
        lng: lon,
      };
    }
  } catch (err) {
    console.warn("BigDataCloud reverse geocode fallback:", err.message);
  }

  // 3. Try Nominatim Reverse Geocoding (Free, keyless)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 5000,
    });

    if (response.data && response.data.address) {
      const addr = response.data.address;
      const parts = [
        addr.building || addr.amenity || addr.shop || addr.house_number,
        addr.road || addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.village || addr.county,
        addr.state,
      ].filter(Boolean);

      const readableAddress = parts.length > 0 ? parts.join(", ") : response.data.display_name;

      return {
        address: readableAddress,
        fullAddress: response.data.display_name,
        ltd: lat,
        lng: lon,
      };
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode fallback:", err.message);
  }

  // 4. Fallback label
  return {
    address: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
    fullAddress: `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
    ltd: lat,
    lng: lon,
  };
};



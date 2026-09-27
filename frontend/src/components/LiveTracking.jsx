import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Default coordinates: New Delhi center
const defaultPosition = [28.6139, 77.2090];

// Custom Leaflet DivIcon helpers for clean UI
const createCustomIcon = (bgColor, iconClass, label) => {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        background-color: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        border: 2px solid white;
        font-size: 18px;
      ">
        <i className="${iconClass}"></i>
      </div>
      ${label ? `<div style="background: black; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-top: 2px; text-align: center; white-space: nowrap;">${label}</div>` : ""}
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 18],
  });
};

const createCabIcon = () => {
  return L.divIcon({
    className: "custom-cab-marker",
    html: `
      <div style="
        background: #000;
        color: #fff;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.4);
        border: 3px solid #10b981;
        font-size: 22px;
      ">
        🚕
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
};

const LiveTracking = ({ pickup, destination, driverLocation, pickupCoords, destCoords }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routePolylineRef = useRef(null);
  const markersRef = useRef({});

  const [currentPosition, setCurrentPosition] = useState(defaultPosition);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(defaultPosition, 14);

      // OpenStreetMap Tiles (Free, keyless)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom Control at bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Track user geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const updatePosition = (position) => {
      const { latitude, longitude } = position.coords;
      const newPos = [latitude, longitude];
      setCurrentPosition(newPos);

      if (mapInstanceRef.current && !pickup && !destination) {
        mapInstanceRef.current.setView(newPos, 15);
      }
    };

    navigator.geolocation.getCurrentPosition(updatePosition);
    const watchId = navigator.geolocation.watchPosition(updatePosition);
    return () => navigator.geolocation.clearWatch(watchId);
  }, [pickup, destination]);

  // Geocode and Route rendering
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const renderRoute = async () => {
      let pLat, pLng, dLat, dLng;

      // Obtain Pickup Coordinates
      if (pickupCoords?.ltd && pickupCoords?.lng) {
        pLat = Number(pickupCoords.ltd);
        pLng = Number(pickupCoords.lng);
      } else if (pickup) {
        try {
          const res = await axios.get(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(pickup)}&limit=1`
          );
          if (res.data?.features && res.data.features[0]) {
            const coords = res.data.features[0].geometry.coordinates;
            pLat = coords[1];
            pLng = coords[0];
          }
        } catch {
          pLat = currentPosition[0];
          pLng = currentPosition[1];
        }
      }

      // Obtain Destination Coordinates
      if (destCoords?.ltd && destCoords?.lng) {
        dLat = Number(destCoords.ltd);
        dLng = Number(destCoords.lng);
      } else if (destination) {
        try {
          const res = await axios.get(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(destination)}&limit=1`
          );
          if (res.data?.features && res.data.features[0]) {
            const coords = res.data.features[0].geometry.coordinates;
            dLat = coords[1];
            dLng = coords[0];
          }
        } catch {
          dLat = pLat ? pLat + 0.03 : currentPosition[0] + 0.03;
          dLng = pLng ? pLng + 0.03 : currentPosition[1] + 0.03;
        }
      }

      // Clear existing markers & polyline
      if (markersRef.current.pickup) map.removeLayer(markersRef.current.pickup);
      if (markersRef.current.destination) map.removeLayer(markersRef.current.destination);
      if (routePolylineRef.current) map.removeLayer(routePolylineRef.current);

      const bounds = [];

      // Render Pickup Marker
      if (pLat && pLng) {
        const pickupMarker = L.marker([pLat, pLng], {
          icon: createCustomIcon("#10b981", "ri-map-pin-user-fill", "Pickup"),
        }).addTo(map);
        markersRef.current.pickup = pickupMarker;
        bounds.push([pLat, pLng]);
      }

      // Render Destination Marker
      if (dLat && dLng) {
        const destMarker = L.marker([dLat, dLng], {
          icon: createCustomIcon("#ef4444", "ri-map-pin-2-fill", "Drop"),
        }).addTo(map);
        markersRef.current.destination = destMarker;
        bounds.push([dLat, dLng]);
      }

      // Fetch and draw OSRM route line if both coordinates exist
      if (pLat && pLng && dLat && dLng) {
        try {
          const osrmRes = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson`
          );

          if (osrmRes.data && osrmRes.data.routes && osrmRes.data.routes[0]) {
            const coordinates = osrmRes.data.routes[0].geometry.coordinates.map(
              (coord) => [coord[1], coord[0]] // Swap [lng, lat] to [lat, lng] for Leaflet
            );

            const polyline = L.polyline(coordinates, {
              color: "#000000",
              weight: 5,
              opacity: 0.8,
              lineJoin: "round",
            }).addTo(map);

            routePolylineRef.current = polyline;
          }
        } catch (routeErr) {
          console.warn("Polyline fetch fallback:", routeErr.message);
          // Fallback straight line
          const polyline = L.polyline(
            [
              [pLat, pLng],
              [dLat, dLng],
            ],
            { color: "#000000", weight: 4, dashArray: "8, 8" }
          ).addTo(map);
          routePolylineRef.current = polyline;
        }
      }

      // Fit map bounds to show route and markers
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    renderRoute();
  }, [pickup, destination, pickupCoords, destCoords]);

  // Update Driver Marker in Real Time
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      const driverPos = [driverLocation.lat, driverLocation.lng];

      if (markersRef.current.driver) {
        markersRef.current.driver.setLatLng(driverPos);
      } else {
        const driverMarker = L.marker(driverPos, {
          icon: createCabIcon(),
        }).addTo(map);
        markersRef.current.driver = driverMarker;
      }

      if (!pickup && !destination) {
        map.panTo(driverPos);
      }
    }
  }, [driverLocation, pickup, destination]);

  const [liveEta, setLiveEta] = useState(null);

  // Dynamic live ETA calculation
  useEffect(() => {
    if (!driverLocation?.lat || !driverLocation?.lng) {
      setLiveEta(null);
      return;
    }

    const targetCoords =
      destCoords?.ltd && destCoords?.lng
        ? destCoords
        : pickupCoords?.ltd && pickupCoords?.lng
        ? pickupCoords
        : null;

    if (!targetCoords?.ltd || !targetCoords?.lng) return;

    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(targetCoords.ltd - driverLocation.lat);
    const dLng = toRad(targetCoords.lng - driverLocation.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(driverLocation.lat)) *
        Math.cos(toRad(targetCoords.ltd)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distKm = R * c;
    const durMins = Math.max(1, Math.round((distKm / 30) * 60));

    setLiveEta({
      distanceKm: distKm.toFixed(1),
      durationMin: durMins,
    });
  }, [driverLocation, destCoords, pickupCoords]);

  return (
    <div className="w-full h-full min-h-[300px] relative z-0">
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px] bg-gray-100 relative z-0"
      />

      {liveEta && (
        <div className="absolute top-4 left-4 z-[400] bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2.5 border border-white/10 pointer-events-none animate-in fade-in duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-xs">
            <span className="font-bold text-emerald-400">
              ~{liveEta.durationMin} mins away
            </span>
            <span className="text-gray-300 ml-1.5">• {liveEta.distanceKm} km</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;

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
        pLat = pickupCoords.ltd;
        pLng = pickupCoords.lng;
      } else if (pickup) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pickup)}&format=json&limit=1`,
            { headers: { "User-Agent": "UberCloneApp/1.0" } }
          );
          if (res.data && res.data[0]) {
            pLat = parseFloat(res.data[0].lat);
            pLng = parseFloat(res.data[0].lon);
          }
        } catch {
          pLat = currentPosition[0];
          pLng = currentPosition[1];
        }
      }

      // Obtain Destination Coordinates
      if (destCoords?.ltd && destCoords?.lng) {
        dLat = destCoords.ltd;
        dLng = destCoords.lng;
      } else if (destination) {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
            { headers: { "User-Agent": "UberCloneApp/1.0" } }
          );
          if (res.data && res.data[0]) {
            dLat = parseFloat(res.data[0].lat);
            dLng = parseFloat(res.data[0].lon);
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

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[300px] bg-gray-100 relative z-0"
    />
  );
};

export default LiveTracking;

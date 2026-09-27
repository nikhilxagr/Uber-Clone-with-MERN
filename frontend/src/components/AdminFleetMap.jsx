import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultCenter = [28.6139, 77.2090]; // New Delhi center

const createVehicleIcon = (vehicleType, status, isBusy) => {
  let emoji = "🚗";
  if (vehicleType === "moto") emoji = "🛵";
  if (vehicleType === "auto") emoji = "🛺";

  let ringColor = "#10b981"; // emerald for online
  if (isBusy) ringColor = "#3b82f6"; // blue for in-trip
  if (status === "inactive") ringColor = "#6b7280"; // gray for offline

  return L.divIcon({
    className: "admin-vehicle-marker",
    html: `
      <div style="
        position: relative;
        background: #111827;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: 2px solid ${ringColor};
      ">
        <span>${emoji}</span>
        ${
          status === "active" && !isBusy
            ? `<span style="position: absolute; top: -2px; right: -2px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; border: 2px solid #111827;"></span>`
            : ""
        }
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const AdminFleetMap = ({ captains = [], activeTrips = [], onToggleDriver }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(defaultCenter, 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => map.removeLayer(marker));
    markersRef.current = {};

    const bounds = [];
    const busyCaptainIds = new Set(
      activeTrips.map((t) => t.captain?._id?.toString() || t.captain?.toString())
    );

    captains.forEach((captain) => {
      const lat = captain.location?.ltd;
      const lng = captain.location?.lng;

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        bounds.push([lat, lng]);
        const isBusy = busyCaptainIds.has(captain._id.toString());
        const icon = createVehicleIcon(captain.vehicle?.vehicleType, captain.status, isBusy);

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        const popupContent = document.createElement("div");
        popupContent.style.minWidth = "180px";
        popupContent.innerHTML = `
          <div style="font-family: sans-serif; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #111;">${captain.fullname?.firstname} ${captain.fullname?.lastname || ""}</strong>
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background: ${
                captain.status === "active" ? "#d1fae5; color: #065f46" : "#f3f4f6; color: #4b5563"
              }; text-transform: uppercase;">
                ${captain.status}
              </span>
            </div>
            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase;">
              ${captain.vehicle?.plate || "N/A"} • ${captain.vehicle?.vehicleType || "car"}
            </p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">
              ${captain.email}
            </p>
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #eee;">
              <button id="toggle-btn-${captain._id}" style="width: 100%; padding: 4px 8px; font-size: 11px; font-weight: bold; background: #111; color: #fff; border: none; border-radius: 6px; cursor: pointer;">
                Toggle Status (${captain.status === "active" ? "Deactivate" : "Activate"})
              </button>
            </div>
          </div>
        `;

        popupContent
          .querySelector(`#toggle-btn-${captain._id}`)
          ?.addEventListener("click", () => {
            if (onToggleDriver) onToggleDriver(captain._id);
          });

        marker.bindPopup(popupContent);
        markersRef.current[captain._id] = marker;
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [captains, activeTrips, onToggleDriver]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
      <div ref={mapContainerRef} className="w-full h-full bg-gray-950 z-0" />

      {/* Map Floating Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-gray-900/90 backdrop-blur-md border border-gray-800 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1.5 pointer-events-auto">
        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider mb-1">
          Fleet Map Legend
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online / Available ({captains.filter((c) => c.status === "active").length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>In-Trip Active ({activeTrips.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
          <span>Offline Drivers ({captains.filter((c) => c.status === "inactive").length})</span>
        </div>
      </div>
    </div>
  );
};

export default AdminFleetMap;

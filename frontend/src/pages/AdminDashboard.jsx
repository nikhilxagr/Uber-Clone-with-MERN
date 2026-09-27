import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminFleetMap from "../components/AdminFleetMap";

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [fleetData, setFleetData] = useState({ captains: [], activeTrips: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [driverFilter, setDriverFilter] = useState("all"); // "all" | "active" | "inactive"
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statsRes, fleetRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BASE_URL}/admin/stats`),
        axios.get(`${import.meta.env.VITE_BASE_URL}/admin/fleet`),
      ]);

      setStatsData(statsRes.data);
      setFleetData(fleetRes.data);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleToggleDriverStatus = async (captainId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/toggle-driver-status`,
        { captainId }
      );
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update driver status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-3">
        <i className="ri-loader-4-line text-4xl animate-spin text-emerald-400"></i>
        <p className="text-sm font-semibold text-gray-400 tracking-wide">
          Connecting to Uber Fleet Telemetry...
        </p>
      </div>
    );
  }

  const { stats, recentRides } = statsData || {};
  const { captains, activeTrips } = fleetData;

  const filteredCaptains = captains.filter((c) => {
    if (driverFilter === "active") return c.status === "active";
    if (driverFilter === "inactive") return c.status === "inactive";
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-800 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500 text-black px-2.5 py-1 rounded-xl text-lg font-black tracking-tight">
              UBER
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Fleet Command Center
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              LIVE OPS
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time platform telemetry, dynamic surge pricing & fleet operations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5"
            title="Refresh metrics"
          >
            <i className={`ri-refresh-line ${isRefreshing ? "animate-spin" : ""}`}></i>
            <span>Refresh</span>
          </button>

          <Link
            to="/home"
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1"
          >
            <i className="ri-user-line"></i> Rider App
          </Link>
          <Link
            to="/captain-home"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1"
          >
            <i className="ri-steering-2-line"></i> Driver App
          </Link>
        </div>
      </header>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Total Platform GMV */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Platform GMV</span>
            <i className="ri-money-dollar-circle-fill text-emerald-400 text-xl"></i>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1 font-medium">
            100% completed trip ledger
          </p>
        </div>

        {/* Trips & Dispatch */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Dispatches</span>
            <i className="ri-route-fill text-blue-400 text-xl"></i>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalRides || 0}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
            <span className="text-emerald-400 font-semibold">{stats?.completedRides || 0} finished</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">{stats?.ongoingRides || 0} active</span>
          </div>
        </div>

        {/* Active Drivers */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Drivers</span>
            <i className="ri-taxi-fill text-amber-400 text-xl"></i>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {stats?.activeCaptains || 0}{" "}
            <span className="text-base text-gray-500 font-normal">
              / {stats?.totalCaptains || 0}
            </span>
          </h3>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">
            Ready to accept dispatches
          </p>
        </div>

        {/* Surge Pricing Status */}
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Surge Engine</span>
            <i className="ri-flashlight-fill text-yellow-400 text-xl"></i>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-1.5">
            {stats?.currentSurgeStatus === "SURGE ACTIVE" ? (
              <span className="text-amber-400">SURGE ACTIVE</span>
            ) : (
              <span className="text-gray-300">STANDARD 1.0x</span>
            )}
          </h3>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">
            {stats?.surgeTripsCount > 0
              ? `${stats?.surgeTripsCount} recent trips had surge applied`
              : "Balanced demand & supply"}
          </p>
        </div>
      </div>

      {/* Real-time Fleet Telemetry Map */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="ri-map-pin-range-fill text-emerald-400"></i> Live Fleet Spatial Map
          </h3>
          <span className="text-xs text-gray-400">OpenStreetMap GPS Tracking (100% Free)</span>
        </div>
        <AdminFleetMap
          captains={captains}
          activeTrips={activeTrips}
          onToggleDriver={handleToggleDriverStatus}
        />
      </div>

      {/* Fleet Management Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <i className="ri-car-line text-emerald-400"></i> Fleet Driver Roster
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage captain duty status and review registered vehicle specifications
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-gray-950 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setDriverFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                driverFilter === "all" ? "bg-gray-800 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              All ({captains.length})
            </button>
            <button
              onClick={() => setDriverFilter("active")}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                driverFilter === "active" ? "bg-emerald-600 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              Online ({captains.filter((c) => c.status === "active").length})
            </button>
            <button
              onClick={() => setDriverFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                driverFilter === "inactive" ? "bg-gray-800 text-white font-bold" : "text-gray-400 hover:text-white"
              }`}
            >
              Offline ({captains.filter((c) => c.status === "inactive").length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Driver Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">GPS Coordinates</th>
                <th className="py-3 px-4">Duty Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCaptains.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No drivers match this filter.
                  </td>
                </tr>
              ) : (
                filteredCaptains.map((captain) => (
                  <tr key={captain._id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white capitalize">
                      {captain.fullname?.firstname} {captain.fullname?.lastname || ""}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-400">
                      {captain.email}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono uppercase text-emerald-400">
                      {captain.vehicle?.plate || "N/A"} •{" "}
                      <span className="text-gray-300 font-sans">{captain.vehicle?.vehicleType}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-400">
                      {captain.location?.ltd
                        ? `${captain.location.ltd.toFixed(3)}, ${captain.location.lng.toFixed(3)}`
                        : "No GPS Lock"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                          captain.status === "active"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {captain.status === "active" ? "🟢 ONLINE" : "⚪ OFFLINE"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleDriverStatus(captain._id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                          captain.status === "active"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                        }`}
                      >
                        {captain.status === "active" ? "Set Offline" : "Set Online"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Trips Telemetry Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i className="ri-pulse-line text-emerald-400"></i> Live Trip Telemetry & Surge Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="py-3 px-4">Trip ID</th>
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Fare & Surge</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentRides?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No active or past trips recorded.
                  </td>
                </tr>
              ) : (
                recentRides?.map((ride) => (
                  <tr key={ride._id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                      {ride._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {ride.user?.fullName || "Guest Rider"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {ride.captain?.fullname?.firstname || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-xs truncate">
                      <span className="text-gray-400">{ride.pickup}</span> →{" "}
                      <span className="text-gray-200">{ride.destination}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">₹{ride.fare}</span>
                      {ride.surgeMultiplier > 1.0 && (
                        <span className="ml-1.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                          ⚡ {ride.surgeMultiplier}x
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          ride.status === "completed"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : ride.status === "ongoing"
                            ? "bg-blue-950 text-blue-400 border border-blue-800"
                            : ride.status === "arrived"
                            ? "bg-purple-950 text-purple-400 border border-purple-800"
                            : ride.status === "cancelled"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

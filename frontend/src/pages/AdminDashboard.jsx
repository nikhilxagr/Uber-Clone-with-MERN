import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/admin/stats`
        );
        setData(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchAdminStats();
    const interval = setInterval(fetchAdminStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <i className="ri-loader-4-line text-4xl animate-spin"></i>
      </div>
    );
  }

  const { stats, recentRides } = data || {};

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-8 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="bg-emerald-500 text-black p-2 rounded-xl text-xl font-black">UBER</span>
            Admin Command Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time platform telemetry & operations</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Rider App
          </Link>
          <Link
            to="/captain-home"
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
          >
            Driver App
          </Link>
        </div>
      </header>

      {/* Analytics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Total Revenue</span>
            <i className="ri-money-dollar-circle-line text-emerald-400 text-lg"></i>
          </div>
          <h3 className="text-2xl font-black text-white">₹{stats?.totalRevenue || 0}</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Total Trips</span>
            <i className="ri-route-line text-blue-400 text-lg"></i>
          </div>
          <h3 className="text-2xl font-black text-white">{stats?.totalRides || 0}</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Active Drivers</span>
            <i className="ri-steering-2-line text-amber-400 text-lg"></i>
          </div>
          <h3 className="text-2xl font-black text-white">{stats?.activeCaptains || 0} / {stats?.totalCaptains || 0}</h3>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase">Registered Riders</span>
            <i className="ri-user-smile-line text-purple-400 text-lg"></i>
          </div>
          <h3 className="text-2xl font-black text-white">{stats?.totalUsers || 0}</h3>
        </div>
      </div>

      {/* Recent Trips Telemetry Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <i className="ri-pulse-line text-emerald-400"></i> Live Trip Telemetry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-gray-950 border-b border-gray-800">
              <tr>
                <th className="py-3.5 px-4">Trip ID</th>
                <th className="py-3.5 px-4">Rider</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Pickup → Destination</th>
                <th className="py-3.5 px-4">Fare</th>
                <th className="py-3.5 px-4">Status</th>
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
                  <tr key={ride._id} className="hover:bg-gray-800/50 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                      {ride._id.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {ride.user?.fullName || "Guest Rider"}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {ride.captain?.fullname?.firstname || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4 text-xs max-w-xs truncate">
                      <span className="text-gray-400">{ride.pickup}</span> →{" "}
                      <span className="text-gray-200">{ride.destination}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      ₹{ride.fare}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                          ride.status === "completed"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : ride.status === "ongoing"
                            ? "bg-blue-950 text-blue-400 border border-blue-800"
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

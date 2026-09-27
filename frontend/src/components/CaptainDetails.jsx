import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainDetails = () => {
  const { captain } = useContext(CaptainDataContext);
  const [timeframe, setTimeframe] = useState("today"); // "today" | "week" | "all"
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    totalEarnings: 0,
    todayRidesCount: 0,
    weeklyRidesCount: 0,
    totalRidesCount: 0,
    totalHours: 0,
    totalDistanceKm: 0,
    rating: 5.0,
    reviewsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captains/earnings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setEarnings(response.data);
        }
      } catch (err) {
        console.warn("Could not fetch real-time earnings:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const activeEarnings =
    timeframe === "today"
      ? earnings.todayEarnings
      : timeframe === "week"
      ? earnings.weeklyEarnings
      : earnings.totalEarnings;

  const activeTrips =
    timeframe === "today"
      ? earnings.todayRidesCount
      : timeframe === "week"
      ? earnings.weeklyRidesCount
      : earnings.totalRidesCount;

  return (
    <div className="space-y-4">
      {/* Header Profile & Real Earnings */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-black text-white font-bold flex items-center justify-center text-xl shadow-md border-2 border-emerald-500">
            {captain?.fullname?.firstname
              ? captain.fullname.firstname.charAt(0).toUpperCase()
              : "C"}
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900 capitalize">
              {captain
                ? `${captain.fullname.firstname} ${captain.fullname.lastname || ""}`
                : "Captain"}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="text-amber-500 flex items-center">
                <i className="ri-star-fill text-xs mr-0.5"></i>
                {earnings.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span className="uppercase text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {captain?.vehicle?.vehicleType || "Driver"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs font-semibold text-gray-400">₹</span>
            <h4 className="text-2xl font-black text-gray-950">
              {isLoading ? (
                <span className="inline-block w-16 h-6 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                activeEarnings.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              )}
            </h4>
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
            {timeframe === "today"
              ? "Earned Today"
              : timeframe === "week"
              ? "This Week"
              : "All-Time"}
          </p>
        </div>
      </div>

      {/* Timeframe Switcher Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-semibold text-gray-600">
        <button
          onClick={() => setTimeframe("today")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            timeframe === "today"
              ? "bg-white text-black shadow-sm font-bold"
              : "hover:text-black"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeframe("week")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            timeframe === "week"
              ? "bg-white text-black shadow-sm font-bold"
              : "hover:text-black"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe("all")}
          className={`flex-1 py-1.5 rounded-lg transition ${
            timeframe === "all"
              ? "bg-white text-black shadow-sm font-bold"
              : "hover:text-black"
          }`}
        >
          Lifetime
        </button>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        {/* Hours Driving */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
          <i className="text-xl mb-1 text-blue-600 ri-time-line block"></i>
          <h5 className="text-base font-bold text-gray-900">
            {earnings.totalHours}
          </h5>
          <p className="text-[11px] text-gray-500 font-medium">Online Hours</p>
        </div>

        {/* Trips Completed */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 text-center">
          <i className="text-xl mb-1 text-emerald-600 ri-roadster-line block"></i>
          <h5 className="text-base font-bold text-gray-900">{activeTrips}</h5>
          <p className="text-[11px] text-gray-500 font-medium">
            {timeframe === "today" ? "Trips Today" : "Completed"}
          </p>
        </div>

        {/* Distance / History Link */}
        <Link
          to="/captain-history"
          className="bg-gray-50 border border-gray-100 hover:border-gray-300 rounded-2xl p-3 text-center transition group active:scale-95"
        >
          <i className="text-xl mb-1 text-purple-600 ri-file-list-3-line block group-hover:scale-110 transition"></i>
          <h5 className="text-base font-bold text-gray-900 flex items-center justify-center gap-0.5">
            Trips <i className="ri-arrow-right-s-line text-xs text-gray-400"></i>
          </h5>
          <p className="text-[11px] text-purple-600 font-semibold">View History</p>
        </Link>
      </div>
    </div>
  );
};

export default CaptainDetails;

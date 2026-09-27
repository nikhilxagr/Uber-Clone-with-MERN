import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ReceiptModal from "../components/ReceiptModal";

const RideHistory = ({ userType = "user" }) => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRideForReceipt, setSelectedRideForReceipt] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint =
          userType === "captain"
            ? `${import.meta.env.VITE_BASE_URL}/rides/captain-rides`
            : `${import.meta.env.VITE_BASE_URL}/rides/user-rides`;

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRides(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchRides();
  }, [userType]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Completed
          </span>
        );
      case "ongoing":
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Ongoing
          </span>
        );
      case "accepted":
      case "arrived":
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {status === "arrived" ? "Driver Arrived" : "Accepted"}
          </span>
        );
      case "cancelled":
        return (
          <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Your Trips</h2>
          <p className="text-xs text-gray-500">
            {userType === "captain" ? "Driver trip ledger & earnings history" : "Past rides, fare invoices & receipts"}
          </p>
        </div>
        <Link
          to={userType === "captain" ? "/captain-home" : "/home"}
          className="bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-gray-700 hover:text-black hover:border-black font-semibold text-xs flex items-center gap-1.5 transition shadow-sm active:scale-95"
        >
          <i className="ri-arrow-left-line"></i> Back
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <i className="ri-loader-4-line text-3xl animate-spin mb-2"></i>
          <p className="text-sm font-medium">Loading your trip history...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border shadow-sm">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
            <i className="ri-car-line"></i>
          </div>
          <h4 className="font-bold text-gray-900 text-base">No trips recorded yet</h4>
          <p className="text-xs text-gray-500 mt-1">
            Completed trips and downloadable receipts will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 font-mono block">
                    ID: {ride._id.slice(-8).toUpperCase()}
                  </span>
                  <h4 className="font-black text-gray-950 text-xl">
                    ₹{ride.fare}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(ride.status)}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] mt-0.5">
                    ●
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Pickup</span>
                    <p className="font-semibold text-gray-800 line-clamp-1">{ride.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] mt-0.5">
                    ■
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Destination</span>
                    <p className="font-semibold text-gray-800 line-clamp-1">{ride.destination}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Info & Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                    {ride.vehicleType}
                  </span>
                  {ride.captain && (
                    <span className="text-[11px] font-medium text-gray-700">
                      Driver: <strong className="font-bold">{ride.captain.fullname?.firstname}</strong>
                    </span>
                  )}
                </div>

                {ride.status === "completed" && (
                  <button
                    onClick={() => setSelectedRideForReceipt(ride)}
                    className="text-xs font-bold text-black hover:text-emerald-600 flex items-center gap-1 bg-gray-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 transition active:scale-95"
                  >
                    <i className="ri-receipt-line"></i> View Receipt
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Receipt Modal */}
      {selectedRideForReceipt && (
        <ReceiptModal
          ride={selectedRideForReceipt}
          onClose={() => setSelectedRideForReceipt(null)}
        />
      )}
    </div>
  );
};

export default RideHistory;

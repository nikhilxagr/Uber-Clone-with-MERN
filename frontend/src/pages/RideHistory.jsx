import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RideHistory = ({ userType = "user" }) => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>;
      case "ongoing":
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">Ongoing</span>;
      case "accepted":
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">Accepted</span>;
      case "cancelled":
        return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Your Trips</h2>
        <Link
          to={userType === "captain" ? "/captain-home" : "/home"}
          className="text-gray-600 hover:text-black font-semibold text-sm flex items-center gap-1"
        >
          <i className="ri-arrow-left-line"></i> Back
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <i className="ri-loader-4-line text-3xl animate-spin mb-2"></i>
          <p className="text-sm">Loading trips...</p>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
          <i className="ri-car-line text-4xl text-gray-300 mb-2"></i>
          <h4 className="font-semibold text-gray-800">No trips found</h4>
          <p className="text-xs text-gray-500 mt-1">Book a ride to see it listed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride._id}
              className="bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3 pb-3 border-b">
                <div>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {ride._id.slice(-6)}
                  </span>
                  <h4 className="font-bold text-gray-900 text-lg">
                    ₹{ride.fare}
                  </h4>
                </div>
                {getStatusBadge(ride.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3">
                  <i className="ri-record-circle-fill text-emerald-600 mt-0.5"></i>
                  <div>
                    <span className="text-xs text-gray-400">Pickup</span>
                    <p className="font-medium text-gray-800">{ride.pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <i className="ri-map-pin-2-fill text-red-500 mt-0.5"></i>
                  <div>
                    <span className="text-xs text-gray-400">Destination</span>
                    <p className="font-medium text-gray-800">{ride.destination}</p>
                  </div>
                </div>
              </div>

              {userType === "user" && ride.captain && (
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                  <span>Driver: <strong className="text-gray-800">{ride.captain.fullname?.firstname}</strong></span>
                  <span className="uppercase">{ride.vehicleType}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RideHistory;

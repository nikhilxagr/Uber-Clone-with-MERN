import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";
import PaymentModal from "../components/PaymentModal";
import RatingModal from "../components/RatingModal";

const Riding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { ride } = location.state || {};
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    const handleRideEnded = () => {
      setShowRatingModal(true);
    };

    const handleDriverLocationUpdate = (data) => {
      if (data?.ltd && data?.lng) {
        setDriverLocation({ lat: data.ltd, lng: data.lng });
      }
    };

    socket.on("ride-ended", handleRideEnded);
    socket.on("driver-location-updated", handleDriverLocationUpdate);

    return () => {
      socket.off("ride-ended", handleRideEnded);
      socket.off("driver-location-updated", handleDriverLocationUpdate);
    };
  }, [socket]);

  return (
    <div className="h-screen relative">
      <Link
        to="/home"
        className="fixed right-4 top-4 z-[100] h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition"
      >
        <i className="text-lg font-medium ri-home-5-line"></i>
      </Link>

      <div className="h-1/2">
        <LiveTracking
          pickup={ride?.pickup}
          destination={ride?.destination}
          pickupCoords={ride?.pickupCoordinates}
          destCoords={ride?.destinationCoordinates}
          driverLocation={driverLocation}
        />
      </div>

      <div className="h-1/2 p-5 bg-white flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <img
              className="h-12 object-contain"
              src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
              alt="Vehicle"
            />
            <div className="text-right">
              <h2 className="text-lg font-bold capitalize text-gray-900">
                {ride?.captain?.fullname?.firstname || "Driver"}
              </h2>
              <h4 className="text-xl font-extrabold text-emerald-600 -mt-1">
                {ride?.captain?.vehicle?.plate || "Vehicle"}
              </h4>
              <p className="text-xs text-gray-500 font-medium uppercase">
                {ride?.captain?.vehicle?.vehicleType || "Ride"}
              </p>
            </div>
          </div>

          <div className="w-full mt-4 space-y-3">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <i className="text-xl text-red-500 ri-map-pin-2-fill"></i>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Destination</h3>
                <p className="text-sm text-gray-900 font-medium">
                  {ride?.destination}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
              <i className="text-xl text-emerald-600 ri-currency-line"></i>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Fare Amount</h3>
                <p className="text-base text-gray-900 font-bold">₹{ride?.fare}</p>
              </div>
            </div>
          </div>
        </div>

        {paymentDone ? (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
            <i className="ri-checkbox-circle-fill text-xl"></i> Payment Completed
          </div>
        ) : (
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
          >
            <i className="ri-bank-card-line"></i> Make a Payment
          </button>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal
          ride={ride}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            setPaymentDone(true);
          }}
        />
      )}

      {showRatingModal && (
        <RatingModal
          ride={ride}
          onClose={() => {
            setShowRatingModal(false);
            navigate("/home");
          }}
        />
      )}
    </div>
  );
};

export default Riding;

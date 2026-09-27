import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import LiveTracking from "../components/LiveTracking";
import PaymentModal from "../components/PaymentModal";
import RatingModal from "../components/RatingModal";
import ChatModal from "../components/ChatModal";
import ReceiptModal from "../components/ReceiptModal";

const Riding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { ride } = location.state || {};
  const [currentRide, setCurrentRide] = useState(ride);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [paymentDone, setPaymentDone] = useState(ride?.paymentStatus === "paid");
  const [driverLocation, setDriverLocation] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

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

  const handleShareTrip = async () => {
    const shareText = `🚗 I'm on my way to ${ride?.destination} with driver ${ride?.captain?.fullname?.firstname} (${ride?.captain?.vehicle?.plate}, ${ride?.captain?.vehicle?.color} ${ride?.captain?.vehicle?.vehicleType}). Track my ride!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Uber Ride Details",
          text: shareText,
        });
        return;
      } catch {
        // user cancelled or fallback
      }
    }

    await navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="h-screen relative">
      {/* Top Floating Controls */}
      <div className="fixed right-4 top-4 z-[100] flex items-center gap-2">
        <button
          onClick={() => setIsChatOpen(true)}
          className="h-10 px-3 bg-white shadow-md flex items-center justify-center rounded-full text-xs font-bold text-gray-800 hover:bg-gray-100 transition gap-1"
        >
          <i className="ri-chat-3-line text-base text-emerald-600"></i> Chat
        </button>

        <button
          onClick={() => setShowSafetyModal(true)}
          className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full text-red-600 hover:bg-red-50 transition"
          title="Safety Toolkit & SOS"
        >
          <i className="text-xl ri-shield-alert-line"></i>
        </button>

        <Link
          to="/home"
          className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition"
        >
          <i className="text-lg font-medium ri-home-5-line"></i>
        </Link>
      </div>

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
          <div className="space-y-2">
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold p-3 rounded-xl text-center flex items-center justify-center gap-2 text-sm">
              <i className="ri-checkbox-circle-fill text-xl"></i> Payment Completed
            </div>
            <button
              onClick={() => setShowReceiptModal(true)}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold p-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow active:scale-95"
            >
              <i className="ri-receipt-line"></i> View Trip Receipt
            </button>
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
          ride={currentRide || ride}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(updatedRide) => {
            setShowPaymentModal(false);
            setPaymentDone(true);
            if (updatedRide) setCurrentRide(updatedRide);
          }}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal
          ride={currentRide || ride}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

      {showRatingModal && (
        <RatingModal
          ride={currentRide || ride}
          onClose={() => {
            setShowRatingModal(false);
            navigate("/home");
          }}
        />
      )}

      {/* Safety Toolkit & SOS Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="ri-shield-check-fill text-2xl text-emerald-600"></i>
                <h3 className="text-lg font-bold text-gray-900">Safety Toolkit</h3>
              </div>
              <button
                onClick={() => setShowSafetyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5">
              Access emergency assistance or share your trip with family and friends.
            </p>

            <div className="space-y-3">
              <a
                href="tel:112"
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-red-200 transition"
              >
                <i className="ri-phone-fill text-lg"></i> Call Emergency (112)
              </a>

              <button
                onClick={handleShareTrip}
                className="w-full py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition"
              >
                <i className="ri-share-line text-lg text-emerald-600"></i>
                {copiedShare ? "Trip Details Copied!" : "Share Live Trip Details"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Real-Time Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        recipientSocketId={ride?.captain?.socketId}
        recipientName={ride?.captain?.fullname?.firstname || "Driver"}
        userType="user"
        rideId={ride?._id}
      />
    </div>
  );
};

export default Riding;

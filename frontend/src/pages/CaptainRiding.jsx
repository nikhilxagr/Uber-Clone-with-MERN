import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FinishRide from "../components/FinishRide";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LiveTracking from "../components/LiveTracking";
import ChatModal from "../components/ChatModal";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const rideData = location.state?.ride;

  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    if (!captain?._id) return;

    const updateLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDriverLocation({ lat, lng });

        socket.emit("update-location-captain", {
          userId: captain._id,
          riderSocketId: rideData?.user?.socketId,
          location: {
            ltd: lat,
            lng: lng,
          },
        });
      });
    };

    updateLocation();
    const locationInterval = setInterval(updateLocation, 4000);

    return () => clearInterval(locationInterval);
  }, [captain?._id, socket, rideData?.user?.socketId]);

  const [paymentReceived, setPaymentReceived] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handlePaymentReceived = () => {
      setPaymentReceived(true);
    };

    socket.on("payment-received", handlePaymentReceived);
    return () => socket.off("payment-received", handlePaymentReceived);
  }, [socket]);

  useGSAP(
    function () {
      if (finishRidePanel) {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(finishRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [finishRidePanel]
  );

  return (
    <div className="h-screen relative flex flex-col justify-end">
      {paymentReceived && (
        <div className="fixed top-20 left-4 right-4 z-40 bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5">
            <i className="ri-checkbox-circle-fill text-2xl"></i>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Payment Received!</p>
              <p className="text-[11px] text-emerald-100">Rider completed fare payment of ₹{rideData?.fare}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase bg-emerald-800 px-2.5 py-1 rounded-lg">PAID</span>
        </div>
      )}
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen z-20 pointer-events-none">
        <img
          className="w-16 pointer-events-auto"
          src="/images/uber-logo.svg"
          alt="Uber"
        />
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsChatOpen(true)}
            className="h-10 px-3 bg-white shadow-md flex items-center justify-center rounded-full text-xs font-bold text-gray-800 hover:bg-gray-100 transition gap-1"
          >
            <i className="ri-chat-3-line text-base text-emerald-600"></i> Chat
          </button>
          <Link
            to="/captain-home"
            className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full pointer-events-auto hover:bg-gray-100 transition"
          >
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
      </div>

      <div
        className="h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10 cursor-pointer shadow-lg z-10"
        onClick={() => {
          setFinishRidePanel(true);
        }}
      >
        <h5 className="p-1 text-center w-[90%] absolute top-0">
          <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
        </h5>
        <div>
          <h4 className="text-xl font-bold text-gray-900">Trip in Progress</h4>
          <p className="text-xs text-gray-700">{rideData?.destination}</p>
        </div>
        <button className="bg-green-700 hover:bg-green-800 text-white font-bold p-3 px-8 rounded-xl shadow transition">
          Complete Ride
        </button>
      </div>

      <div
        ref={finishRidePanelRef}
        className="fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <FinishRide ride={rideData} setFinishRidePanel={setFinishRidePanel} />
      </div>

      <div className="h-screen fixed w-screen top-0 z-0">
        <LiveTracking
          pickup={rideData?.pickup}
          destination={rideData?.destination}
          pickupCoords={rideData?.pickupCoordinates}
          destCoords={rideData?.destinationCoordinates}
          driverLocation={driverLocation}
        />
      </div>

      {/* In-App Real-Time Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        recipientSocketId={rideData?.user?.socketId}
        recipientName={rideData?.user?.fullName || "Rider"}
        userType="captain"
        rideId={rideData?._id}
      />
    </div>
  );
};

export default CaptainRiding;

import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";
import LiveTracking from "../components/LiveTracking";
import axios from "axios";

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const [ride, setRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [cancelNotification, setCancelNotification] = useState("");

  const ridePopupPanelRef = useRef(null);
  const confirmRidePopupPanelRef = useRef(null);

  const { socket } = useContext(SocketContext);
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isOnline, setIsOnline] = useState(captain?.status === "active");

  useEffect(() => {
    if (captain?.status) {
      setIsOnline(captain.status === "active");
    }
  }, [captain?.status]);

  const toggleOnlineStatus = async () => {
    try {
      const nextStatus = isOnline ? "inactive" : "active";
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/toggle-status`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setIsOnline(nextStatus === "active");
      if (setCaptain && response.data?.captain) {
        setCaptain(response.data.captain);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert("Could not update online status. Please check connection.");
    }
  };

  useEffect(() => {
    if (!captain?._id) {
      return;
    }

    socket.emit("join", {
      userId: captain._id,
      userType: "captain",
    });

    if (!isOnline) {
      return;
    }

    const updateLocation = () => {
      if (!navigator.geolocation) {
        return;
      }

      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDriverLocation({ lat, lng });

        socket.emit("update-location-captain", {
          userId: captain._id,
          riderSocketId: ride?.user?.socketId,
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
  }, [captain?._id, socket, ride?.user?.socketId, isOnline]);

  useEffect(() => {
    const handleNewRide = (data) => {
      if (!isOnline) return;
      setRide(data);
      setRidePopupPanel(true);
    };

    const handleRideCancelled = (data) => {
      setRidePopupPanel(false);
      setConfirmRidePopupPanel(false);
      setRide(null);
      setCancelNotification(data?.reason || "Rider cancelled the trip.");
      setTimeout(() => setCancelNotification(""), 5000);
    };

    socket.on("new-ride", handleNewRide);
    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("new-ride", handleNewRide);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket, isOnline]);

  async function confirmRide() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/confirm`,
        {
          rideId: ride._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRide(response.data);
      setRidePopupPanel(false);
      setConfirmRidePopupPanel(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to confirm ride. Another driver may have accepted.");
      setRidePopupPanel(false);
    }
  }

  async function declineRide() {
    try {
      if (ride?._id) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/decline`,
          { rideId: ride._id },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    } catch (err) {
      console.warn("Decline notification fallback:", err.message);
    } finally {
      setRidePopupPanel(false);
      setRide(null);
    }
  }

  useGSAP(
    function () {
      if (ridePopupPanel) {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(ridePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [ridePopupPanel],
  );

  useGSAP(
    function () {
      if (confirmRidePopupPanel) {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePopupPanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePopupPanel],
  );

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Cancellation Toast Notification */}
      {cancelNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <i className="ri-close-circle-fill text-xl"></i>
          <span>{cancelNotification}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="fixed p-5 top-0 flex items-center justify-between w-screen z-20 pointer-events-none">
        <img
          className="w-16 pointer-events-auto"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />

        {/* Online / Offline Switch */}
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={toggleOnlineStatus}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-lg transition-all transform active:scale-95 ${
              isOnline
                ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600"
                : "bg-gray-800 text-gray-200 shadow-gray-400 hover:bg-black"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-white animate-pulse" : "bg-red-500"
              }`}
            />
            {isOnline ? "ONLINE • ON DUTY" : "OFFLINE • OFF DUTY"}
          </button>

          <Link
            to="/captain-history"
            className="h-10 px-3 bg-white shadow-md flex items-center justify-center rounded-full text-xs font-semibold text-gray-800 hover:bg-gray-100 transition"
          >
            <i className="ri-history-line text-base mr-1"></i> Trips
          </Link>
          <Link
            to="/captain/logout"
            className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition"
          >
            <i className="text-lg font-medium ri-logout-box-r-line"></i>
          </Link>
        </div>
      </div>

      {/* Map or Offline Overlay */}
      <div className="h-3/5 relative z-0">
        <LiveTracking driverLocation={driverLocation} />
        {!isOnline && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 z-10 pointer-events-auto">
            <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                😴
              </div>
              <h3 className="text-lg font-bold text-gray-900">You are Offline</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                You won't receive trip requests until you switch back on duty.
              </p>
              <button
                onClick={toggleOnlineStatus}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow transition"
              >
                Go Online Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Captain Details & Stats */}
      <div className="h-2/5 p-6 bg-white">
        <CaptainDetails />
      </div>

      {/* Ride Request PopUp with 20s Countdown */}
      <div
        ref={ridePopupPanelRef}
        className="fixed w-full z-30 bottom-0 translate-y-full bg-white px-4 py-8 pt-10 rounded-t-3xl shadow-2xl"
      >
        <RidePopUp
          ride={ride}
          setRidePopupPanel={setRidePopupPanel}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          confirmRide={confirmRide}
          declineRide={declineRide}
        />
      </div>

      {/* Confirm Ride PopUp with OTP */}
      <div
        ref={confirmRidePopupPanelRef}
        className="fixed w-full h-screen z-30 bottom-0 translate-y-full bg-white px-4 py-10 pt-12"
      >
        <ConfirmRidePopUp
          ride={ride}
          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
          setRidePopupPanel={setRidePopupPanel}
        />
      </div>
    </div>
  );
};

export default CaptainHome;

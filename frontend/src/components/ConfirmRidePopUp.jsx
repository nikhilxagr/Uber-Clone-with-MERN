import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatModal from "./ChatModal";
import { SocketContext } from "../context/SocketContext";

const ConfirmRidePopUp = (props) => {
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasArrived, setHasArrived] = useState(props.ride?.status === "arrived");
  const [isArriving, setIsArriving] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const handleDriverArrived = async () => {
    try {
      setIsArriving(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/driver-arrived`,
        { rideId: props.ride?._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setHasArrived(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to notify arrival");
    } finally {
      setIsArriving(false);
    }
  };

  const handleCancelTrip = async () => {
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/cancel`,
        { rideId: props.ride?._id, reason: "Driver cancelled before trip start" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (err) {
      console.warn("Cancel trip error:", err.message);
    } finally {
      props.setConfirmRidePopupPanel(false);
      props.setRidePopupPanel(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/start-ride`,
        {
          params: {
            rideId: props.ride?._id,
            otp,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        props.setConfirmRidePopupPanel(false);
        props.setRidePopupPanel(false);
        navigate("/captain-riding", { state: { ride: response.data } });
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || "Invalid OTP. Please check with rider."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setConfirmRidePopupPanel(false);
        }}
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-3">Trip Overview</h3>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm mb-4 flex items-center gap-2">
          <i className="ri-error-warning-line text-lg"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Rider Info Card */}
      <div className="flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-2xl shadow-md mt-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
            {(props.ride?.user?.fullName || "R").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold capitalize">
              {props.ride?.user?.fullName || "Rider"}
            </h2>
            <p className="text-xs text-gray-400">Rider waiting at pickup</p>
          </div>
        </div>

        {/* Chat With Rider Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
        >
          <i className="ri-chat-3-line text-base text-emerald-400"></i>
          <span>Chat</span>
        </button>
      </div>

      {/* Arrival & Action Banner */}
      <div className="mt-3">
        {hasArrived ? (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-3 text-sm font-bold">
            <i className="ri-checkbox-circle-fill text-emerald-600 text-xl"></i>
            <div>
              <p>You have arrived at pickup!</p>
              <p className="text-xs font-normal text-emerald-600">Rider has been alerted with waiting timer.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDriverArrived}
            disabled={isArriving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition"
          >
            {isArriving ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i> Alerting Rider...
              </>
            ) : (
              <>
                <i className="ri-map-pin-range-line text-lg"></i> I Have Arrived at Pickup
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-3 space-y-2">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <i className="ri-map-pin-user-fill text-emerald-600 text-lg"></i>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Pickup Location</h3>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">{props.ride?.pickup}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <i className="text-lg ri-map-pin-2-fill text-red-500"></i>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Dropoff Destination</h3>
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {props.ride?.destination}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <i className="ri-wallet-3-line text-emerald-600 text-xl"></i>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase">Payment Due</h3>
                <p className="text-base font-bold text-gray-900">₹{props.ride?.fare}</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-gray-200 px-2.5 py-1 rounded-md text-gray-700">Cash / Online</span>
          </div>
        </div>

        <div className="mt-4 w-full">
          <form onSubmit={submitHandler}>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1">
              Ask Rider for 6-Digit OTP to Start
            </label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
              maxLength="6"
              className="bg-[#eee] px-6 py-3.5 font-mono text-center text-2xl tracking-widest rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="• • • • • •"
            />

            <button
              disabled={isSubmitting || otp.length < 6}
              className="w-full mt-3 text-base flex justify-center items-center gap-2 bg-emerald-600 disabled:bg-gray-300 text-white font-bold p-3.5 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i> Verifying...
                </>
              ) : (
                "Verify OTP & Start Trip"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelTrip}
              className="w-full mt-2 text-sm text-red-600 hover:bg-red-50 font-semibold p-2.5 rounded-xl transition"
            >
              Cancel Trip
            </button>
          </form>
        </div>
      </div>

      {/* Real-Time Chat Drawer */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        recipientSocketId={props.ride?.user?.socketId}
        recipientName={props.ride?.user?.fullName || "Rider"}
        userType="captain"
        rideId={props.ride?._id}
      />
    </div>
  );
};

export default ConfirmRidePopUp;

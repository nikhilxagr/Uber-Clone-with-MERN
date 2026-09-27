import { useState, useEffect, useContext } from "react";
import ChatModal from "./ChatModal";
import { SocketContext } from "../context/SocketContext";

const playArrivalSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn("Arrival chime error:", err.message);
  }
};

const WaitingForDriver = (props) => {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [driverHasArrived, setDriverHasArrived] = useState(props.ride?.status === "arrived");
  const [waitingTimeLeft, setWaitingTimeLeft] = useState(300); // 5 mins in seconds
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { socket } = useContext(SocketContext);
  const captain = props.ride?.captain;

  useEffect(() => {
    if (!socket) return;

    const handleDriverArrived = () => {
      setDriverHasArrived(true);
      playArrivalSound();
    };

    socket.on("driver-arrived", handleDriverArrived);
    return () => socket.off("driver-arrived", handleDriverArrived);
  }, [socket]);

  useEffect(() => {
    if (!driverHasArrived) return;

    const timer = setInterval(() => {
      setWaitingTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [driverHasArrived]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setWaitingForDriver(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      {/* Driver Arrival Alert Banner */}
      {driverHasArrived && (
        <div className="mb-3 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <i className="ri-map-pin-user-fill text-2xl"></i>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Driver Has Arrived!</p>
              <p className="text-[11px] text-emerald-100">Meet your driver at the pickup point</p>
            </div>
          </div>
          <div className="text-right bg-emerald-800/60 px-2.5 py-1 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-emerald-200">Free Wait</p>
            <p className="text-sm font-black font-mono">{formatTimer(waitingTimeLeft)}</p>
          </div>
        </div>
      )}

      {/* Driver Info Card */}
      <div className="flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">
            {(captain?.fullname?.firstname || "D").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold capitalize">
              {captain?.fullname?.firstname || "Driver assigned"}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold uppercase">
              {captain?.vehicle?.plate || "Vehicle details"} • {captain?.vehicle?.vehicleType || "Ride"}
            </p>
          </div>
        </div>

        {/* Chat With Driver Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
        >
          <i className="ri-chat-3-line text-base text-emerald-400"></i>
          <span>Chat</span>
        </button>
      </div>

      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-3">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-2">
            <i className="ri-map-pin-user-fill text-emerald-600 text-lg"></i>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Pickup Location</h3>
              <p className="text-sm font-medium text-gray-800 line-clamp-1">{props.ride?.pickup}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-2">
            <i className="ri-map-pin-2-fill text-red-500 text-lg"></i>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Destination</h3>
              <p className="text-sm font-medium text-gray-800 line-clamp-1">
                {props.ride?.destination}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-3">
              <i className="ri-shield-keyhole-line text-emerald-700 text-2xl"></i>
              <div>
                <h3 className="text-xs font-bold text-emerald-800 uppercase">Share OTP with Driver</h3>
                <p className="text-2xl font-black tracking-widest text-emerald-950 font-mono">
                  {props.ride?.otp || "----"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-semibold">Total Fare</p>
              <p className="text-lg font-bold text-emerald-900">₹{props.ride?.fare}</p>
            </div>
          </div>
        </div>

        {/* Cancellation Section */}
        {showConfirmCancel ? (
          <div className="w-full mt-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-xs font-bold text-red-700 text-center mb-3">
              Are you sure you want to cancel this ride?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition"
              >
                No, Keep Trip
              </button>
              <button
                onClick={props.cancelRide}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition shadow"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmCancel(true)}
            className="w-full mt-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-200"
          >
            <i className="ri-close-circle-line text-lg"></i> Cancel Ride
          </button>
        )}
      </div>

      {/* Real-Time Chat Drawer */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        recipientSocketId={captain?.socketId}
        recipientName={captain?.fullname?.firstname || "Driver"}
        userType="user"
        rideId={props.ride?._id}
      />
    </div>
  );
};

export default WaitingForDriver;

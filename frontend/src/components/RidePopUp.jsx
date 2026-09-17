import { useEffect, useState, useRef } from "react";

const playUberChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.15);
    playTone(1175, now + 0.16, 0.32);
  } catch (err) {
    console.warn("Audio chime prevented:", err.message);
  }
};

const RidePopUp = (props) => {
  const [timeLeft, setTimeLeft] = useState(20);
  const chimeIntervalRef = useRef(null);
  const timerRef = useRef(null);

  const userName = props.ride?.user?.fullName || "New rider";

  useEffect(() => {
    if (!props.ride) {
      setTimeLeft(20);
      return;
    }

    setTimeLeft(20);
    playUberChime();

    // Repeat chime every 2.5 seconds
    chimeIntervalRef.current = setInterval(playUberChime, 2500);

    // 1-second interval countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(chimeIntervalRef.current);
          if (props.declineRide) {
            props.declineRide();
          } else {
            props.setRidePopupPanel(false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(chimeIntervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [props.ride]);

  const handleAccept = () => {
    clearInterval(chimeIntervalRef.current);
    clearInterval(timerRef.current);
    props.confirmRide();
  };

  const handleDecline = () => {
    clearInterval(chimeIntervalRef.current);
    clearInterval(timerRef.current);
    if (props.declineRide) {
      props.declineRide();
    } else {
      props.setRidePopupPanel(false);
    }
  };

  const timerProgress = (timeLeft / 20) * 100;

  return (
    <div className="relative pt-2">
      {/* 20-Second Animated Progress Countdown Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft > 10
              ? "bg-emerald-500"
              : timeLeft > 5
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${timerProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            New Trip Request
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            Accept in {timeLeft}s
          </h3>
        </div>

        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 font-extrabold text-sm text-gray-800 border-2 border-emerald-500 shadow-sm">
          {timeLeft}
        </div>
      </div>

      {/* Rider Info Card */}
      <div className="flex items-center justify-between p-3.5 bg-gray-900 text-white rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-emerald-400">
            {userName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold capitalize">{userName}</h2>
            <p className="text-xs text-gray-400">Rider • Verified</p>
          </div>
        </div>
        <div className="text-right">
          <span className="bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {props.ride?.vehicleType || "Standard"}
          </span>
        </div>
      </div>

      {/* Trip Details */}
      <div className="w-full mt-4 space-y-2.5">
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <i className="ri-map-pin-user-fill text-emerald-600 text-xl"></i>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pickup Point
            </h3>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {props.ride?.pickup}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <i className="ri-map-pin-2-fill text-red-500 text-xl"></i>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Destination
            </h3>
            <p className="text-sm font-medium text-gray-900 line-clamp-1">
              {props.ride?.destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <i className="ri-wallet-3-line text-emerald-600 text-xl"></i>
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estimated Fare
            </h3>
            <p className="text-base font-bold text-gray-900">
              ₹{props.ride?.fare || "--"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={handleDecline}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 rounded-xl transition"
        >
          Decline
        </button>

        <button
          onClick={handleAccept}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-200 transition"
        >
          Accept Trip
        </button>
      </div>
    </div>
  );
};

export default RidePopUp;

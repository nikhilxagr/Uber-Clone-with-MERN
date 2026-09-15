import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FinishRide from "../components/FinishRide";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import LiveTracking from "../components/LiveTracking";

const CaptainRiding = () => {
  const [finishRidePanel, setFinishRidePanel] = useState(false);
  const finishRidePanelRef = useRef(null);
  const location = useLocation();
  const rideData = location.state?.ride;

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
      <div className="fixed p-6 top-0 flex items-center justify-between w-screen z-20 pointer-events-none">
        <img
          className="w-16 pointer-events-auto"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber"
        />
        <Link
          to="/captain-home"
          className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full pointer-events-auto hover:bg-gray-100 transition"
        >
          <i className="text-lg font-medium ri-logout-box-r-line"></i>
        </Link>
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
        />
      </div>
    </div>
  );
};

export default CaptainRiding;

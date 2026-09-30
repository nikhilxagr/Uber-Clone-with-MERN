import { useContext, useEffect, useRef, useState, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../components/LocationSearchPanel";
import VehiclePanel from "../components/VehiclePanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import { SocketContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import LiveTracking from "../components/LiveTracking";

const Home = () => {
  const [pickup, setPickup] = useState(() => sessionStorage.getItem("initialPickup") || "");
  const [destination, setDestination] = useState(() => sessionStorage.getItem("initialDestination") || "");
  const [panelOpen, setPanelOpen] = useState(false);
  const vehiclePanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleFoundRef = useRef(null);
  const waitingForDriverRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmRidePanel, setConfirmRidePanel] = useState(false);
  const [vehicleFound, setVehicleFound] = useState(false);
  const [waitingForDriver, setWaitingForDriver] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [fare, setFare] = useState({});
  const [vehicleType, setVehicleType] = useState(null);
  const [ride, setRide] = useState(null);
  const [cancelNotification, setCancelNotification] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  const navigate = useNavigate();

  const { socket } = useContext(SocketContext);
  const { user } = useContext(UserDataContext);

  const detectCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setPickupCoords({ ltd: lat, lng });

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/maps/reverse-geocode`,
            {
              params: { ltd: lat, lng },
            }
          );

          if (res.data?.address) {
            setPickup(res.data.address);
          } else {
            setPickup(`Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          }
        } catch {
          setPickup(`Live Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn("Geolocation detection error:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Automatic live location detection like Uber on opening home screen
  useEffect(() => {
    const saved = sessionStorage.getItem("initialPickup");
    if (!saved) {
      detectCurrentLocation();
    }
  }, [detectCurrentLocation]);

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    socket.emit("join", { userType: "user", userId: user._id });
  }, [socket, user?._id]);

  useEffect(() => {
    const handleRideConfirmed = (confirmedRide) => {
      setVehicleFound(false);
      setWaitingForDriver(true);
      setRide(confirmedRide);
    };

    const handleRideStarted = (startedRide) => {
      setWaitingForDriver(false);
      navigate("/riding", { state: { ride: startedRide } });
    };

    const handleRideCancelled = (data) => {
      setWaitingForDriver(false);
      setVehicleFound(false);
      setConfirmRidePanel(false);
      setVehiclePanel(false);
      setRide(null);
      setCancelNotification(data?.reason || "Driver cancelled the trip. Please search again.");
      setTimeout(() => setCancelNotification(""), 5000);
    };

    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [navigate, socket]);

  async function cancelRide() {
    try {
      if (ride?._id) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/rides/cancel`,
          { rideId: ride._id, reason: "Rider cancelled request" },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }
    } catch (err) {
      console.warn("Cancel ride fallback:", err.message);
    } finally {
      setVehicleFound(false);
      setWaitingForDriver(false);
      setConfirmRidePanel(false);
      setVehiclePanel(false);
      setRide(null);
    }
  }

  const handlePickupChange = async (e) => {
    const val = e.target.value;
    setPickup(val);
    if (!val || val.trim().length === 0) {
      setPickupSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: {
            input: val,
            lat: userLocation?.lat,
            lng: userLocation?.lng,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setPickupSuggestions(response.data);
    } catch {
      // handle error
    }
  };

  const handleDestinationChange = async (e) => {
    const val = e.target.value;
    setDestination(val);
    if (!val || val.trim().length === 0) {
      setDestinationSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: {
            input: val,
            lat: userLocation?.lat,
            lng: userLocation?.lng,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setDestinationSuggestions(response.data);
    } catch {
      // handle error
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useGSAP(
    function () {
      if (panelOpen) {
        gsap.to(panelRef.current, {
          height: "70%",
          padding: 24,
          // opacity:1
        });
        gsap.to(panelCloseRef.current, {
          opacity: 1,
        });
      } else {
        gsap.to(panelRef.current, {
          height: "0%",
          padding: 0,
          // opacity:0
        });
        gsap.to(panelCloseRef.current, {
          opacity: 0,
        });
      }
    },
    [panelOpen],
  );

  useGSAP(
    function () {
      if (vehiclePanel) {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehiclePanel],
  );

  useGSAP(
    function () {
      if (confirmRidePanel) {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(confirmRidePanelRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [confirmRidePanel],
  );

  useGSAP(
    function () {
      if (vehicleFound) {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(vehicleFoundRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [vehicleFound],
  );

  useGSAP(
    function () {
      if (waitingForDriver) {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(0)",
        });
      } else {
        gsap.to(waitingForDriverRef.current, {
          transform: "translateY(100%)",
        });
      }
    },
    [waitingForDriver],
  );

  async function findTrip() {
    if (!pickup.trim() || !destination.trim()) {
      alert("Please enter both pickup and destination addresses.");
      return;
    }

    setVehiclePanel(true);
    setPanelOpen(false);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/rides/get-fare`,
        {
          params: { pickup, destination },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setFare(response.data);
    } catch (err) {
      console.error(err);
      alert("Unable to fetch fare estimate. Please check addresses.");
    }
  }

  async function createRide() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        {
          pickup,
          destination,
          vehicleType,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRide(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to create ride. Please try again.");
    }
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Cancellation Toast Notification */}
      {cancelNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold animate-bounce">
          <i className="ri-information-line text-xl"></i>
          <span>{cancelNotification}</span>
        </div>
      )}

      <div
        className={`fixed top-5 left-5 right-5 z-20 flex items-center justify-between transition-opacity duration-200 ${
          panelOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-none"
        }`}
      >
        <img
          className="w-16 pointer-events-auto"
          src="/images/uber-logo.svg"
          alt="Uber"
        />
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link
            to="/history"
            className="h-10 px-3 bg-white shadow-md flex items-center justify-center rounded-full text-xs font-semibold text-gray-800 hover:bg-gray-100 transition"
          >
            <i className="ri-history-line text-base mr-1"></i> Trips
          </Link>
          <Link
            to="/user/logout"
            className="h-10 w-10 bg-white shadow-md flex items-center justify-center rounded-full text-gray-800 hover:bg-gray-100 transition"
          >
            <i className="ri-logout-box-r-line text-lg"></i>
          </Link>
        </div>
      </div>
      <div className="h-screen w-screen">
        {/* image for temporary use  */}
        <LiveTracking
          pickup={pickup}
          destination={destination}
          pickupCoords={pickupCoords}
          destCoords={destCoords}
        />
      </div>
      <div className=" flex flex-col justify-end h-screen absolute top-0 w-full pointer-events-none">
        <div className="h-[30%] p-6 bg-white relative pointer-events-auto shadow-2xl">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-6 top-6 text-2xl cursor-pointer"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-bold text-gray-900">Find a trip</h4>
          <form
            className="relative py-3"
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
            
            {/* Pickup Input with GPS Auto-Locate Button */}
            <div className="relative">
              <input
                onClick={() => {
                  setPanelOpen(true);
                  setActiveField("pickup");
                }}
                value={pickup}
                onChange={handlePickupChange}
                className="bg-[#eee] px-12 py-3 pr-11 text-base rounded-xl w-full font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
                type="text"
                placeholder="Add a pick-up location"
              />
              <button
                type="button"
                onClick={detectCurrentLocation}
                disabled={isLocating}
                title="Detect live GPS location"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/90 hover:bg-white text-emerald-600 flex items-center justify-center transition shadow-sm active:scale-95"
              >
                {isLocating ? (
                  <i className="ri-loader-4-line animate-spin text-base text-emerald-600"></i>
                ) : (
                  <i className="ri-crosshair-2-line text-lg text-emerald-600"></i>
                )}
              </button>
            </div>

            <input
              onClick={() => {
                setPanelOpen(true);
                setActiveField("destination");
              }}
              value={destination}
              onChange={handleDestinationChange}
              className="bg-[#eee] px-12 py-3 text-base rounded-xl w-full mt-3 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black"
              type="text"
              placeholder="Enter your destination"
            />
          </form>
          <button
            onClick={findTrip}
            className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-3 rounded-xl mt-2 w-full transition shadow-md active:scale-95 text-base"
          >
            Find Trip
          </button>
        </div>
        <div ref={panelRef} className="bg-white h-0 pointer-events-auto">
          <LocationSearchPanel
            suggestions={
              activeField === "pickup"
                ? pickupSuggestions
                : destinationSuggestions
            }
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            setPickup={setPickup}
            setDestination={setDestination}
            activeField={activeField}
            onUseCurrentLocation={detectCurrentLocation}
            isLocating={isLocating}
            setPickupCoords={setPickupCoords}
            setDestCoords={setDestCoords}
          />
        </div>
      </div>
      <div
        ref={vehiclePanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
      >
        <VehiclePanel
          selectVehicle={setVehicleType}
          fare={fare}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehiclePanel={setVehiclePanel}
        />
      </div>
      <div
        ref={confirmRidePanelRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
      >
        <ConfirmRide
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setConfirmRidePanel={setConfirmRidePanel}
          setVehicleFound={setVehicleFound}
        />
      </div>
      <div
        ref={vehicleFoundRef}
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-6 pt-12"
      >
        <LookingForDriver
          createRide={createRide}
          pickup={pickup}
          destination={destination}
          fare={fare}
          vehicleType={vehicleType}
          setVehicleFound={setVehicleFound}
          cancelRide={cancelRide}
        />
      </div>
      <div
        ref={waitingForDriverRef}
        className="fixed w-full  z-10 bottom-0  bg-white px-3 py-6 pt-12"
      >
        <WaitingForDriver
          ride={ride}
          setVehicleFound={setVehicleFound}
          setWaitingForDriver={setWaitingForDriver}
          waitingForDriver={waitingForDriver}
          cancelRide={cancelRide}
        />
      </div>
    </div>
  );
};

export default Home;

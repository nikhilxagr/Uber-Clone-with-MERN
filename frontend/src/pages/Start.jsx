import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Start = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null); // 'pickup' | 'destination' | null
  const [isLocating, setIsLocating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const containerRef = useRef(null);

  // Check login state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveInput(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick auto-locate GPS position
  const detectLiveLocation = useCallback(async () => {
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

        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/maps/reverse-geocode`,
            { params: { ltd: lat, lng } }
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
          setActiveInput(null);
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // Handle pickup typing
  const handlePickupChange = async (e) => {
    const val = e.target.value;
    setPickup(val);
    setActiveInput("pickup");

    if (!val || val.trim().length === 0) {
      setPickupSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: {
            input: val,
            lat: userLocation?.lat,
            lng: userLocation?.lng,
          },
        }
      );
      setPickupSuggestions(res.data || []);
    } catch {
      // ignore
    }
  };

  // Handle destination typing
  const handleDestinationChange = async (e) => {
    const val = e.target.value;
    setDestination(val);
    setActiveInput("destination");

    if (!val || val.trim().length === 0) {
      setDestinationSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`,
        {
          params: {
            input: val,
            lat: userLocation?.lat,
            lng: userLocation?.lng,
          },
        }
      );
      setDestinationSuggestions(res.data || []);
    } catch {
      // ignore
    }
  };

  // Select suggestion
  const handleSelectSuggestion = (item, type) => {
    const cleanText =
      typeof item === "object" && item !== null
        ? item.description || item.placeName
        : item;

    if (type === "pickup") {
      setPickup(cleanText);
      setPickupSuggestions([]);
    } else {
      setDestination(cleanText);
      setDestinationSuggestions([]);
    }
    setActiveInput(null);
  };

  // Submit search and proceed
  const handleSearchRide = (e) => {
    e?.preventDefault();

    if (pickup.trim()) {
      sessionStorage.setItem("initialPickup", pickup.trim());
    }
    if (destination.trim()) {
      sessionStorage.setItem("initialDestination", destination.trim());
    }

    if (isLoggedIn) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* 🧭 Minimal Top Header */}
      <header className="border-b border-neutral-100 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-neutral-950">
              Uber
            </span>
            <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
              by Nikhil
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link
              to="/captain-login"
              className="text-neutral-600 hover:text-black transition hidden sm:inline"
            >
              Drive
            </Link>
            <Link
              to="/admin"
              className="text-neutral-500 hover:text-black transition text-xs flex items-center gap-1 px-2.5 py-1 rounded-full border border-neutral-200"
            >
              <i className="ri-shield-line"></i> Admin
            </Link>

            {isLoggedIn ? (
              <Link
                to="/home"
                className="bg-black hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition flex items-center gap-1.5"
              >
                <span>Book Ride</span>
                <i className="ri-arrow-right-line"></i>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-neutral-700 hover:text-black font-semibold px-3 py-1.5 text-xs sm:text-sm transition"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="bg-black hover:bg-neutral-800 text-white font-semibold px-4 py-2 rounded-full text-xs sm:text-sm transition shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 🎯 Minimal Hero & Booking Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-12 sm:py-16 flex flex-col justify-center">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-950">
            Where can we take you?
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base font-normal mt-2 max-w-md mx-auto">
            Simple, upfront city rides across cabs, autos, and motos.
          </p>
        </div>

        {/* 🚖 The Clean Centered Ride Search Box */}
        <div
          ref={containerRef}
          className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-lg shadow-neutral-100 max-w-xl mx-auto w-full relative"
        >
          <form onSubmit={handleSearchRide} className="space-y-3">
            {/* Pickup */}
            <div className="relative">
              <div className="flex items-center bg-neutral-50 rounded-2xl px-4 py-3 border border-neutral-200/90 focus-within:border-black focus-within:bg-white transition">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mr-3"></span>
                <input
                  type="text"
                  value={pickup}
                  onChange={handlePickupChange}
                  onFocus={() => setActiveInput("pickup")}
                  placeholder="Enter pickup location"
                  className="bg-transparent flex-1 text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={detectLiveLocation}
                  disabled={isLocating}
                  title="Detect GPS location"
                  className="ml-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-1 transition"
                >
                  {isLocating ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <i className="ri-crosshair-2-line"></i>
                  )}
                  <span>Current</span>
                </button>
              </div>

              {/* Pickup Suggestions Dropdown */}
              {activeInput === "pickup" && pickupSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-neutral-200 z-50 max-h-56 overflow-y-auto p-1.5">
                  {pickupSuggestions.map((item, idx) => {
                    const title = typeof item === "object" ? item.placeName : item;
                    const sub = typeof item === "object" ? item.secondaryText : "";
                    const dist = typeof item === "object" ? item.distanceKm : "";

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item, "pickup")}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <i className="ri-map-pin-line text-neutral-400 text-sm shrink-0"></i>
                          <div className="truncate">
                            <p className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                              {title}
                            </p>
                            {sub && (
                              <p className="text-[11px] text-neutral-500 truncate">
                                {sub}
                              </p>
                            )}
                          </div>
                        </div>
                        {dist && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ml-2">
                            {dist}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="flex items-center bg-neutral-50 rounded-2xl px-4 py-3 border border-neutral-200/90 focus-within:border-black focus-within:bg-white transition">
                <span className="w-2.5 h-2.5 bg-black shrink-0 mr-3"></span>
                <input
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  onFocus={() => setActiveInput("destination")}
                  placeholder="Where are you going?"
                  className="bg-transparent flex-1 text-sm sm:text-base font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              {/* Destination Suggestions Dropdown */}
              {activeInput === "destination" && destinationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-neutral-200 z-50 max-h-56 overflow-y-auto p-1.5">
                  {destinationSuggestions.map((item, idx) => {
                    const title = typeof item === "object" ? item.placeName : item;
                    const sub = typeof item === "object" ? item.secondaryText : "";
                    const dist = typeof item === "object" ? item.distanceKm : "";

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item, "destination")}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition text-left"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <i className="ri-map-pin-2-fill text-neutral-700 text-sm shrink-0"></i>
                          <div className="truncate">
                            <p className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                              {title}
                            </p>
                            {sub && (
                              <p className="text-[11px] text-neutral-500 truncate">
                                {sub}
                              </p>
                            )}
                          </div>
                        </div>
                        {dist && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 ml-2">
                            {dist}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.99] mt-2"
            >
              <span>Find Rides</span>
              <i className="ri-arrow-right-line"></i>
            </button>
          </form>

          {/* Quick Popular Destination Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
            <span className="text-[11px] font-medium text-neutral-400">Quick:</span>
            {[
              { label: "Airport", value: "Chaudhary Charan Singh International Airport, Lucknow" },
              { label: "Railway Station", value: "Charbagh Railway Station, Lucknow" },
              { label: "Hazratganj", value: "Hazratganj, Lucknow, Uttar Pradesh" },
              { label: "BBD University", value: "BBD University, Faizabad Road, Lucknow" },
            ].map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDestination(chip.value);
                  setActiveInput(null);
                }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* 🚗 Clean 3-Vehicle Overview */}
        <div className="mt-12 max-w-xl mx-auto w-full">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-center mb-3">
            Available Vehicle Types
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100 text-center hover:bg-white hover:border-neutral-200 hover:shadow-sm transition">
              <img
                src="/images/uber-go.jpg"
                alt="UberGo"
                className="h-12 w-auto mx-auto object-contain rounded-md"
              />
              <p className="font-bold text-xs text-neutral-900 mt-2">UberGo</p>
              <p className="text-[10px] text-neutral-500 font-medium">4 seats • Cab</p>
            </div>

            <div className="bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100 text-center hover:bg-white hover:border-neutral-200 hover:shadow-sm transition">
              <img
                src="/images/uber-auto.jpg"
                alt="UberAuto"
                className="h-12 w-auto mx-auto object-contain rounded-md"
              />
              <p className="font-bold text-xs text-neutral-900 mt-2">Auto</p>
              <p className="text-[10px] text-neutral-500 font-medium">3 seats • Meter</p>
            </div>

            <div className="bg-neutral-50/70 p-3 rounded-2xl border border-neutral-100 text-center hover:bg-white hover:border-neutral-200 hover:shadow-sm transition">
              <img
                src="/images/uber-moto.jpg"
                alt="Moto"
                className="h-12 w-auto mx-auto object-contain rounded-md"
              />
              <p className="font-bold text-xs text-neutral-900 mt-2">Moto</p>
              <p className="text-[10px] text-neutral-500 font-medium">1 seat • Fast</p>
            </div>
          </div>
        </div>

        {/* 🤝 Minimal Driver Banner */}
        <div className="mt-10 max-w-xl mx-auto w-full">
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-950 text-white">
            <div>
              <p className="font-bold text-sm text-white">Want to drive & earn?</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Join our verified captain fleet with flexible hours.
              </p>
            </div>
            <Link
              to="/captain-signup"
              className="bg-white hover:bg-neutral-200 text-black text-xs font-bold px-3.5 py-2 rounded-xl transition whitespace-nowrap ml-3"
            >
              Sign up to drive
            </Link>
          </div>
        </div>
      </main>

      {/* 🏁 Minimal Footer */}
      <footer className="border-t border-neutral-100 py-5 px-5 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            <span className="font-bold text-black">Uber</span> by Nikhil • MERN Stack Platform
          </p>
          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <Link to="/home" className="hover:text-black transition">Rides</Link>
            <Link to="/captain-login" className="hover:text-black transition">Captain</Link>
            <Link to="/admin" className="hover:text-black transition">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Start;

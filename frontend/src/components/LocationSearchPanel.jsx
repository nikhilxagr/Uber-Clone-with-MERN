const LocationSearchPanel = ({
  suggestions,
  setPickup,
  setDestination,
  activeField,
  onUseCurrentLocation,
  isLocating = false,
  setPickupCoords,
  setDestCoords,
}) => {
  const handleSuggestionClick = (suggestion) => {
    const isObj = typeof suggestion === "object" && suggestion !== null;
    const cleanText = isObj ? (suggestion.description || suggestion.placeName) : suggestion;

    if (activeField === "pickup") {
      setPickup(cleanText);
      if (isObj && suggestion.ltd && suggestion.lng && setPickupCoords) {
        setPickupCoords({ ltd: suggestion.ltd, lng: suggestion.lng });
      }
    } else if (activeField === "destination") {
      setDestination(cleanText);
      if (isObj && suggestion.ltd && suggestion.lng && setDestCoords) {
        setDestCoords({ ltd: suggestion.ltd, lng: suggestion.lng });
      }
    }
  };

  return (
    <div className="py-2 overflow-y-auto max-h-[85%] pr-1">
      {/* 🎯 Quick Action: Use Current Location (Auto Live GPS) */}
      {activeField === "pickup" && onUseCurrentLocation && (
        <div
          onClick={onUseCurrentLocation}
          className="flex gap-3.5 p-3.5 border-2 border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100 rounded-2xl items-center my-2 justify-start cursor-pointer transition active:scale-95 shadow-sm group"
        >
          <div className="bg-emerald-600 text-white h-10 w-10 flex items-center justify-center rounded-xl shrink-0 shadow-sm group-hover:scale-105 transition">
            {isLocating ? (
              <i className="ri-loader-4-line text-xl animate-spin"></i>
            ) : (
              <i className="ri-crosshair-2-fill text-xl"></i>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              <span>Use Current Location</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.5 rounded uppercase">
                GPS
              </span>
            </h4>
            <p className="text-xs text-emerald-700 font-medium">
              {isLocating ? "Detecting your exact street & locality..." : "Accurately set pickup to where you are standing"}
            </p>
          </div>
        </div>
      )}

      {/* Location Search Suggestions List */}
      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-1.5 mt-2">
          {suggestions.map((elem, idx) => {
            const isObj = typeof elem === "object" && elem !== null;
            const placeName = isObj ? elem.placeName : elem;
            const secondaryText = isObj ? elem.secondaryText : "";
            const distanceKm = isObj ? elem.distanceKm : null;
            const distanceVal = isObj ? elem.distanceValue : null;

            // Highlight nearby local rides (within 35 km Rapido/Uber city radius)
            const isLocal = distanceVal !== null && distanceVal <= 35;

            return (
              <div
                key={idx}
                onClick={() => handleSuggestionClick(elem)}
                className="flex items-center gap-3.5 p-3 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition group"
              >
                <div className={`h-10 w-10 flex items-center justify-center rounded-xl shrink-0 transition ${
                  isLocal ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-gray-100 text-gray-700 group-hover:bg-gray-200"
                }`}>
                  <i className={`text-lg ${isLocal ? "ri-map-pin-user-fill" : "ri-map-pin-2-line"}`}></i>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-gray-900 truncate">
                      {placeName}
                    </h4>
                    {distanceKm && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isLocal
                          ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {distanceKm}
                      </span>
                    )}
                  </div>
                  {secondaryText && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {secondaryText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <i className="ri-search-eye-line text-2xl"></i>
          </div>
          <div>
            <p className="font-medium text-gray-600">Search any location in India</p>
            <p className="text-xs text-gray-400 mt-0.5">Closest places within 20–30 km are shown first</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearchPanel;

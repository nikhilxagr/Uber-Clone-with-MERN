const LocationSearchPanel = ({
  suggestions,
  setPickup,
  setDestination,
  activeField,
}) => {
  const handleSuggestionClick = (suggestion) => {
    if (activeField === "pickup") {
      setPickup(suggestion);
    } else if (activeField === "destination") {
      setDestination(suggestion);
    }
  };

  return (
    <div className="py-2">
      {suggestions && suggestions.length > 0 ? (
        suggestions.map((elem, idx) => (
          <div
            key={idx}
            onClick={() => handleSuggestionClick(elem)}
            className="flex gap-4 border-2 p-3 border-gray-50 active:border-black rounded-xl items-center my-2 justify-start cursor-pointer hover:bg-gray-50 transition"
          >
            <h2 className="bg-[#eee] h-8 flex items-center justify-center w-10 rounded-full shrink-0">
              <i className="ri-map-pin-fill text-gray-700"></i>
            </h2>
            <h4 className="font-medium text-sm text-gray-800 line-clamp-2">{elem}</h4>
          </div>
        ))
      ) : (
        <div className="py-6 text-center text-gray-400 text-sm flex flex-col items-center gap-1">
          <i className="ri-search-eye-line text-2xl"></i>
          <span>Type to search for pickup or destination location...</span>
        </div>
      )}
    </div>
  );
};

export default LocationSearchPanel;

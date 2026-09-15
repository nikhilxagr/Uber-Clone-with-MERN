import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FinishRide = (props) => {
  const [isEnding, setIsEnding] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  async function endRide() {
    setIsEnding(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
        {
          rideId: props.ride?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/captain-home");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || "Failed to complete ride. Try again."
      );
    } finally {
      setIsEnding(false);
    }
  }

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setFinishRidePanel(false);
        }}
      >
        <i className="text-3xl text-gray-300 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-semibold mb-4">Finish this Ride</h3>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm mb-4 flex items-center gap-2">
          <i className="ri-error-warning-line text-lg"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-2">
        <div className="flex items-center gap-3">
          <img
            className="h-12 rounded-full object-cover w-12"
            src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg"
            alt=""
          />
          <h2 className="text-lg font-medium">
            {props.ride?.user?.fullName || "Rider"}
          </h2>
        </div>
        <h5 className="text-lg font-semibold">
          {props.ride?.vehicleType?.toUpperCase()}
        </h5>
      </div>
      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-4">
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="ri-map-pin-user-fill text-emerald-600"></i>
            <div>
              <h3 className="text-lg font-medium">Pickup</h3>
              <p className="text-sm -mt-1 text-gray-600">{props.ride?.pickup}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3 border-b-2">
            <i className="text-lg ri-map-pin-2-fill text-red-500"></i>
            <div>
              <h3 className="text-lg font-medium">Destination</h3>
              <p className="text-sm -mt-1 text-gray-600">
                {props.ride?.destination}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-3">
            <i className="ri-currency-line text-emerald-600"></i>
            <div>
              <h3 className="text-lg font-medium">Rs {props.ride?.fare}</h3>
              <p className="text-sm -mt-1 text-gray-600">Cash</p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <button
            onClick={endRide}
            disabled={isEnding}
            className="w-full text-lg flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold p-3.5 rounded-lg transition"
          >
            {isEnding ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i> Completing...
              </>
            ) : (
              "Finish Ride"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishRide;

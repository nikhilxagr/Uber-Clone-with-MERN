import { useState } from "react";

const WaitingForDriver = (props) => {
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const captain = props.ride?.captain;

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          props.setWaitingForDriver(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>

      <div className="flex items-center justify-between">
        <img
          className="h-12"
          src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
          alt=""
        />
        <div className="text-right">
          <h2 className="text-lg font-bold capitalize text-gray-900">
            {captain?.fullname?.firstname || "Driver assigned"}
          </h2>
          <h4 className="text-xl font-extrabold text-emerald-600 -mt-1 -mb-1">
            {captain?.vehicle?.plate || "Vehicle details"}
          </h4>
          <p className="text-xs text-gray-500 uppercase font-semibold">
            {captain?.vehicle?.vehicleType || "Ride accepted"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-between flex-col items-center">
        <div className="w-full mt-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-2">
            <i className="ri-map-pin-user-fill text-emerald-600 text-lg"></i>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Pickup</h3>
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
                <h3 className="text-xs font-bold text-emerald-800 uppercase">Start OTP</h3>
                <p className="text-2xl font-black tracking-widest text-emerald-950">
                  {props.ride?.otp || "----"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-700 font-semibold">Trip Fare</p>
              <p className="text-lg font-bold text-emerald-900">₹{props.ride?.fare}</p>
            </div>
          </div>
        </div>

        {/* Cancellation Section */}
        {showConfirmCancel ? (
          <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
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
            className="w-full mt-4 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-transparent hover:border-red-200"
          >
            <i className="ri-close-circle-line text-lg"></i> Cancel Ride
          </button>
        )}
      </div>
    </div>
  );
};

export default WaitingForDriver;

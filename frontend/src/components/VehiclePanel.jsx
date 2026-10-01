import React from "react";

const VehiclePanel = (props) => {
  const isSurge = props.fare?.isSurge || (props.fare?.surgeMultiplier && props.fare.surgeMultiplier > 1);

  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          props.setVehiclePanel(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="text-2xl font-bold mb-3">Choose a Vehicle</h3>

      {/* Dynamic Surge Pricing Notice */}
      {isSurge && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-amber-800 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm shadow">
              <i className="ri-flashlight-fill"></i>
            </div>
            <div>
              <span className="font-black text-amber-900 uppercase tracking-wide">
                Surge Pricing Active
              </span>
              <p className="text-[11px] text-amber-700 font-medium">
                High demand in this area. Fares adjusted {props.fare?.surgeMultiplier}x to attract more drivers.
              </p>
            </div>
          </div>
          <span className="font-black font-mono bg-amber-500 text-white text-[11px] px-2 py-1 rounded-xl shadow-sm">
            {props.fare?.surgeMultiplier}x
          </span>
        </div>
      )}

      {/* Car Option */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("car");
        }}
        className="flex border-2 active:border-black hover:border-black transition mb-3 rounded-2xl w-full p-3.5 items-center justify-between cursor-pointer group shadow-sm bg-white"
      >
        <img
          className="h-12 w-16 object-contain rounded-xl"
          src="/images/uber-go.jpg"
          alt="UberGo"
        />
        <div className="ml-3 flex-1">
          <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
            UberGo{" "}
            <span className="text-xs text-gray-500 font-normal">
              <i className="ri-user-3-fill text-xs"></i> 4
            </span>
          </h4>
          <h5 className="font-semibold text-xs text-emerald-600">2 mins away</h5>
          <p className="font-normal text-xs text-gray-500">
            Affordable, compact sedans
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black text-gray-950">₹{props.fare?.car}</h2>
          {isSurge && (
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-0.5">
              <i className="ri-flashlight-fill text-[10px]"></i> Surge
            </span>
          )}
        </div>
      </div>

      {/* Moto Option */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("moto");
        }}
        className="flex border-2 active:border-black hover:border-black transition mb-3 rounded-2xl w-full p-3.5 items-center justify-between cursor-pointer group shadow-sm bg-white"
      >
        <img
          className="h-12 w-16 object-contain rounded-xl"
          src="/images/uber-moto.jpg"
          alt="Moto"
        />
        <div className="ml-3 flex-1">
          <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
            Moto{" "}
            <span className="text-xs text-gray-500 font-normal">
              <i className="ri-user-3-fill text-xs"></i> 1
            </span>
          </h4>
          <h5 className="font-semibold text-xs text-emerald-600">3 mins away</h5>
          <p className="font-normal text-xs text-gray-500">
            Fast motorcycle rides
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black text-gray-950">₹{props.fare?.moto}</h2>
          {isSurge && (
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-0.5">
              <i className="ri-flashlight-fill text-[10px]"></i> Surge
            </span>
          )}
        </div>
      </div>

      {/* Auto Option */}
      <div
        onClick={() => {
          props.setConfirmRidePanel(true);
          props.selectVehicle("auto");
        }}
        className="flex border-2 active:border-black hover:border-black transition mb-3 rounded-2xl w-full p-3.5 items-center justify-between cursor-pointer group shadow-sm bg-white"
      >
        <img
          className="h-12 w-16 object-contain rounded-xl"
          src="/images/uber-auto.jpg"
          alt="Auto"
        />
        <div className="ml-3 flex-1">
          <h4 className="font-bold text-base text-gray-900 flex items-center gap-1.5">
            UberAuto{" "}
            <span className="text-xs text-gray-500 font-normal">
              <i className="ri-user-3-fill text-xs"></i> 3
            </span>
          </h4>
          <h5 className="font-semibold text-xs text-emerald-600">3 mins away</h5>
          <p className="font-normal text-xs text-gray-500">
            No bargaining auto-rickshaws
          </p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-black text-gray-950">₹{props.fare?.auto}</h2>
          {isSurge && (
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-0.5">
              <i className="ri-flashlight-fill text-[10px]"></i> Surge
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;

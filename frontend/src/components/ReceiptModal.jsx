const ReceiptModal = ({ ride, onClose }) => {
  if (!ride) return null;

  const fareTotal = Number(ride.fare) || 0;
  const baseFare = Math.round(fareTotal * 0.3);
  const distanceFare = Math.round(fareTotal * 0.58);
  const taxesFee = fareTotal - (baseFare + distanceFare);

  const rideDate = ride.createdAt
    ? new Date(ride.createdAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const invoiceNumber = `UBR-${(ride._id || "TRIP").slice(-8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="p-6 sm:p-8 bg-white text-gray-900">
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tighter text-black">
                  Uber
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded uppercase">
                  Receipt
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 font-mono">{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-gray-900">
                ₹{fareTotal.toFixed(2)}
              </span>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                <i className="ri-checkbox-circle-fill"></i> Paid in Full
              </p>
            </div>
          </div>

          {/* Trip Summary Details */}
          <div className="py-4 border-b border-gray-100 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                Date & Time
              </span>
              <span className="font-semibold text-gray-800">{rideDate}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-semibold uppercase text-[10px]">
                Driver & Vehicle
              </span>
              <span className="font-semibold text-gray-800 capitalize">
                {ride.captain?.fullname?.firstname || "Assigned Driver"} •{" "}
                <span className="text-emerald-700 font-mono font-bold">
                  {ride.captain?.vehicle?.plate || ride.vehicleType?.toUpperCase()}
                </span>
              </span>
            </div>
          </div>

          {/* Route Details */}
          <div className="py-4 border-b border-gray-100 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] mt-0.5">
                ●
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Pickup
                </span>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                  {ride.pickup}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] mt-0.5">
                ■
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Drop-off
                </span>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                  {ride.destination}
                </p>
              </div>
            </div>
          </div>

          {/* Fare Breakdown Table */}
          <div className="py-4 border-b border-gray-200">
            <h5 className="text-[11px] font-bold uppercase text-gray-400 mb-3 tracking-wider">
              Fare Breakdown
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Base Fare</span>
                <span className="font-semibold text-gray-800">
                  ₹{baseFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Distance & Time Charge</span>
                <span className="font-semibold text-gray-800">
                  ₹{distanceFare.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Access & Platform Taxes (GST)</span>
                <span className="font-semibold text-gray-800">
                  ₹{taxesFee.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-dashed flex justify-between text-sm font-bold text-gray-900">
                <span>Total Fare Paid</span>
                <span>₹{fareTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Badge & Verified Stamp */}
          <div className="pt-4 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                Payment Method
              </span>
              <span className="font-bold text-gray-800 uppercase flex items-center gap-1.5 mt-0.5">
                <i className="ri-bank-card-fill text-blue-600"></i>
                {ride.paymentMethod || "Cash"}
              </span>
              {ride.paymentID && (
                <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                  Ref: {ride.paymentID}
                </span>
              )}
            </div>

            {/* Official Stamp */}
            <div className="border-2 border-emerald-600 text-emerald-700 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transform -rotate-3 select-none">
              VERIFIED PAID
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden when printing) */}
        <div className="p-4 bg-gray-50 border-t flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <i className="ri-printer-line text-sm"></i> Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

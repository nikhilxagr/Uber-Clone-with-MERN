import { useState } from "react";
import axios from "axios";

const PaymentModal = ({ ride, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/make-payment`,
        {
          rideId: ride._id,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setIsProcessing(false);
        onPaymentSuccess(response.data);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          ✕
        </button>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Payment</h3>
        <p className="text-sm text-gray-500 mb-6">Select your preferred payment method</p>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Amount</span>
            <h4 className="text-2xl font-extrabold text-gray-900">₹{ride?.fare}</h4>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {ride?.vehicleType?.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <label
            onClick={() => setPaymentMethod("upi")}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
              paymentMethod === "upi"
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="ri-qr-code-line text-2xl text-emerald-600"></i>
              <div>
                <h5 className="font-semibold text-gray-800">UPI / QR Payment</h5>
                <p className="text-xs text-gray-500">Google Pay, PhonePe, Paytm</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "upi"}
              onChange={() => setPaymentMethod("upi")}
              className="accent-black"
            />
          </label>

          <label
            onClick={() => setPaymentMethod("card")}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
              paymentMethod === "card"
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="ri-bank-card-line text-2xl text-blue-600"></i>
              <div>
                <h5 className="font-semibold text-gray-800">Credit / Debit Card</h5>
                <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
              className="accent-black"
            />
          </label>

          <label
            onClick={() => setPaymentMethod("cash")}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
              paymentMethod === "cash"
                ? "border-black bg-gray-50 ring-1 ring-black"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <i className="ri-money-dollar-circle-line text-2xl text-amber-600"></i>
              <div>
                <h5 className="font-semibold text-gray-800">Cash Payment</h5>
                <p className="text-xs text-gray-500">Pay directly to driver</p>
              </div>
            </div>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
              className="accent-black"
            />
          </label>
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i> Processing...
            </>
          ) : (
            `Pay ₹${ride?.fare}`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;

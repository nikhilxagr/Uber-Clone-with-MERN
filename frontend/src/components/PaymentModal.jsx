import { useState, useEffect } from "react";
import axios from "axios";

const playSuccessChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
    });
  } catch (err) {
    console.warn("Payment chime error:", err.message);
  }
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentModal = ({ ride, onClose, onPaymentSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // "razorpay" | "upi_sim" | "cash"
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handleRazorpayOnline = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create-razorpay-order`,
        { rideId: ride?._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, currency, keyId } = orderRes.data;

      // If Razorpay SDK loaded
      if (window.Razorpay && keyId && !keyId.includes("mockKey")) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "Uber Clone Ride",
          description: `Fare payment for ride to ${ride?.destination}`,
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/verify-payment`,
                {
                  rideId: ride?._id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentMethod: "razorpay",
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              playSuccessChime();
              setTransactionData(verifyRes.data);
              setPaymentDone(true);
              if (onPaymentSuccess) onPaymentSuccess(verifyRes.data);
            } catch (vErr) {
              setErrorMessage("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: ride?.user?.fullName || "Rider",
            email: ride?.user?.email || "rider@example.com",
          },
          theme: {
            color: "#000000",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setIsProcessing(false);
        return;
      }

      // Test Mode Sandbox verification simulation (works out-of-the-box without live merchant keys)
      setTimeout(async () => {
        try {
          const testPaymentId = `pay_sim_${Date.now()}`;
          const testSignature = `sig_sim_${Math.random().toString(36).substring(2)}`;

          const verifyRes = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/rides/verify-payment`,
            {
              rideId: ride?._id,
              razorpay_order_id: orderId,
              razorpay_payment_id: testPaymentId,
              razorpay_signature: testSignature,
              paymentMethod: "razorpay",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          playSuccessChime();
          setTransactionData(verifyRes.data);
          setPaymentDone(true);
          if (onPaymentSuccess) onPaymentSuccess(verifyRes.data);
        } catch (err) {
          setErrorMessage(err.response?.data?.message || "Payment failed");
        } finally {
          setIsProcessing(false);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Failed to initialize payment.");
      setIsProcessing(false);
    }
  };

  const handleCashOrSimulated = async () => {
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const paymentID =
        paymentMethod === "cash"
          ? `CASH_${Date.now().toString().slice(-6)}`
          : `UPI_${Date.now().toString().slice(-8)}`;

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/make-payment`,
        {
          rideId: ride?._id,
          paymentMethod,
          paymentID,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      playSuccessChime();
      setTransactionData(response.data);
      setPaymentDone(true);
      if (onPaymentSuccess) onPaymentSuccess(response.data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === "razorpay") {
      handleRazorpayOnline();
    } else {
      handleCashOrSimulated();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative shadow-2xl animate-in slide-in-from-bottom duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
        >
          <i className="ri-close-line text-lg"></i>
        </button>

        {paymentDone ? (
          /* Payment Success View */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
              <i className="ri-check-line"></i>
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">
                Payment Successful!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Transaction ID: {transactionData?.paymentID || "Confirmed"}
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Amount Paid</span>
                <span className="font-bold text-gray-900 text-sm">
                  ₹{ride?.fare}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Payment Method</span>
                <span className="font-semibold text-gray-800 uppercase">
                  {paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Status</span>
                <span className="font-bold text-emerald-600">PAID & VERIFIED</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-xl transition shadow-lg active:scale-95 text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Payment Selection View */
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Complete Payment
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Secure checkout for trip to {ride?.destination}
            </p>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs mb-4 flex items-center gap-2">
                <i className="ri-error-warning-line text-base"></i>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Total Fare Card */}
            <div className="bg-gray-900 text-white p-4 rounded-2xl mb-5 flex justify-between items-center shadow-md">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Total Fare Due
                </span>
                <h4 className="text-2xl font-black">₹{ride?.fare}</h4>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {ride?.vehicleType || "Ride"}
              </span>
            </div>

            {/* Payment Method Radio Options */}
            <div className="space-y-2.5 mb-6">
              {/* Option 1: Razorpay Gateway (Cards / UPI / NetBanking) */}
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "razorpay"
                    ? "border-black bg-emerald-50/50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-sm">
                    <i className="ri-secure-payment-fill"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-sm text-gray-900">
                        Razorpay Gateway
                      </h5>
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        OFFICIAL
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      UPI, Cards, NetBanking, Wallets
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="accent-black w-4 h-4"
                />
              </label>

              {/* Option 2: Instant UPI Simulator */}
              <label
                onClick={() => setPaymentMethod("upi_sim")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "upi_sim"
                    ? "border-black bg-emerald-50/50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-sm">
                    <i className="ri-qr-code-line"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gray-900">
                      Instant UPI / QR
                    </h5>
                    <p className="text-xs text-gray-500">
                      Google Pay, PhonePe, Paytm QR
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "upi_sim"}
                  onChange={() => setPaymentMethod("upi_sim")}
                  className="accent-black w-4 h-4"
                />
              </label>

              {/* Option 3: Cash Payment */}
              <label
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                  paymentMethod === "cash"
                    ? "border-black bg-emerald-50/50 ring-2 ring-black"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-sm">
                    <i className="ri-money-dollar-circle-line"></i>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gray-900">
                      Cash to Driver
                    </h5>
                    <p className="text-xs text-gray-500">
                      Pay in cash at the end of the trip
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-black w-4 h-4"
                />
              </label>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm"
            >
              {isProcessing ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                  <span>Connecting to Gateway...</span>
                </>
              ) : (
                <>
                  <i className="ri-shield-check-fill text-lg text-emerald-400"></i>
                  <span>Pay ₹{ride?.fare}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

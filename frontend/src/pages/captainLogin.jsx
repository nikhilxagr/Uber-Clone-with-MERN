import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { CaptainDataContext } from "../context/CaptainContext";

const Captainlogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setCaptain } = React.useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const captain = {
        email: email,
        password,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        captain
      );

      if (response.status === 200) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("token", data.token);
        navigate("/captain-home");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-7 h-screen flex flex-col justify-between max-w-md mx-auto">
      <div>
        <div className="flex items-center gap-3.5 mb-6">
          <img
            className="w-14 h-14 rounded-2xl shadow-md object-cover border border-neutral-100"
            src="/images/uber-driver-badge.jpg"
            alt="Uber Driver Logo"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-black tracking-tight">Uber</span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-md">
                Driver
              </span>
            </div>
            <p className="text-xs font-semibold text-neutral-400 mt-0.5">Captain Portal</p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2">
            <i className="ri-error-warning-line text-lg"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={submitHandler}>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:border-black"
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            className="bg-[#eeeeee] mb-7 rounded-lg px-4 py-3 border w-full text-lg placeholder:text-base focus:outline-none focus:border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="password"
          />

          <button
            disabled={isSubmitting}
            className="bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-3 w-full text-lg transition hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i> Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Join a fleet?{" "}
          <Link to="/captain-signup" className="text-blue-600 font-medium hover:underline">
            Register as a Captain
          </Link>
        </p>
      </div>
      <div>
        <Link
          to="/login"
          className="bg-[#d5622d] hover:bg-orange-700 flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-3 w-full text-lg transition"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default Captainlogin;

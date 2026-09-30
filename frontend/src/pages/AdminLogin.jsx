import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/admin/login`,
        {
          email: email.trim(),
          password: password,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message ||
          "Invalid admin credentials. Please check your email and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between p-6 sm:p-8 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-white">Uber</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ADMIN
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs font-semibold text-neutral-400 hover:text-white transition flex items-center gap-1"
        >
          <i className="ri-arrow-left-line"></i> Back to Home
        </Link>
      </div>

      {/* Main Admin Login Form */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Badge & Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-2xl">
              <i className="ri-shield-keyhole-line"></i>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Admin Portal
              </h2>
              <p className="text-xs text-neutral-400">
                Fleet telemetry & command access
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs mb-5 flex items-center gap-2">
              <i className="ri-error-warning-line text-base shrink-0"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="flex items-center bg-neutral-950 rounded-xl px-3.5 py-3 border border-neutral-800 focus-within:border-emerald-500 transition">
                <i className="ri-mail-line text-neutral-500 mr-2.5 text-base"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="bg-transparent flex-1 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Admin Password
              </label>
              <div className="flex items-center bg-neutral-950 rounded-xl px-3.5 py-3 border border-neutral-800 focus-within:border-emerald-500 transition">
                <i className="ri-lock-line text-neutral-500 mr-2.5 text-base"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="bg-transparent flex-1 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-neutral-500 hover:text-neutral-300 text-sm ml-2"
                >
                  <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3.5 px-5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm mt-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base"></i>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <i className="ri-arrow-right-line text-base"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-neutral-600">
        Uber Fleet Command & Administration • Protected Access
      </div>
    </div>
  );
};

export default AdminLogin;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CaptainLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        { email, password },
      );

      if (response.status === 200) {
        localStorage.setItem("captainToken", response.data.token);
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Unable to sign in as captain. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef7f1] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_90px_rgba(24,24,27,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[#0f3d2e] px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-sm text-white/90"
          >
            Uber Captain
          </Link>

          <div className="mt-10 max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">
              Captain Login
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Head online and start accepting rides.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/75 sm:text-base">
              Sign in to manage ride requests, track your driving status, and
              stay ready for the next pickup.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-16 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Fast dispatch access</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Jump back into your captain session and stay available for new
                rider requests.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Vehicle-ready workflow</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Keep your profile, trip access, and driver tools connected in
                one place.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#fcfefc] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              Sign In
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              Continue as captain
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Use your captain email and password to access your driving
              account.
            </p>

            <form onSubmit={submitHandler} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="captainEmail"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Email address
                </label>
                <input
                  id="captainEmail"
                  type="email"
                  placeholder="captain@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                />
              </div>

              <div>
                <label
                  htmlFor="captainPassword"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Password
                </label>
                <input
                  id="captainPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                />
              </div>

              {errorMessage ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#0f3d2e] text-base font-medium text-white transition hover:bg-[#0c3125] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in as Captain"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              New captain?{" "}
              <Link
                to="/captain-signup"
                className="font-semibold text-[#0f3d2e]"
              >
                Create a captain account
              </Link>
            </p>

            <Link
              to="/login"
              className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white text-base font-medium text-zinc-900 transition hover:border-zinc-400"
            >
              Switch to User Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CaptainLogin;

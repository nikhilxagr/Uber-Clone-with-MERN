import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UserLogin = () => {
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
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        { email, password },
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe7] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_90px_rgba(24,24,27,0.12)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="bg-[#111111] px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-12">
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-sm text-white/90"
          >
            Uber
          </Link>

          <div className="mt-10 max-w-md">
            <p className="text-sm uppercase tracking-[0.3em] text-lime-300">
              Welcome back
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Sign in and get moving again.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/75 sm:text-base">
              Book rides faster, track your recent trips, and manage your rider
              account from one place.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:mt-16 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Quick pickups</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Save time with a smoother sign-in flow and faster access to your
                ride options.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold">Simple account access</p>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Use your rider email and password to continue right where you
                left off.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#fffdf8] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              User Login
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              Continue to your account
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Enter your email and password to sign in and continue booking with
              Uber.
            </p>

            <form onSubmit={submitHandler} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
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
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-black text-base font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              New to Uber?{" "}
              <Link to="/signup" className="font-semibold text-zinc-950">
                Create an account
              </Link>
            </p>

            <Link
              to="/captain-login"
              className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-[#22c55e] text-base font-medium text-white transition hover:bg-[#16a34a]"
            >
              Sign in as Captain
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserLogin;
  

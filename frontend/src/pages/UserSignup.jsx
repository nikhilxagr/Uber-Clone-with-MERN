import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const UserSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName,
      },
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser,
      );

      if (response.status === 201) {
        navigate("/login");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f4efe7] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_90px_rgba(24,24,27,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center bg-[#fffdf8] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-1 text-sm font-medium text-zinc-900"
            >
              Uber
            </Link>

            <p className="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              User Signup
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              Create your rider account
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Set up your account to request rides, save trip details, and get
              started in minutes.
            </p>

            <form onSubmit={submitHandler} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-zinc-900"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-zinc-900"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signupEmail"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Email address
                </label>
                <input
                  id="signupEmail"
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
                  htmlFor="signupPassword"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Create password
                </label>
                <input
                  id="signupPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
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
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-zinc-950">
                Sign in
              </Link>
            </p>

            <Link
              to="/captain-signup"
              className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-[#22c55e] text-base font-medium text-white transition hover:bg-[#16a34a]"
            >
              Sign up as Captain
            </Link>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#d9f99d] via-[#86efac] to-[#14532d] px-6 py-8 text-[#052e16] sm:px-8 lg:px-12 lg:py-12">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="inline-flex rounded-full border border-[#14532d]/20 bg-white/30 px-4 py-1 text-sm font-medium">
                Fresh start
              </p>
              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                One account for every ride you take.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#14532d] sm:text-base">
                Save frequent destinations, keep trip history in one place, and
                jump into booking without extra steps.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl bg-white/55 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold">Rider-first flow</p>
                <p className="mt-2 text-sm leading-6 text-[#14532d]">
                  A cleaner signup form with just the details you need to begin.
                </p>
              </div>
              <div className="rounded-3xl bg-white/55 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold">Fast onboarding</p>
                <p className="mt-2 text-sm leading-6 text-[#14532d]">
                  Create your account now and move straight into sign-in and
                  booking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserSignup;

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const CaptainSignup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const newCaptain = {
      fullname: fullName,
      email,
      password,
      phone,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: Number(vehicleCapacity),
        vehicleType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        newCaptain,
      );

      if (response.status === 201) {
        localStorage.setItem("captainToken", response.data.token);
        navigate("/captain-login");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          "Unable to create captain account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setVehicleColor("");
      setVehiclePlate("");
      setVehicleCapacity("");
      setVehicleType("car");
    }
  };

  return (
    <div className="min-h-screen bg-[#eef7f1] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_90px_rgba(24,24,27,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center bg-[#fcfefc] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-xl">
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-1 text-sm font-medium text-zinc-900"
            >
              Uber Captain
            </Link>

            <p className="mt-8 text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              Captain Signup
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950">
              Create your captain account
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Add your driver and vehicle details so you can get ready to accept
              rides.
            </p>

            <form onSubmit={submitHandler} className="mt-8 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="captainName"
                    className="mb-2 block text-sm font-medium text-zinc-900"
                  >
                    Full name
                  </label>
                  <input
                    id="captainName"
                    type="text"
                    placeholder="John Driver"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="captainSignupEmail"
                    className="mb-2 block text-sm font-medium text-zinc-900"
                  >
                    Email address
                  </label>
                  <input
                    id="captainSignupEmail"
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
                    htmlFor="captainPhone"
                    className="mb-2 block text-sm font-medium text-zinc-900"
                  >
                    Phone number
                  </label>
                  <input
                    id="captainPhone"
                    type="tel"
                    placeholder="10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="captainSignupPassword"
                  className="mb-2 block text-sm font-medium text-zinc-900"
                >
                  Create password
                </label>
                <input
                  id="captainSignupPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                />
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-[#f7faf8] p-5">
                <p className="text-sm font-semibold text-zinc-950">
                  Vehicle details
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="vehicleColor"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Vehicle color
                    </label>
                    <input
                      id="vehicleColor"
                      type="text"
                      placeholder="Black"
                      value={vehicleColor}
                      onChange={(e) => setVehicleColor(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="vehiclePlate"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Plate number
                    </label>
                    <input
                      id="vehiclePlate"
                      type="text"
                      placeholder="MH12AB1234"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="vehicleCapacity"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Capacity
                    </label>
                    <input
                      id="vehicleCapacity"
                      type="number"
                      min="1"
                      placeholder="4"
                      value={vehicleCapacity}
                      onChange={(e) => setVehicleCapacity(e.target.value)}
                      required
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-[#0f3d2e]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="vehicleType"
                      className="mb-2 block text-sm font-medium text-zinc-900"
                    >
                      Vehicle type
                    </label>
                    <select
                      id="vehicleType"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-zinc-900 outline-none transition focus:border-[#0f3d2e]"
                    >
                      <option value="car">Car</option>
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                    </select>
                  </div>
                </div>
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
                {isSubmitting ? "Creating account..." : "Create Captain Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Already registered as captain?{" "}
              <Link
                to="/captain-login"
                className="font-semibold text-[#0f3d2e]"
              >
                Sign in
              </Link>
            </p>

            <Link
              to="/signup"
              className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white text-base font-medium text-zinc-900 transition hover:border-zinc-400"
            >
              Switch to User Signup
            </Link>
          </div>
        </section>

        <section className="bg-gradient-to-br from-[#bbf7d0] via-[#4ade80] to-[#14532d] px-6 py-8 text-[#052e16] sm:px-8 lg:px-12 lg:py-12">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="inline-flex rounded-full border border-[#14532d]/20 bg-white/35 px-4 py-1 text-sm font-medium">
                Driver onboarding
              </p>
              <h2 className="mt-6 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                Put your car, bike, or scooter on the road.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#14532d] sm:text-base">
                Build your captain profile, register your vehicle, and get ready
                for live trip requests with a cleaner setup flow.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-3xl bg-white/55 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold">All required fields covered</p>
                <p className="mt-2 text-sm leading-6 text-[#14532d]">
                  The form matches your backend rules for name, phone, and
                  vehicle details.
                </p>
              </div>
              <div className="rounded-3xl bg-white/55 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold">Ready for next screens</p>
                <p className="mt-2 text-sm leading-6 text-[#14532d]">
                  Captain auth is now connected and ready for profile or driver
                  dashboard pages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CaptainSignup;

import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'

const Home = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5efe6] px-4 py-6 sm:px-6 lg:px-10">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.24),_transparent_55%)]" />
      <div className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-[#d9f99d]/40 blur-3xl" />
      <div className="absolute -right-16 bottom-16 h-64 w-64 rounded-full bg-[#fdba74]/30 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[32px] bg-white shadow-[0_25px_90px_rgba(24,24,27,0.14)] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[380px] overflow-hidden bg-[#171717] p-6 text-white sm:p-8 lg:min-h-[680px] lg:p-12">
            <img
              src={heroImage}
              alt="A rider using Uber transportation"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-lime-400/20" />

            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm backdrop-blur">
                  Uber
                </div>
                <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight sm:text-5xl">
                  Your next ride starts with one tap.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-white/80 sm:text-base">
                  Fast pickups, smooth payments, and a cleaner trip booking
                  experience designed for everyday travel.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold">10k+</p>
                  <p className="mt-1 text-sm text-white/75">Rides completed</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold">24/7</p>
                  <p className="mt-1 text-sm text-white/75">Support on the go</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-semibold">4.9/5</p>
                  <p className="mt-1 text-sm text-white/75">Rider satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center bg-[#fffdf8] p-6 sm:p-8 lg:p-12">
            <div className="w-full">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
                Ride Ready
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
                Get started with your rider account
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-zinc-600 sm:text-base">
                Continue to sign in, create a new account, and book your trip in
                just a few seconds.
              </p>

              <div className="mt-8 space-y-3">
                <Link
                  to="/login"
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-black text-base font-medium text-white transition hover:bg-zinc-800"
                >
                  Continue
                </Link>
                <Link
                  to="/signup"
                  className="flex h-14 w-full items-center justify-center rounded-2xl border border-zinc-300 bg-white text-base font-medium text-zinc-900 transition hover:border-zinc-400"
                >
                  Create account
                </Link>
              </div>

              <div className="mt-8 rounded-3xl bg-[#f3f4f6] p-5">
                <p className="text-sm font-semibold text-zinc-900">
                  Why riders like this flow
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Simple sign in, faster booking, and a clear path to switch
                  between user and captain accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

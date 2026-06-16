import { Link } from 'react-router-dom'

const heroImage =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQutLPfUeWIn43RWE6M7UA357OOrtU8v6iupW3tS64T216pq41-WSjYJOhm&s=10'

const Home = () => {
  return (
    <div className="min-h-screen bg-zinc-700 md:flex md:items-center md:justify-center md:p-6">
      <div className="mx-auto flex min-h-screen w-full max-w-[375px] flex-col overflow-hidden bg-white md:min-h-[667px] md:shadow-2xl">
        <div className="relative flex-1">
          <img
            src={heroImage}
            alt="Traffic signal below an Uber street sign"
            className="h-full w-full object-cover"
          />
          <h1 className="absolute left-4 top-4 text-4xl font-semibold tracking-tight text-black">
            Uber
          </h1>
        </div>

        <div className="bg-white px-4 pb-5 pt-4">
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-zinc-900">
            Get Started with Uber
          </h2>

          <Link
            to="/login"
            className="mt-4 flex h-12 w-full items-center justify-center rounded bg-black text-sm font-medium text-white transition hover:bg-zinc-900"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home

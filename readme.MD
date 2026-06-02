<div align="center" style="background: linear-gradient(135deg, #111827, #0ea5e9); padding: 32px 16px; border-radius: 16px; color: #ffffff;">
	<h1 style="margin: 0; font-size: 36px; letter-spacing: 1px;">Uber Clone with MERN</h1>
	<p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">A full-stack ride-hailing clone built with the MERN stack.</p>
</div>

This README provides setup, configuration, and run instructions you can adapt to your environment.

## Tech Stack

- MongoDB
- Express.js
- React
- Node.js

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

## Setup

1. Clone the repository.
2. Install dependencies for server and client.
3. Configure environment variables.

## Install Dependencies

From the project root:

```bash
npm install
```

If the project is split into `client` and `server`, install there too:

```bash
cd server
npm install

cd ..\client
npm install
```

## Environment Variables

Create a `.env` file in the server folder with values like:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

If the client needs environment variables, add a `.env` in `client`:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Run Locally

### Server

```bash
cd server
npm run dev
```

### Client

```bash
cd client
npm start
```

## Common Scripts

- `npm run dev` - start server in development mode
- `npm start` - start client or server (depends on folder)
- `npm run build` - build the client for production

## Project Structure (typical)

```
client/      React app
server/      Express API
```

## Notes

- Update the environment variable names to match your code.
- If you use a single `package.json` at the root, adjust commands accordingly.

## License

MIT

<div align="center" style="margin-top: 48px;">
	<svg width="100%" height="80" viewBox="0 0 1200 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M0,64 C120,96 240,96 360,64 C480,32 600,32 720,64 C840,96 960,96 1080,64 C1140,48 1200,40 1200,40 L1200,120 L0,120 Z" fill="#0ea5e9" />
	</svg>
	<div style="background: #0ea5e9; color: #ffffff; padding: 12px 16px; border-radius: 0 0 16px 16px;">
		<strong>Thanks for checking out the project.</strong>
	</div>
</div>

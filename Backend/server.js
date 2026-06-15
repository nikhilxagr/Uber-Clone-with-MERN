const path = require("path");
const http = require("http");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const connectToDb = require("./db/db");
const port = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing process or change PORT in Backend/.env.`);
  } else {
    console.error("Server failed to start:", error.message);
  }

  process.exit(1);
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in Backend/.env");
    }

    await connectToDb();

    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Unable to start the server:", error.message);
    process.exit(1);
  }
}

startServer();


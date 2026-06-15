const net = require("net");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;
let connectionPromise;

function isLocalMongoUri(uri) {
  try {
    const { hostname } = new URL(uri);
    return (
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"
    );
  } catch (err) {
    return false;
  }
}

function canReachHost(hostname, port, timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: hostname, port });

    const cleanup = (isReachable) => {
      socket.destroy();
      resolve(isReachable);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => cleanup(true));
    socket.once("timeout", () => cleanup(false));
    socket.once("error", () => cleanup(false));
  });
}

async function connectToMemoryDb() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create();
  }

  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log("Connected to in-memory MongoDB");
  return mongoose.connection;
}

function connectToDb() {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.warn(
        "MONGODB_URI is not set. Using in-memory MongoDB for this session.",
      );
      return connectToMemoryDb();
    }

    if (isLocalMongoUri(uri)) {
      const { hostname, port } = new URL(uri);
      const parsedPort = Number(port) || 27017;
      const isReachable = await canReachHost(hostname, parsedPort);

      if (!isReachable) {
        console.warn(
          "Local MongoDB is not running. Using in-memory MongoDB for this session.",
        );
        return connectToMemoryDb();
      }
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return mongoose.connection;
  })().catch(async (err) => {
    console.error("Error connecting to MongoDB:", err.message);

    try {
      return await connectToMemoryDb();
    } catch (memoryErr) {
      connectionPromise = null;
      throw new Error(
        `Unable to connect to MongoDB or start the in-memory database: ${memoryErr.message}`,
      );
    }
  });

  return connectionPromise;
}

module.exports = connectToDb;

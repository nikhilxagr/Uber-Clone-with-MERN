const mongoose = require("mongoose");
let connectionPromise;

function connectToDb() {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing in Backend/.env");
    }

    await mongoose.connect(uri);
    console.log("✅Connected to MongoDB");
    return mongoose.connection;
  })().catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

module.exports = connectToDb;

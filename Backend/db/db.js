const mongoose = require("mongoose");
let connectionPromise;

function connectToDb(retries = 5, delay = 3000) {
  if (connectionPromise) {
    return connectionPromise;
  }

  const attemptConnect = async (remaining) => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error("❌ MONGODB_URI is missing in Backend/.env");
      return;
    }

    try {
      await mongoose.connect(uri);
      console.log("✅ Connected to MongoDB");
      return mongoose.connection;
    } catch (err) {
      console.error("❌ Error connecting to MongoDB:", err.message);
      connectionPromise = null;
      if (remaining > 0) {
        console.log(`🔄 Retrying MongoDB connection in ${delay / 1000}s... (${remaining} attempts left)`);
        setTimeout(() => attemptConnect(remaining - 1), delay);
      }
    }
  };

  connectionPromise = attemptConnect(retries);
  return connectionPromise;
}

module.exports = connectToDb;

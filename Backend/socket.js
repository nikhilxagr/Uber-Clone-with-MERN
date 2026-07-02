const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      if (userType === "user") {
        socket.data.userId = userId;
        socket.data.userType = userType;
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      } else if (userType === "captain") {
        socket.data.userId = userId;
        socket.data.userType = userType;
        await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      const ltd = Number(location?.ltd);
      const lng = Number(location?.lng);

      if (!Number.isFinite(ltd) || !Number.isFinite(lng)) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await captainModel.findByIdAndUpdate(userId, {
        location: {
          ltd,
          lng,
        },
      });
    });

    socket.on("disconnect", async () => {
      const { userId, userType } = socket.data;

      if (userId && userType === "user") {
        await userModel.findByIdAndUpdate(userId, { $unset: { socketId: "" } });
      } else if (userId && userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, {
          $unset: { socketId: "" },
        });
      }

      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  console.log(messageObject);

  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };

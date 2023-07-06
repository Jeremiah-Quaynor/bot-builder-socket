const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store user connections in an object
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  // Check if it's the user's first visit
  const isFirstVisit = !connectedUsers[socket.id];

  // Store user's connection status
  connectedUsers[socket.id] = true;

  // If it's not the first visit, disconnect the socket immediately
  if (!isFirstVisit) {
    console.log(
      "Duplicate connection detected. Disconnecting socket: ",
      socket.id
    );
    socket.disconnect(true);
    return;
  }

  // Receive data from external server
  socket.on("externalData", (data) => {
    console.log("Received data from external server: ", data);

    // Broadcast the data to all connected devices
    io.emit("broadcastData", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
    // Remove the user's connection status when they disconnect
    delete connectedUsers[socket.id];
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the chat server");
});

server.listen(5000, () => {
  console.log("Listening on http://localhost:5000");
});

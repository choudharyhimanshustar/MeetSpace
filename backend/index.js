const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const connect = require("./connection/db");
const cors = require("cors");
require("dotenv").config();

const Authenticate = require("./components/Authenticate");
const Login = require("./components/Login");
const SignUP = require("./components/SignUP");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connect();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://meet-space-ten.vercel.app",
  "https://meet-space-gsnh.vercel.app",
];
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
};
app.use(cors(corsOptions)); // Apply CORS middleware

// Routes
app.use("/", Authenticate);
app.get("/", (req, res) => res.send("Meet Space API")); // Fixed route definition
app.use("/login", Login);
app.use("/SignUP", SignUP);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS Error",
      message: "This origin is not allowed to access the resource",
    });
  } else {
    res.status(500).send("Something broke!");
  }
});

// Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO logic
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  socket.on("room:join", (data) => {
    const { email, roomID } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(roomID).emit("user:joined", { email, id: socket.id });
    socket.join(roomID);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("call:disconnected", ({ to }) => {
    io.to(to).emit("call:disconnected", { to: to });
  });

  socket.on("video:toggle", ({ to, isVideoEnabled }) => {
    io.to(to).emit("video:toggle", { to: to, isVideoEnabled });
  });

  socket.on("audio:toggle", ({ to, isAudioEnabled }) => {
    io.to(to).emit("audio:toggle", { to: to, isAudioEnabled });
  });
});

// HTTP Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});

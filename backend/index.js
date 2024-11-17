const express = require("express");
const app = express();
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
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// Routes
app.use("/", Authenticate);
app.get("/", (req, res) => res.send("Meet Space API")); // Fixed route definition
app.use("/login", Login);
app.use("/SignUP", SignUP);

// Add error handling middleware
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS Error",
      message: "This origin is not allowed to access the resource",
    });
  } else {
    next(err);
  }
});

// Socket.IO Server with updated CORS configuration
const io = new Server(2001, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  },
});

// Rest of your Socket.IO code remains the same...
const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket Connected", socket.id);

  socket.on("room:join", (data) => {
    const { email, roomID } = data;
    console.log("Email", email, "RoomID", roomID);
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
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  socket.on("call:disconnected", ({ to }) => {
    io.to(to).emit("call:disconnected", { to: to });
  });

  socket.on("video:toggle", ({ to, isVideoEnabled }) => {
    io.to(to).emit("video:toggle", { to: to, isVideoEnabled: isVideoEnabled });
  });

  socket.on("audio:toggle", ({ to, isAudioEnabled }) => {
    io.to(to).emit("audio:toggle", { to: to, isAudioEnabled: isAudioEnabled });
  });
});

// HTTP Server
const PORT = process.env.PORT || 2002;
app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});

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
const corsOptions = {
  origin: ["https://meet-space-ten.vercel.app"],
  credentials: true, // Allow credentials (cookies, etc.)
  methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  allowedHeaders: "Content-Type,Authorization",
};
console.log(process.env.CORS_ORIGIN);

app.use(
  cors({
    origin: ["https://meet-space-ten.vercel.app"],
    credentials: true,
    methods: ["GET", "POST"],
  })
);
// Handle Preflight Requests
app.options("*", cors(corsOptions));

// Routes
app.use("/", Authenticate);
app.route("/", (req, res) => res.send("Meet Space API"));
app.use("/login", Login);
app.use("/SignUP", SignUP);

// Socket.IO Server
const io = new Server(2001, {
  cors: {
    origin: [
      "https://meet-space-ten.vercel.app", 
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

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
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});

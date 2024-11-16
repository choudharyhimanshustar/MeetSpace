const express = require('express');
const app = express();
const { Server } = require("socket.io");
const io = new Server(2001, {
  cors: {
    origin: 'https://meet-space-ten.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const connect = require('./connection/db');
const cors = require('cors');

require('dotenv').config();
const Authenticate = require('./components/Authenticate')
const Login = require('./components/Login');
const SignUP = require('./components/SignUP');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connect();
app.use((req, res, next) => {
  // Enabling CORS
  res.header("Access-Control-Allow-Origin", "https://meet-space-ten.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === 'OPTIONS') {
    // Respond to preflight request
    return res.status(200).send();
  }
  next();
});
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://meet-space-ten.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200); // Preflight request success
});

app.use('/', Authenticate);
app.use('/login', Login);
app.use('/SignUP', SignUP);

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    const { email, roomID } = data;
    console.log("Email", email, "RoomID", roomID)
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
  })
  socket.on("audio:toggle", ({ to, isAudioEnabled }) => {
    io.to(to).emit("audio:toggle", { to: to, isAudioEnabled: isAudioEnabled });
  });
})

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server connected on ${PORT}`);
});
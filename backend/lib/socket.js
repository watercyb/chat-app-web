import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socket_protextRoute } from "../middleware/socket_middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {};

io.use(socket_protextRoute);

io.on("connection", (socket) => {
  const userId = socket.user?._id.toString();
  if (!userId) return;
  console.log("A user connected (", userId, "):", socket.id);

  if (userId) {
    if (!userSocketMap[userId]) userSocketMap[userId] = new Set();
    userSocketMap[userId].add(socket.id);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected (", userId, "):", socket.id);
    const socketIds = userSocketMap[userId];
    socketIds.delete(socket.id);
    if (socketIds.size === 0) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { io, app, server, getReceiverSocketId };

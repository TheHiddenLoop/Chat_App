import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
  socket.on("sendFriendRequest", (data) => {
    const receiverSocketId = getReceiverSocketId(data.receiverId);
    if (receiverSocketId) io.to(receiverSocketId).emit("newFriendRequest", data);
  });

  socket.on("acceptFriendRequest", (data) => {
    const senderSocketId = getReceiverSocketId(data.senderId);
    if (senderSocketId) io.to(senderSocketId).emit("friendRequestAccepted", data);
  });

  socket.on("rejectFriendRequest", (data) => {
    const senderSocketId = getReceiverSocketId(data.senderId);
    if (senderSocketId) io.to(senderSocketId).emit("friendRequestRejected", data);
  });

});

export { io, app, server };

const socketIo = require("socket.io");

module.exports = (server) => {
  const options = {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  };

  const io = socketIo(server, options);

  io.on("connection", (socket) => {
    socket.on("setup", (userId) => {
      socket.join(userId);
    });

    socket.on("join room", (roomId) => {
      socket.join(roomId);
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
    });

    socket.on("typing", (roomId, user) => {
      socket.broadcast.to(roomId).emit("typing", user);
    });

    socket.on("stop typing", (roomId, user) => {
      socket.broadcast.to(roomId).emit("stop typing", user);
    });

    socket.on("new message", (roomId, message) => {
      socket.broadcast.to(roomId).emit("message received", message);
    });

    socket.on("new pinned message", (roomId, message) => {
      io.to(roomId).emit("pinned message received", message);
    });

    socket.on("new replied message", (roomId, message) => {
      socket.broadcast.to(roomId).emit("replied message received", message);
    });

    socket.on("delete message", (roomId, messageId) => {
      socket.broadcast.to(roomId).emit("message deleted", messageId);
    });

    socket.on("delete pinned message", (roomId, messageId) => {
      socket.to(roomId).emit("pinned message deleted", messageId);
    });

    socket.on("block member", (userId, roomId) => {
      socket.broadcast.to(userId).emit("iam blocked", roomId, userId);
    });

    socket.on("unblock member", (userId, roomId) => {
      socket.broadcast.to(userId).emit("iam unblocked", roomId, userId);
    });

    socket.on("block members", (roomId, userIds) => {
      socket.broadcast.to(roomId).emit("members blocked", userIds);
    });

    socket.on("unblock members", (roomId, userIds) => {
      socket.broadcast.to(roomId).emit("members unblocked", userIds);
    });

    socket.on("delete room", (roomId) => {
      socket.broadcast.to(roomId).emit("room deleted", roomId);
    });

    socket.on("send notification", (userIds = [], roomId) => {
      userIds.forEach((userId) => {
        socket.broadcast.to(userId).emit("notification received", roomId);
      });
    });
  });
};

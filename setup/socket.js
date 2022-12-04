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
    socket.on("join room", (roomId) => {
      const lastJoinedRooms = Array.from(socket.rooms).slice(1);
      lastJoinedRooms.forEach((roomId) => socket.leave(roomId));

      socket.join(roomId);
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

    socket.on("delete message", (roomId, messageId) => {
      socket.broadcast.to(roomId).emit("message deleted", messageId);
    });

    socket.on("block members", (roomId, userIds) => {
      socket.broadcast.to(roomId).emit("memebrs blocked", userIds);
    });

    socket.on("unblock members", (roomId, userIds) => {
      socket.broadcast.to(roomId).emit("memebrs unblocked", userIds);
    });
  });
};

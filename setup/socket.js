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
      socket.join(roomId);
    });

    socket.on("typing", (roomId, user) => {
      io.to(roomId).emit("typing", user);
    });

    socket.on("stop typing", (roomId, user) => {
      io.to(roomId).emit("stop typing", user);
    });

    socket.on("new message", (roomId, message) => {
      socket.broadcast.to(roomId).emit("message received", message);
    });

    socket.on("leave room", (roomId) => {
      socket.leave(roomId);
    });
  });
};

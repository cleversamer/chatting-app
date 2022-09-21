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
    console.log("connected", socket.id);

    socket.on("send-message", (message) => {
      socket.broadcast.emit(message);
    });
  });
};

const host = require("../config/host");
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
    console.log(socket.id);

    socket.on("custom-event", (message) => {
      console.log(message);
    });
  });
};

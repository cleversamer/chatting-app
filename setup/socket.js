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
    console.log("Connected", socket.id);

    socket.on("setup", (user) => {
      socket.join(user._id);
      socket.emit("connected");
    });

    socket.on("join room", (room) => {
      socket.join(room._id);
    });

    socket.on("typing", (room, user) => {
      socket.in(room._id).emit("typing", user);
    });

    socket.on("stop typing", (room, user) => {
      socket.in(room._id).emit("stop typing", user);
    });

    socket.on("new message", (room, message) => {
      // room.members => an array of user ids
      room.members.forEach((member) => {
        if (member.toString() === message.sender.toString()) return;
        socket.in(member).emit("message received", message);
      });
    });
  });
};

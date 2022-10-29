const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  room: {
    type: Object,
    ref: "Room",
    required: true,
  },
  file: {
    displayName: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  date: {
    type: String,
    required: true,
    default: new Date(),
  },
  expiresAt: {
    type: String,
    required: true,
  },
  // submissions: [
  //   {
  //     from: {
  //       type: Object,
  //       ref: "users",
  //       required: true,
  //     },
  //     fileUrl: {
  //       type: String,
  //     },
  //     date: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = { Assignment };

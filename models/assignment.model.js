const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  room: {
    type: Object,
    ref: "Room",
  },
  fileUrl: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: String,
    required: true,
  },
  submissions: [
    {
      from: {
        type: Object,
        ref: "users",
        required: true,
      },
      fileUrl: {
        type: String,
      },
      date: {
        type: String,
        required: true,
      },
    },
  ],
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = { Assignment };

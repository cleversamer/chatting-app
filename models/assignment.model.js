const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  room: {
    type: Object,
    ref: "Room",
  },
  fileUrl: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: String,
    required: true,
  },
  submissions: {
    type: Array,
  },
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = { Assignment };

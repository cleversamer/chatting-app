const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["message", "assignment"],
      default: "message",
    },
    assignmentId: {
      type: Object,
      ref: "assignments",
    },
    from: {
      type: Object,
      ref: "User",
    },
    to: {
      type: Object,
      ref: "Room",
    },
    text: {
      type: String,
      trim: true,
      default: "",
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
    },
  },
  { minimize: false }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };

const mongoose = require("mongoose");

const MESSAGE_TYPES = ["text", "audio", "file"];

const CLIENT_SCHEMA = [
  "_id",
  "type",
  "sender",
  "receiver",
  "text",
  "file",
  "date",
];

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "text",
      required: true,
    },
    sender: {
      type: Object,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Object,
      ref: "Room",
      required: true,
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
      required: true,
      default: new Date(),
    },
  },
  { minimize: false }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = {
  Message,
  MESSAGE_TYPES,
  CLIENT_SCHEMA,
};

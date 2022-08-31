const mongoose = require("mongoose");

const clientSchema = [
  "_id",
  "name",
  "author",
  "pinnedMessages",
  "messages",
  "members",
  "assignments",
  "chatDisabled",
  "status",
];

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    author: {
      type: Object,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
    },
    pinnedMessages: {
      type: Array,
    },
    messages: {
      type: Array,
    },
    members: {
      type: Array,
    },
    assignments: {
      type: Array,
    },
    chatDisabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["private", "public"],
      default: "public",
    },
  },
  { minimize: false }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room, clientSchema };

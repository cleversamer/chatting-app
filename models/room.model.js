const mongoose = require("mongoose");

const clientSchema = [
  "_id",
  "name",
  "author",
  "pinnedMessages",
  "members",
  "chatDisabled",
  "status",
  "assignments",
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
    // assignments: {
    //   type: Array,
    // },
    pinnedMessages: {
      type: Array,
    },
    members: {
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

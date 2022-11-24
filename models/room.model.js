const mongoose = require("mongoose");

const clientSchema = [
  "_id",
  "name",
  "author",
  "pinnedMessages",
  "members",
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
      trim: true,
    },
    pinnedMessages: {
      type: Array,
      default: [],
    },
    members: {
      type: Array,
      default: [],
    },
    blockList: {
      type: Array,
      default: [],
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

roomSchema.index({ name: "text" });

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room, clientSchema };

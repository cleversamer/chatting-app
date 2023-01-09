const mongoose = require("mongoose");

// Name of fields that will be sent back to the client
const clientSchema = [
  "_id",
  "name",
  "showName",
  "author",
  "pinnedMessages",
  "members",
  "chatDisabled",
  "status",
  "blockList",
];

// Creating the schema of the room document
const roomSchema = new mongoose.Schema(
  {
    // Name of the room (unique)
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Marks room's name as visible
    showName: {
      type: Boolean,
      default: true,
    },
    // Reference to room's author/owner (a user id)
    author: {
      type: Object,
      ref: "User",
      required: true,
    },
    // Secret join code (in case of a private room)
    code: {
      type: String,
      trim: true,
    },
    // An ordered list of references to messages marked as pinned (descending order)
    pinnedMessages: {
      type: Array,
      default: [],
    },
    // An ordered list of references to member users (descending order)
    members: {
      type: Array,
      default: [],
    },
    // Marks sending messages as disabled for members
    chatDisabled: {
      type: Boolean,
      default: false,
    },
    // Includes references to blocked users
    blockList: {
      type: Array,
      default: [],
    },
    // Status of the room (public or private)
    status: {
      type: String,
      required: true,
      enum: ["private", "public"],
      default: "public",
    },
  },
  { minimize: false }
);

// Creating a text index based on `name` field
roomSchema.index({ name: "text" });

roomSchema.index({ author: -1 });

// Creating room model
const Room = mongoose.model("Room", roomSchema);

// Export model data
module.exports = { Room, clientSchema };

const mongoose = require("mongoose");

// An enum of message types
const MESSAGE_TYPES = ["text", "audio", "file", "image", "video"];

// Name of fields that will be sent back to the client
const CLIENT_SCHEMA = [
  "_id",
  "type",
  "repliedMessageId",
  "isReply",
  "isPinned",
  "sender",
  "receiver",
  "text",
  "file",
  "date",
  "viewers",
];

// Creating the schema of the message document
const messageSchema = new mongoose.Schema(
  {
    // Type of the message as shown above in the enum
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "text",
      required: true,
    },
    // Replied message object
    repliedMessageId: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    // Marks message as reply message
    isReply: {
      type: Boolean,
      default: false,
    },
    // Marks message as pinned message
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Reference to the sender (a user id)
    sender: {
      type: Object,
      ref: "User",
      required: true,
    },
    // Reference to the receiver (a room id)
    receiver: {
      type: Object,
      ref: "Room",
      required: true,
    },
    // Text data of the message
    text: {
      type: String,
      trim: true,
      default: "",
    },
    // File data of the message
    file: {
      displayName: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    // Number of views for this message
    viewers: {
      type: Array,
      default: [],
    },
    // Message's creation date
    date: {
      type: String,
      required: true,
      default: new Date(),
    },
  },
  { minimize: false }
);

messageSchema.index({ receiver: -1 });

// Creating the message model
const Message = mongoose.model("Message", messageSchema);

// Export message model data
module.exports = {
  Message,
  MESSAGE_TYPES,
  CLIENT_SCHEMA,
};

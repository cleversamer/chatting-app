const mongoose = require("mongoose");

// An enum of message types
const MESSAGE_TYPES = ["text", "audio", "file", "image", "video", "poll"];

// Name of fields that will be sent back to the client
const CLIENT_SCHEMA = [
  "_id",
  "type",
  "repliedMessage",
  "isReply",
  "isPinned",
  "sender",
  "receiver",
  "text",
  "file",
  "options",
  "votes",
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
    repliedMessage: {
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
    // Options of the poll (in case of the type of this message is a poll)
    options: [
      {
        type: String,
        minLength: 1,
        maxLength: 256,
        required: true,
        trim: true,
      },
    ],
    // Array of voters
    votes: [
      {
        userId: {
          type: mongoose.Types.ObjectId,
          ref: "User",
          required: true,
        },
        optionIndex: {
          type: Number,
          required: true,
        },
      },
    ],
    // Array of users that have seen this message
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

messageSchema.methods.addVote = function (userId, optionIndex) {
  try {
    optionIndex = parseInt(optionIndex);
    if (typeof optionIndex !== "number") {
      return false;
    }

    if (optionIndex >= this.options.length || optionIndex < 0) {
      return false;
    }

    // Find the index of a prev vote for this user ID
    const userPrevVoteIndex = this.votes.findIndex(
      (v) => v.userId.toString() === userId.toString()
    );

    // Check if the user has a prev vote
    if (userPrevVoteIndex >= 0) {
      this.votes[userPrevVoteIndex].optionIndex = optionIndex;
    } else {
      this.votes.unshift({ userId, optionIndex });
    }

    return true;
  } catch (err) {
    return false;
  }
};

// Creating the message model
const Message = mongoose.model("Message", messageSchema);

// Export message model data
module.exports = {
  Message,
  MESSAGE_TYPES,
  CLIENT_SCHEMA,
};

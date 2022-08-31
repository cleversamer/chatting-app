const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    from: {
      type: Object,
    },
    to: {
      type: Object,
    },
    text: {
      type: String,
      minLength: 1,
      trim: true,
      required: true,
      default: null,
    },
    file: {
      type: String,
      minLength: 1,
      trim: true,
      required: true,
      default: null,
    },
    time: {
      type: String,
    },
    date: {
      type: String,
    },
  },
  { minimize: false }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };

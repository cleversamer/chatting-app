const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: Object,
    ref: "Assignment",
    required: true,
  },
  authorId: {
    type: Object,
    ref: "User",
    required: true,
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
    default: new Date(),
  },
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = { Submission };

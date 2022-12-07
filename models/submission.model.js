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
  files: {
    type: Array,
  },
  date: {
    type: String,
    default: new Date(),
  },
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = { Submission };

const mongoose = require("mongoose");

// Creating the schema of the submission document
const submissionSchema = new mongoose.Schema({
  // A reference to room
  roomId: {
    type: Object,
    ref: "Room",
    required: true,
  },
  // A reference to assignment
  assignmentId: {
    type: Object,
    ref: "Assignment",
    required: true,
  },
  // A reference to author (user)
  authorId: {
    type: Object,
    ref: "User",
    required: true,
  },
  // Array of files where each element is an object
  // that contains the displayName and path of the file.
  files: {
    type: Array,
  },
  // Creation date
  date: {
    type: String,
    default: new Date(),
  },
});

// Creating the submission model
const Submission = mongoose.model("Submission", submissionSchema);

// Export submission model data
module.exports = { Submission };

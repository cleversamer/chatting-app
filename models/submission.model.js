const mongoose = require("mongoose");

// Creating the schema of the submission document
const submissionSchema = new mongoose.Schema({
  // A reference to room
  roomId: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  // A reference to assignment
  assignmentId: {
    type: mongoose.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  // A reference to author (user)
  authorId: {
    type: mongoose.Types.ObjectId,
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

submissionSchema.index({ roomId: -1 });

submissionSchema.index({ assignmentId: -1 });

// Creating the submission model
const Submission = mongoose.model("Submission", submissionSchema);

// Export submission model data
module.exports = { Submission };

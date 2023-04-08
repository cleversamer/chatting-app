const mongoose = require("mongoose");

// Creating the schema of the assignment document
const assignmentSchema = new mongoose.Schema({
  // Title of the assignment
  title: {
    type: String,
    required: true,
  },
  // An id reference to the room
  room: {
    type: mongoose.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  // Number of submissions
  submissions: {
    type: Number,
    default: 0,
  },
  // Description file of the assignment
  file: {
    displayName: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  // Start date object came from the client side
  clientDate: {
    type: String,
    default: "",
  },
  // Start date object assigned when creating an instance
  // of this model.
  date: {
    type: String,
    required: true,
    default: new Date(),
  },
  // Expiry date of the assignment
  expiresAt: {
    type: String,
    required: true,
  },
});

// Static method:
// Calculates the difference between current date and some date
assignmentSchema.statics.getRemainingTime = function (endDate) {
  try {
    const secInMs = 1000;
    const minInMs = secInMs * 60;
    const hourInMs = minInMs * 60;
    const dayInMs = hourInMs * 24;

    // Calc difference in milliseconds
    let diffInMs = new Date(endDate) - new Date();

    if (diffInMs < 0) {
      return "time ended";
    }

    const times = [];

    // Calc days difference
    const diffInDays = Math.floor(diffInMs / dayInMs);
    diffInMs = diffInMs - diffInDays * dayInMs;
    times.push({ type: "days", diff: diffInDays });

    // Calc hours difference
    const diffInHours = Math.floor(diffInMs / hourInMs);
    diffInMs = diffInMs - diffInHours * hourInMs;
    times.push({ type: "hours", diff: diffInHours });

    // Calc minutes difference
    const diffInMins = Math.floor(diffInMs / minInMs);
    diffInMs = diffInMs - diffInMins * minInMs;
    times.push({ type: "mins", diff: diffInMins });

    // Calc minutes difference
    const diffInSecs = Math.floor(diffInMs / secInMs);
    diffInMs = diffInMs - diffInSecs * secInMs;
    times.push({ type: "secs", diff: diffInSecs });

    const result = [];
    for (let time of times) {
      if (result.length === 2) break;

      if (time.diff > 0) {
        result.push(`${time.diff} ${time.type}`);
      }
    }

    return result.join(" ");
  } catch (err) {
    return "time ended";
  }
};

// Static method:
// Calculates the remaining time of this assignment
assignmentSchema.methods.getRemainingTime = function () {
  try {
    const secInMs = 1000;
    const minInMs = secInMs * 60;
    const hourInMs = minInMs * 60;
    const dayInMs = hourInMs * 24;

    // Calc difference in milliseconds
    let diffInMs = new Date(this.expiresAt) - new Date();

    if (diffInMs < 0) {
      return "time ended";
    }

    const times = [];

    // Calc days difference
    const diffInDays = Math.floor(diffInMs / dayInMs);
    diffInMs = diffInMs - diffInDays * dayInMs;
    times.push({ type: "days", diff: diffInDays });

    // Calc hours difference
    const diffInHours = Math.floor(diffInMs / hourInMs);
    diffInMs = diffInMs - diffInHours * hourInMs;
    times.push({ type: "hours", diff: diffInHours });

    // Calc minutes difference
    const diffInMins = Math.floor(diffInMs / minInMs);
    diffInMs = diffInMs - diffInMins * minInMs;
    times.push({ type: "mins", diff: diffInMins });

    // Calc minutes difference
    const diffInSecs = Math.floor(diffInMs / secInMs);
    diffInMs = diffInMs - diffInSecs * secInMs;
    times.push({ type: "secs", diff: diffInSecs });

    const result = [];
    for (let time of times) {
      if (result.length === 2) break;

      if (time.diff > 0) {
        result.push(`${time.diff} ${time.type}`);
      }
    }

    return result.join(" ");
  } catch (err) {
    return "time ended";
  }
};

assignmentSchema.methods.isExpired = function () {
  return new Date(this.expiresAt) - new Date() <= 0;
};

assignmentSchema.index({ room: -1 });

// Creating the model
const Assignment = mongoose.model("Assignment", assignmentSchema);

// Exporting model data
module.exports = { Assignment };

const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  room: {
    type: Object,
    ref: "Room",
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
    required: true,
    default: new Date(),
  },
  expiresAt: {
    type: String,
    required: true,
  },
  // submissions: [
  //   {
  //     from: {
  //       type: Object,
  //       ref: "users",
  //       required: true,
  //     },
  //     fileUrl: {
  //       type: String,
  //     },
  //     date: {
  //       type: String,
  //       required: true,
  //     },
  //   },
  // ],
});

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

    // Calc days difference
    const diffInDays = Math.floor(diffInMs / dayInMs);
    diffInMs = diffInMs - diffInDays * dayInMs;

    // Calc hours difference
    const diffInHours = Math.floor(diffInMs / hourInMs);
    diffInMs = diffInMs - diffInHours * hourInMs;

    // Calc minutes difference
    const diffInMins = Math.floor(diffInMs / minInMs);
    diffInMs = diffInMs - diffInMins * minInMs;

    // Calc seconds difference
    const diffInSecs = Math.floor(diffInMs / secInMs);
    diffInMs = diffInMs - diffInSecs * secInMs;

    return `${diffInDays} days, ${diffInHours} hours, ${diffInMins} minutes, ${diffInSecs} seconds`;
  } catch (err) {
    return "time ended";
  }
};

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = { Assignment };

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
  submissions: {
    type: Number,
    default: 0,
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

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = { Assignment };

const { ApiError } = require("../../middleware/apiError");
const { Assignment } = require("../../models/assignment.model");
const { Submission } = require("../../models/submission.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("../room/rooms.service");
const mongoose = require("mongoose");

module.exports.createAssignment = async (
  user,
  title,
  roomId,
  minutes,
  file
) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is the room author
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    if (!file) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.assignments.noFile;
      throw new ApiError(statusCode, message);
    }

    // Calculate expiry date
    const currentTimeAsMs = Date.now();
    const adjustedTimeAsMs = currentTimeAsMs + parseInt(minutes * 60000);
    const expiryDate = new Date(adjustedTimeAsMs);

    // Storing file locally
    const _file = await localStorage.storeFile(file, title);

    // Create assignment
    const assignment = new Assignment({
      title,
      room: room._id,
      file: {
        displayName: _file.name,
        url: _file.path,
      },
      expiresAt: expiryDate,
    });

    await assignment.save();

    return {
      ...assignment._doc,
      remainingTime: assignment.getRemainingTime(),
    };
  } catch (err) {
    throw err;
  }
};

module.exports.getRoomAssignments = async (roomId) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    let assignments = await Assignment.find({
      room: mongoose.Types.ObjectId(roomId),
    }).sort({ _id: -1 });

    assignments = assignments.map((item) => ({
      ...item._doc,
      remainingTime: item.getRemainingTime(),
      room: [room],
    }));

    return assignments;
  } catch (err) {
    throw err;
  }
};

module.exports.addSubmissionTime = async (
  user,
  roomId,
  assignmentId,
  hours
) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is the room author
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Calculate expiry date
    const oldExpiryDate = new Date(assignment.expiresAt);
    const newExpiryDate = new Date();
    newExpiryDate.setTime(
      oldExpiryDate.getTime() + parseInt(hours) * 60 * 60 * 1000
    );

    assignment.expiresAt = newExpiryDate;

    await assignment.save();

    return {
      ...assignment._doc,
      remainingTime: assignment.getRemainingTime(),
    };
  } catch (err) {
    throw err;
  }
};

module.exports.createSubmission = async (
  user,
  roomId,
  assignmentId,
  file1,
  file2,
  file3
) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is a member in the room
    if (!room.members.includes(user._id.toString())) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    // Check if assignment expired
    const assignmentExpired = new Date(assignment.expiresAt) < new Date();
    if (assignmentExpired) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.expired;
      throw new ApiError(statusCode, message);
    }

    if (!file1 && !file2 && !file3) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.assignments.noSubmissionFiles;
      throw new ApiError(statusCode, message);
    }

    // TODO: Create submission
    const submission = new Submission({
      authorId: user._id,
      assignmentId: assignment._id,
    });

    if (file1) {
      const fileTitle = `1_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file1, fileTitle);
      submission.files.push({
        displayName: file.originalName,
        url: file.path,
      });
    }

    if (file2) {
      const fileTitle = `2_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file2, fileTitle);
      submission.files.push({
        displayName: file.originalName,
        url: file.path,
      });
    }

    if (file3) {
      const fileTitle = `3_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file3, fileTitle);
      submission.files.push({
        displayName: file.originalName,
        url: file.path,
      });
    }

    await submission.save();

    assignment.submissions = assignment.submissions + 1;
    await assignment.save();

    return submission;
  } catch (err) {
    throw err;
  }
};

module.exports.getAssignmentSubmissions = async (
  user,
  assignmentId,
  roomId
) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is the room author
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.notFound;
      throw new ApiError(statusCode, message);
    }

    // Fetch assignment submissions
    const submissions = await Submission.aggregate([
      {
        $match: {
          assignmentId: assignment._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          files: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
          },
        },
      },
    ]);

    return submissions;
  } catch (err) {
    throw err;
  }
};

module.exports.getMySubmissionStatus = async (user, assignmentId) => {
  try {
    const criteria = {
      authorId: user._id,
      assignmentId: mongoose.Types.ObjectId(assignmentId),
    };

    const userSubmission = await Submission.findOne(criteria);

    return !!userSubmission;
  } catch (err) {
    throw err;
  }
};

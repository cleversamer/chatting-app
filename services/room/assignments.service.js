const { ApiError } = require("../../middleware/apiError");
const { Assignment } = require("../../models/assignment.model");
const { Submission } = require("../../models/submission.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("../room/rooms.service");

module.exports.createAssignment = async (
  user,
  title,
  roomId,
  expiresAfterDays,
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
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + parseInt(expiresAfterDays));

    // Storing file locally
    const _file = await localStorage.storeFile(file, title);

    // Create assignment
    const assignment = new Assignment({
      title,
      room: roomId,
      file: {
        displayName: _file.name,
        url: _file.path,
      },
      expiresAt: expiryDate,
    });

    return await assignment.save();
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

    return await assignment.save();
  } catch (err) {
    throw err;
  }
};

module.exports.createSubmission = async (user, roomId, assignmentId, file) => {
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

    if (!file) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.assignments.noFile;
      throw new ApiError(statusCode, message);
    }

    const fileTitle = `${user.firstname}_${user.lastname}`;
    const _file = await localStorage.storeFile(file, fileTitle);

    // TODO: Create submission
    const submission = new Submission({
      authorId: user._id,
      assignmentId: assignment._id,
      file: {
        displayName: _file.originalName,
        url: _file.path,
      },
    });

    return await submission.save();
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
          file: 1,
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

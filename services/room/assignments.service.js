const { ApiError } = require("../../middleware/apiError");
const { Assignment } = require("../../models/assignment.model");
const { Submission } = require("../../models/submission.model");
const localStorage = require("../storage/localStorage.service");
const compressService = require("../storage/compress.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("../room/rooms.service");
const mongoose = require("mongoose");

// A service function that creates an assignment
module.exports.createAssignment = async (
  user,
  title,
  roomId,
  minutes,
  file,
  displayName,
  clientDate
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

    // Check if there is file
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
        displayName: displayName || _file.originalName,
        url: _file.path,
      },
      expiresAt: expiryDate,
      clientDate,
    });

    // Save assignment to the DB
    await assignment.save();

    // Return assignment data
    return {
      ...assignment._doc,
      remainingTime: assignment.getRemainingTime(),
    };
  } catch (err) {
    throw err;
  }
};

// A service function that finds an assignment doc by its id
module.exports.getAssignment = async (assignmentId) => {
  try {
    // Get assignment by id
    let result = await Assignment.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(assignmentId) } },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $project: {
          title: 1,
          file: 1,
          clientDate: 1,
          date: 1,
          submissions: 1,
          expiresAt: 1,
          room: {
            _id: 1,
            name: 1,
            status: 1,
            members: 1,
          },
        },
      },
    ]);

    // Map assignment and add the remaining time to it
    result = result.map((item) => ({
      ...item,
      remainingTime: Assignment.getRemainingTime(item.expiresAt),
    }));

    // Return the result
    // HTIN: the array has always one element
    return result[0];
  } catch (err) {
    throw err;
  }
};

// A service function that returns all assignment that
// belong to a room
module.exports.getRoomAssignments = async (roomId) => {
  try {
    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Fins assignments and sort them from latest to oldest
    let assignments = await Assignment.find({
      room: mongoose.Types.ObjectId(roomId),
    }).sort({ _id: -1 });

    // Map assignments
    assignments = assignments.map((item) => ({
      ...item._doc,
      remainingTime: item.getRemainingTime(),
      room: [room],
    }));

    // Return assignments
    return assignments;
  } catch (err) {
    throw err;
  }
};

// A service function that adds time to the submission time
// of an assignment
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

    // Update assignment's expiry date
    assignment.expiresAt = newExpiryDate;

    // Save the assignment to the DB
    await assignment.save();

    // Return assignment data with its remaining time
    return {
      ...assignment._doc,
      remainingTime: assignment.getRemainingTime(),
    };
  } catch (err) {
    throw err;
  }
};

// A service function that creates a new submissions
// for a user to an assignment
module.exports.createSubmission = async (
  user,
  roomId,
  assignmentId,
  file1,
  file2,
  file3,
  displayName1,
  displayName2,
  displayName3
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
    if (
      !room.members.includes(user._id.toString()) &&
      room.author.toString() !== user._id.toString()
    ) {
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

    // Check if there are no files added
    if (!file1 && !file2 && !file3) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.assignments.noSubmissionFiles;
      throw new ApiError(statusCode, message);
    }

    // Create submission instance
    const submission = new Submission({
      authorId: user._id,
      roomId: room._id,
      assignmentId: assignment._id,
    });

    // Check if there's file and add it
    if (file1) {
      const fileTitle = `1_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file1, fileTitle);
      submission.files.push({
        displayName: displayName1,
        url: file.path,
      });
    }

    // Check if there's file and add it
    if (file2) {
      const fileTitle = `2_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file2, fileTitle);
      submission.files.push({
        displayName: displayName2,
        url: file.path,
      });
    }

    // Check if there's file and add it
    if (file3) {
      const fileTitle = `3_${user.firstname}_${user.lastname}`;
      const file = await localStorage.storeFile(file3, fileTitle);
      submission.files.push({
        displayName: displayName3,
        url: file.path,
      });
    }

    // Save the assignment to the DB
    await submission.save();

    // Increment the number of submission in the assignment object
    assignment.submissions = assignment.submissions + 1;

    // Save assignemnt to the DB
    await assignment.save();

    // Return created submission
    return submission;
  } catch (err) {
    throw err;
  }
};

// A service function that returns all submissions
// that belong to an assignment
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

    // Return submissions array
    return submissions;
  } catch (err) {
    throw err;
  }
};

// A servie function that finds all submissions of an
// assignment, and compress all files in on ZIP file.
// FIXME: incomplete service function.
module.exports.downloadAssignmentSubmissions = async (
  user,
  assignmentId,
  roomId
) => {
  try {
    const assignment = await Assignment.findById(assignmentId);
    const room = await roomsService.findRoomById(roomId);

    // Find all assignment submissions
    const submissions = await this.getAssignmentSubmissions(
      user,
      assignmentId,
      roomId
    );

    // Add all submissions' files to a single array
    const files = [];
    submissions.forEach((item) => {
      const submissionFiles = item.files.map((file) => ({
        name: file.displayName,
        path: file.url,
      }));

      files.push(...submissionFiles);
    });

    // A name to be set to the ZIP file
    // HINT: a test name and should be changed
    const fileName = `${room.name}_${assignment.title}`;

    // Asking compression service to compress files and return
    // a ZIP file
    const zipFilePath = await compressService.compressFiles(fileName, files);

    // Return the compressed file
    return zipFilePath;
  } catch (err) {
    throw err;
  }
};

// A service function that checks if the user has added submission
// to an assignment or not.
module.exports.getMySubmissionStatus = async (user, assignmentId) => {
  try {
    // Mongoose query criteria
    const criteria = {
      authorId: user._id,
      assignmentId: mongoose.Types.ObjectId(assignmentId),
    };

    // Find user's submission to the specified assignment
    const userSubmission = await Submission.findOne(criteria);

    // Return boolean value
    return !!userSubmission;
  } catch (err) {
    throw err;
  }
};

const { Assignment } = require("../models/assignment.model");
const { roomsService } = require("../services");
const httpStatus = require("http-status");
const { ApiError } = require("../middleware/apiError");
const errors = require("../config/errors");
const fs = require("fs");
const crypto = require("crypto");

module.exports.createAssignment = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, file, date = new Date(), expiresAfterDays } = req.body;

    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    let fileUrl = "";
    if (file || file.base46) {
      const data = file.base64.split(",");
      const extension = data[0].split("/")[1].split(";")[0];
      const content = data[1];
      const readFile = Buffer.from(content, "base64");
      const diskName = crypto.randomUUID();
      fs.writeFileSync(`./uploads/${diskName}.${extension}`, readFile, "utf8");
      fileUrl = `/${diskName}.${extension}`;
    }

    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + parseInt(expiresAfterDays));
    const assignment = new Assignment({
      room: roomId,
      fileUrl,
      date,
      expiresAt: expiryDate,
    });

    const savedAssignment = await assignment.save();

    room.assignments.push(savedAssignment._id);
    await room.save();

    res.status(httpStatus.CREATED).json(savedAssignment);
  } catch (err) {
    next(err);
  }
};

module.exports.addSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId, file, date = new Date() } = req.body;

    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.notFound;
      throw new ApiError(statusCode, message);
    }

    if (!room.members.includes(user._id.toString())) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    const assignmentExpired = new Date(assignment.expiresAt) < new Date();
    if (assignmentExpired) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.expired;
      throw new ApiError(statusCode, message);
    }

    const index = assignment.submissions.findIndex(
      (s) => s.from.toString() === user._id.toString()
    );
    const hasSubmission = index !== -1;
    if (hasSubmission) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.assignments.hasSubmission;
      throw new ApiError(statusCode, message);
    }

    if (!file.base64) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.system.noFile;
      throw new ApiError(statusCode, message);
    }

    const data = file.base64.split(",");
    const extension = data[0].split("/")[1].split(";")[0];
    const content = data[1];
    const readFile = Buffer.from(content, "base64");
    const diskName = crypto.randomUUID();
    fs.writeFileSync(`./uploads/${diskName}.${extension}`, readFile, "utf8");
    const fileUrl = `/${diskName}.${extension}`;

    const newAssignment = await Assignment.updateOne(
      { _id: assignmentId },
      {
        $push: {
          submissions: {
            from: user._id,
            fileUrl,
            date,
          },
        },
      },
      { new: true }
    );

    res.status(httpStatus.CREATED).json(newAssignment);
  } catch (err) {
    next(err);
  }
};

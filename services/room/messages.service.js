const { ApiError } = require("../../middleware/apiError");
const { Message, MESSAGE_TYPES } = require("../../models/message.model");
const { clientSchema: userSchema } = require("../../models/user.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("./rooms.service");
const _ = require("lodash");

module.exports.createMessage = async (user, type, text, roomId, file) => {
  try {
    if (!MESSAGE_TYPES.includes(type)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidType;
      throw new ApiError(statusCode, message);
    }

    // Check if room exists
    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is a member in the room
    const notRoomMember =
      !room.members.includes(user._id.toString()) &&
      room.author.toString() !== user._id.toString();
    if (notRoomMember) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is blocked from sending messages
    if (room.blockList.includes(user._id.toString())) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.chatBlocked;
      throw new ApiError(statusCode, message);
    }

    // Check if the message does not contain text or file data
    const emptyMessage = !file && !text;
    if (emptyMessage) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidMessage;
      throw new ApiError(statusCode, message);
    }

    // Check if there's file in case of the message is not a text message
    if (type !== "text" && !file) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.noFile;
      throw new ApiError(statusCode, message);
    }

    // Store file in case it exists and message type is not text
    const mssgFile =
      type && type !== "text" && file ? await localStorage.storeFile(file) : {};

    // Create the message
    const message = new Message({
      text,
      file: {
        displayName: mssgFile.originalName,
        url: mssgFile.path,
      },
      receiver: room._id,
      sender: _.pick(user, userSchema),
      type,
    });

    return await message.save();
  } catch (err) {
    throw err;
  }
};

module.exports.getRoomMessages = async (roomId) => {
  try {
    return await Message.aggregate([
      { $match: { receiver: roomId } },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          text: 1,
          file: 1,
          date: 1,
          receiver: 1,
          sender: {
            _id: 1,
            avatarUrl: 1,
            email: 1,
            role: 1,
            firstname: 1,
            lastname: 1,
            nickname: 1,
            verified: 1,
          },
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

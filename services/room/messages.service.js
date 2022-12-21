const mongoose = require("mongoose");
const { ApiError } = require("../../middleware/apiError");
const { Message, MESSAGE_TYPES } = require("../../models/message.model");
const { Room } = require("../../models/room.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("./rooms.service");

module.exports.createMessage = async (
  user,
  type,
  text,
  roomId,
  file,
  displayName,
  date,
  isReply,
  repliedMessage,
  isPinned
) => {
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
    const fileTypes = ["audio", "file", "image", "video"];
    const isFile = type && fileTypes.includes(type) && file;
    const mssgFile = isFile ? await localStorage.storeFile(file) : {};

    // Create the message
    const message = new Message({
      text,
      file: {
        displayName,
        url: mssgFile.path,
      },
      receiver: room._id,
      sender: user._id,
      type,
      date,
      isReply: isReply && !isPinned,
      isPinned,
    });

    message.repliedMessage = isReply && !isPinned ? repliedMessage : null;

    return await message.save();
  } catch (err) {
    throw err;
  }
};

module.exports.getRoomMessages = async (roomId) => {
  try {
    return await Message.aggregate([
      {
        $match: {
          receiver: mongoose.Types.ObjectId(roomId),
          isPinned: false,
        },
      },
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
          repliedMessage: 1,
          isReply: 1,
          isPinned: 1,
          text: 1,
          file: 1,
          date: 1,
          receiver: 1,
          sender: {
            _id: 1,
            avatarUrl: 1,
            firstname: 1,
            lastname: 1,
            nickname: 1,
          },
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports.deleteMessage = async (user, messageId) => {
  try {
    messageId = mongoose.Types.ObjectId(messageId);

    if (!mongoose.isValidObjectId(messageId)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidId;
      throw new ApiError(statusCode, message);
    }

    const message = await Message.findById(messageId);
    if (!message) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.message.notFound;
      throw new ApiError(statusCode, message);
    }

    const room = await Room.findById(message.receiver);

    const isMssgAuthor = message.sender.toString() === user._id.toString();
    const isRoomAdmin = room.author.toString() === user._id.toString();
    const isAuthorized = isMssgAuthor || isRoomAdmin;

    if (!isAuthorized) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.message.notAuthor;
      throw new ApiError(statusCode, message);
    }

    return await Message.findByIdAndDelete(messageId);
  } catch (err) {
    throw err;
  }
};

const mongoose = require("mongoose");
const { ApiError } = require("../../middleware/apiError");
const { Message, MESSAGE_TYPES } = require("../../models/message.model");
const { Room } = require("../../models/room.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("./rooms.service");

// A service function that creates a new message
// document in the DB
module.exports.createMessage = async (
  user,
  type,
  text,
  roomId,
  file,
  fileName,
  date,
  isReply,
  repliedMessageId,
  isPinned
) => {
  try {
    // Check if message type is correct/valid
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
        displayName: fileName,
        url: mssgFile.path,
      },
      receiver: room._id,
      sender: user._id,
      type,
      date,
      isReply: isReply && !isPinned,
      isPinned,
    });

    // Add replied message in some conditions
    message.repliedMessageId = isReply && !isPinned ? repliedMessageId : null;

    // Return saved message
    return await message.save();
  } catch (err) {
    throw err;
  }
};

// A service function that returns all messages in a room
module.exports.getRoomMessages = async (roomId) => {
  try {
    // Find all messages for a room
    // Return messages
    return await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(roomId),
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
        $lookup: {
          from: "users",
          localField: "viewers",
          foreignField: "_id",
          as: "viewers",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          repliedMessageId: 1,
          isReply: 1,
          isPinned: 1,
          text: 1,
          file: 1,
          date: 1,
          receiver: 1,
          viewers: {
            _id: 1,
            firstname: 1,
            lastname: 1,
          },
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

// A service function that deletes a message
module.exports.deleteMessage = async (user, messageId) => {
  try {
    // Transform `messageId` arg to an MongoDB ObjectId type
    messageId = mongoose.Types.ObjectId(messageId);

    // Check if `messageId` arg is a valid ObjectId
    if (!mongoose.isValidObjectId(messageId)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidId;
      throw new ApiError(statusCode, message);
    }

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.message.notFound;
      throw new ApiError(statusCode, message);
    }

    // Find room that includes the message
    const room = await Room.findById(message.receiver);

    // Define conditions
    const isMssgAuthor = message.sender.toString() === user._id.toString();
    const isRoomAdmin = room.author.toString() === user._id.toString();
    const isAuthorized = isMssgAuthor || isRoomAdmin;

    // Check if user is authorized to do this action
    if (!isAuthorized) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.message.notAuthor;
      throw new ApiError(statusCode, message);
    }

    // Delete message and return it
    return await Message.findByIdAndDelete(messageId);
  } catch (err) {
    throw err;
  }
};

// A service function that deletes a message
module.exports.viewMessage = async (user, messageId) => {
  try {
    // Transform `messageId` arg to an MongoDB ObjectId type
    messageId = mongoose.Types.ObjectId(messageId);

    // Check if `messageId` arg is a valid ObjectId
    if (!mongoose.isValidObjectId(messageId)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidId;
      throw new ApiError(statusCode, message);
    }

    // Check if message exists
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { viewers: user._id } },
      { new: true }
    );
    if (!message) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.message.notFound;
      throw new ApiError(statusCode, message);
    }

    return message;
  } catch (err) {
    throw err;
  }
};

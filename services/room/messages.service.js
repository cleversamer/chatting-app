const mongoose = require("mongoose");
const { ApiError } = require("../../middleware/apiError");
const { Message, MESSAGE_TYPES } = require("../../models/message.model");
const { Room } = require("../../models/room.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("./rooms.service");

const createTextMessage = async (
  user,
  room,
  text,
  date,
  isReply,
  repliedMessageId,
  isPinned
) => {
  try {
    const isReplyMssg = isReply && mongoose.isValidObjectId(repliedMessageId);

    // Create the message
    const message = new Message({
      text,
      receiver: room._id,
      sender: user._id,
      type: "text",
      date,
      isReply: isReply && !isPinned,
      isPinned,
      repliedMessage: isReplyMssg ? repliedMessageId : null,
    });

    // Save message to the DB
    await message.save();

    // Check if this message is a reply message
    // and add the replied message object to it.
    if (isReplyMssg) {
      message.repliedMessage = await Message.findById(repliedMessageId);
    } else {
      message.repliedMessage = null;
    }

    return message;
  } catch (err) {
    throw err;
  }
};

const createFileMessage = async (
  user,
  type,
  text,
  room,
  file,
  fileName,
  date,
  isReply,
  repliedMessageId,
  isPinned
) => {
  try {
    const mssgFile = file ? await localStorage.storeFile(file) : {};
    const isReplyMssg = isReply && mongoose.isValidObjectId(repliedMessageId);

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
      repliedMessage: isReplyMssg ? repliedMessageId : null,
      isPinned,
    });

    // Return saved message
    await message.save();

    // Check if this message is a reply message
    // and add the replied message object to it.
    if (isReplyMssg) {
      message.repliedMessage = await Message.findById(repliedMessageId);
    } else {
      message.repliedMessage = null;
    }

    return message;
  } catch (err) {
    throw err;
  }
};

const createPollMessage = async (
  user,
  text,
  room,
  date,
  isReply,
  repliedMessageId,
  isPinned,
  options
) => {
  try {
    const isReplyMssg = isReply && mongoose.isValidObjectId(repliedMessageId);

    // Create the message
    const message = new Message({
      text,
      receiver: room._id,
      sender: user._id,
      type: "poll",
      date,
      isReply: isReply && !isPinned,
      repliedMessage: isReplyMssg ? repliedMessageId : null,
      isPinned,
      options,
    });

    // Return saved message
    await message.save();

    // Check if this message is a reply message
    // and add the replied message object to it.
    if (isReplyMssg) {
      message.repliedMessage = await Message.findById(repliedMessageId);
    } else {
      message.repliedMessage = null;
    }

    return message;
  } catch (err) {
    throw err;
  }
};

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
  isPinned,
  options
) => {
  try {
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

    // Check if message type is correct/valid
    if (!MESSAGE_TYPES.includes(type)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidType;
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
    if (["audio", "file", "image", "video"].includes(type) && !file) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.noFile;
      throw new ApiError(statusCode, message);
    }

    switch (type) {
      case "text":
        return await createTextMessage(
          user,
          room,
          text,
          date,
          isReply,
          repliedMessageId,
          isPinned
        );

      case "audio":
      case "file":
      case "image":
      case "video":
        return await createFileMessage(
          user,
          type,
          text,
          room,
          file,
          fileName,
          date,
          isReply,
          repliedMessageId,
          isPinned
        );

      case "poll":
        return await createPollMessage(
          user,
          text,
          room,
          date,
          isReply,
          repliedMessageId,
          isPinned,
          options
        );

      default:
        return null;
    }
  } catch (err) {
    throw err;
  }
};

module.exports.createVote = async (user, messageId, optionIndex) => {
  try {
    // Check if message ID is a valid document ID
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

    // Check if message is a poll
    if (message.type !== "poll") {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.notPoll;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is a member in the room
    const isMember = user.memberOf(message.receiver);
    if (!isMember) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    // Add vote to poll message
    const isAdded = message.addVote(user._id, optionIndex);
    if (!isAdded) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.internal;
      throw new ApiError(statusCode, message);
    }

    // Save message to the DB
    await message.save();

    return message;
  } catch (err) {
    throw err;
  }
};

// A service function that returns all messages in a room
module.exports.getRoomMessages = async (roomId) => {
  try {
    // Find all messages for a room
    // Return messages
    const messages = await Message.aggregate([
      {
        $match: {
          receiver: mongoose.Types.ObjectId(roomId),
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
        $lookup: {
          from: "messages",
          localField: "repliedMessage",
          foreignField: "_id",
          as: "repliedMessage",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "votes.userId",
          foreignField: "_id",
          as: "voters",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          isReply: 1,
          isPinned: 1,
          text: 1,
          file: 1,
          options: 1,
          date: 1,
          receiver: 1,
          votes: 1,
          voters: {
            _id: 1,
            firstname: 1,
            lastname: 1,
          },
          repliedMessage: {
            _id: 1,
            type: 1,
            text: 1,
            file: 1,
          },
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

    return messages.map((message) => {
      if (message.type !== "poll") {
        delete message.voters;
        return message;
      }

      message.votes.map((vote, index) => {
        delete vote.userId;
        vote.user = message.voters[index];
        return vote;
      });

      delete message.voters;
      return message;
    });
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

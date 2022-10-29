const { ApiError } = require("../../middleware/apiError");
const { Message } = require("../../models/message.model");
const { clientSchema: userSchema } = require("../../models/user.model");
const localStorage = require("../storage/localStorage.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const roomsService = require("./rooms.service");
const _ = require("lodash");

module.exports.findMessageById;

module.exports.createMessage = async (
  user,
  type,
  text,
  roomId,
  assignmentId,
  file
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

    // Check if the chat is disabled
    if (room.chatDisabled && user._id.toString() !== room.author.toString()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.chatDisabled;
      throw new ApiError(statusCode, message);
    }

    // Check if the message does not contain text or file data
    const emptyMessage = !file && !text;
    if (emptyMessage) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidMessage;
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
      receiver: roomId,
      sender: user._id,
      type,
      assignmentId,
    });

    const savedMssg = await message.save();

    savedMssg.sender = _.pick(user, userSchema);
    savedMssg.receiver = {
      _id: room._id,
      name: room.name,
    };

    return savedMssg;
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
          localField: "from",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $project: {
          _id: 1,
          from: 1,
          text: 1,
          date: 1,
          file: 1,
          assignmentId: 1,
          sender: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            role: 1,
          },
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

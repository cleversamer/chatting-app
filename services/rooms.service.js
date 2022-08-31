const { Room } = require("../models/room.model");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../config/errors");

module.exports.findRoomById = async (roomId) => {
  try {
    return await Room.findById(roomId);
  } catch (err) {
    throw err;
  }
};

module.exports.getAllPublicRooms = async () => {
  try {
    return await Room.find({ status: "public" });
  } catch (err) {
    throw err;
  }
};

module.exports.getSuggestedRooms = async () => {
  try {
    return await Room.aggregate([
      {
        $match: { status: "public" },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          author: 1,
          pinnedMessages: 1,
          messages: 1,
          members: 1,
          assignments: 1,
          chatDisabled: 1,
          status: 1,
          length: { $size: "$members" },
        },
      },
      { $sort: { length: -1 } },
      { $limit: 5 },
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports.createRoom = async (req) => {
  try {
    const user = req.user;
    const { name, status, code } = req.body;

    const privateRoomSchema = {
      name,
      author: user._id,
      status,
      code,
    };

    const publicRoomSchema = {
      name,
      author: user._id,
      status,
    };

    const invalidCode =
      status === "private" && (!code || code.length < 1 || code.length > 16);
    if (invalidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidCode;
      throw new ApiError(statusCode, message);
    }

    const room = new Room(
      status === "private" ? privateRoomSchema : publicRoomSchema
    );

    user.rooms.push(room._id);
    await user.save();

    return await room.save();
  } catch (err) {
    throw err;
  }
};

module.exports.toggleChatDisabled = async (req) => {
  try {
    const user = req.user;
    const roomId = req.params.id;

    const room = await this.findRoomById(roomId);
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

    room.chatDisabled = !room.chatDisabled;
    return await room.save();
  } catch (err) {
    throw err;
  }
};

module.exports.resetRoom = async (req) => {
  try {
    const user = req.user;
    const roomId = req.params.id;

    const room = await this.findRoomById(roomId);
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

    room.messages = [];
    room.members = [];
    room.assignments = [];

    return await room.save();
  } catch (err) {
    throw err;
  }
};

module.exports.addPinnedMessage = async (req) => {
  try {
    const user = req.user;
    const roomId = req.params.id;
    const { message } = req.body;

    const room = await this.findRoomById(roomId);
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

    // Check if message id exists...

    room.pinnedMessages.push(message);

    return await room.save();
  } catch (err) {
    throw err;
  }
};

module.exports.joinRoom = async (req) => {
  try {
    const user = req.user;
    const roomId = req.params.id;
    const { code } = req.body;

    const room = await this.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    const invalidCode =
      room.status === "private" &&
      (!code || code.length < 1 || code.length > 16);
    if (invalidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidCode;
      throw new ApiError(statusCode, message);
    }

    if (room.code !== code) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    if (room.author.toString() === user._id.toString()) {
      const statusCode = httpStatus.BAD_GATEWAY;
      const message = errors.rooms.alreadyJoined;
      throw new ApiError(statusCode, message);
    }

    if (user.rooms.includes(room._id)) {
      const statusCode = httpStatus.BAD_GATEWAY;
      const message = errors.rooms.alreadyJoined;
      throw new ApiError(statusCode, message);
    }

    room.members.push(user._id);

    user.rooms.push(room._id);
    await user.save();

    return await room.save();
  } catch (err) {
    throw err;
  }
};

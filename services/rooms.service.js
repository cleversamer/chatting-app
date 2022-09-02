const { Room } = require("../models/room.model");
const usersService = require("./users.service");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../config/errors");
const mongoose = require("mongoose");

module.exports.findRoomById = async (roomId) => {
  try {
    return await Room.findOne({ _id: roomId });
  } catch (err) {
    throw err;
  }
};

module.exports.getMappedRooms = async (roomIds = []) => {
  roomIds = roomIds.map((i) => mongoose.Types.ObjectId(i));

  try {
    return await Room.aggregate([
      { $match: { _id: { $in: roomIds } } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          status: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            role: 1,
          },
          members: {
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

module.exports.getAllPublicRooms = async () => {
  try {
    return await Room.aggregate([
      { $match: { status: "public" } },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          status: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            role: 1,
          },
          members: {
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
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          status: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            role: 1,
          },
          members: {
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

    const newRoom = await room.save();

    user.rooms.push(room._id);
    await user.save();

    const mappedRoom = await this.getMappedRooms([newRoom._id]);
    return mappedRoom[0];
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
    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
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

    await usersService.unjoinUsersFromRoom(room.members, roomId);

    room.pinnedMessages = [];
    room.members = [];
    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
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
    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
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

    if (room.status === "private" && room.code !== code) {
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
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.alreadyJoined;
      throw new ApiError(statusCode, message);
    }

    room.members.push(user._id);

    user.rooms.push(room._id);
    await user.save();

    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

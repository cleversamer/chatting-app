const { ApiError } = require("../../middleware/apiError");
const { Room } = require("../../models/room.model");
const { MESSAGE_TYPES } = require("../../models/message.model");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const messagesService = require("./messages.service");
const mongoose = require("mongoose");
const usersService = require("../user/users.service");

module.exports.getAllRooms = async () => {
  try {
    const rooms = await Room.aggregate([
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
          members: { $size: "$members" },
          status: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
          },
        },
      },
    ]);

    if (!rooms || !rooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRooms;
      throw new ApiError(statusCode, message);
    }

    return rooms;
  } catch (err) {
    throw err;
  }
};

module.exports.deleteRoom = async (roomId) => {
  try {
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    return room;
  } catch (err) {
    throw err;
  }
};

module.exports.findRoomById = async (roomId) => {
  try {
    roomId = new mongoose.Types.ObjectId(roomId);
    return await Room.findById(roomId);
  } catch (err) {
    throw err;
  }
};

module.exports.findRoomByName = async (name) => {
  try {
    return await Room.findOne({ name });
  } catch (err) {
    throw err;
  }
};

module.exports.searchRooms = async (name) => {
  try {
    return await Room.find(
      { $text: { $search: name } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
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
        $lookup: {
          from: "messages",
          localField: "pinnedMessages",
          foreignField: "_id",
          as: "pinnedMessages",
        },
      },
      {
        $lookup: {
          from: "assignments",
          localField: "assignments",
          foreignField: "_id",
          as: "assignments",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
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
          pinnedMessages: {
            _id: 1,
            text: 1,
            file: 1,
            date: 1,
          },
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports.getAllPublicRooms = async (skip) => {
  try {
    skip = parseInt(skip);

    return await Room.aggregate([
      { $match: { status: "public" } },
      { $skip: skip },
      { $limit: 10 },
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

// module.exports.getSuggestedRooms = async () => {
//   try {
//     return await Room.aggregate([
//       {
//         $match: { status: "public" },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           author: 1,
//           pinnedMessages: 1,
//           messages: 1,
//           members: 1,
//           assignments: 1,
//           chatDisabled: 1,
//           status: 1,
//           length: { $size: "$members" },
//         },
//       },
//       { $sort: { length: -1 } },
//       { $limit: 5 },
//       {
//         $lookup: {
//           from: "users",
//           localField: "members",
//           foreignField: "_id",
//           as: "members",
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "author",
//           foreignField: "_id",
//           as: "author",
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           name: 1,
//           pinnedMessages: 1,
//           messages: 1,
//           chatDisabled: 1,
//           status: 1,
//           author: {
//             _id: 1,
//             firstname: 1,
//             lastname: 1,
//             role: 1,
//           },
//           members: {
//             _id: 1,
//             firstname: 1,
//             lastname: 1,
//             role: 1,
//           },
//         },
//       },
//     ]);
//   } catch (err) {
//     throw err;
//   }
// };

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

module.exports.blockUsersFromChatting = async (req) => {
  try {
    const user = req.user;
    const { roomId, userIds } = req.body;

    // Check if room exists
    const room = await this.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is room's author
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Add users to blockList
    userIds.forEach((userId) => room.blockList.push(userId));
    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

module.exports.unblockUsersFromChatting = async (req) => {
  try {
    const user = req.user;
    const { roomId, userIds } = req.body;

    // Check if room exists
    const room = await this.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is room's author
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Remove users from blockList
    room.blockList = room.blockList.filter(
      (userId) => !userIds.includes(userId)
    );
    await room.save();

    const mappedRoom = await this.getMappedRooms([room._id]);
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

module.exports.resetRoom = async (user, roomId) => {
  try {
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
    const { type, roomId, text, date } = req.body;
    const file = req?.files?.file;

    if (!MESSAGE_TYPES.includes(type)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidType;
      throw new ApiError(statusCode, message);
    }

    if (!MESSAGE_TYPES.includes(type)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.message.invalidType;
      throw new ApiError(statusCode, message);
    }

    // Check if room exists
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

    const message = await messagesService.createMessage(
      user,
      type,
      text,
      roomId,
      file,
      date,
      false,
      null,
      true
    );

    room.pinnedMessages.push(message._id);
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
    const { name, code } = req.query;

    const room = await this.findRoomByName(name);
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

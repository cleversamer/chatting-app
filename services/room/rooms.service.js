const { ApiError } = require("../../middleware/apiError");
const { Room } = require("../../models/room.model");
const { Message } = require("../../models/message.model");
const { Assignment } = require("../../models/assignment.model");
const { Submission } = require("../../models/submission.model");
const { User } = require("../../models/user.model");
const { MESSAGE_TYPES } = require("../../models/message.model");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const messagesService = require("./messages.service");
const localStorage = require("../storage/localStorage.service");
const mongoose = require("mongoose");
const usersService = require("../user/users.service");

// A service function that returns all
// rooms in the system
module.exports.getAllRooms = async () => {
  try {
    const pinnedRooms = await Room.aggregate([
      { $match: { isPinned: true } },
      { $sort: { _id: -1 } },
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
          isPinned: 1,
          showName: 1,
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

    const rooms = await Room.aggregate([
      { $match: { isPinned: false } },
      { $sort: { _id: -1 } },
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
          isPinned: 1,
          showName: 1,
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

    const resultRooms = [...pinnedRooms, ...rooms];

    // Check if there are no rooms
    if (!resultRooms || !resultRooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRooms;
      throw new ApiError(statusCode, message);
    }

    // Return rooms
    return resultRooms;
  } catch (err) {
    throw err;
  }
};

// A service function that deletes a room by a given id
module.exports.deleteRoom = async (roomId, user) => {
  try {
    const room = await Room.findById(roomId);
    // Check if room does not exist and notify the client
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    const isAuthorized =
      room.author.toString() === user?._id?.toString() || user.role === "admin";
    if (!isAuthorized) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Delete room assets
    await this.deleteRoomAssets(roomId);

    // Delete room id from user's createdRooms array
    const author = await User.findById(room.author);
    author.createdRooms = author.createdRooms.filter(
      (roomId) => roomId.toString() !== room._id.toString()
    );
    await author.save();

    await Room.findByIdAndDelete(roomId);

    return room;
  } catch (err) {
    throw err;
  }
};

// A service function that finds room by a given id
module.exports.findRoomById = async (roomId) => {
  try {
    // Transform `roomId` arg to an ObjectId type
    roomId = new mongoose.Types.ObjectId(roomId);

    // Return room
    return await Room.findById(roomId);
  } catch (err) {
    throw err;
  }
};

// A service function that finds a room by name
// HINT: room's name is unique in the DB
module.exports.findRoomByName = async (name) => {
  try {
    // Find room with the given name
    // Return the room
    return await Room.findOne({ name });
  } catch (err) {
    throw err;
  }
};

// A service function that searches for rooms that matches
// the search term specified by the user.
//
// I have added a text index based on the `name` field in the room
// model to let MongoDB server makes an IXSCAN (Index scan).
module.exports.searchRooms = async (user, name) => {
  try {
    // Combine user's created and joined rooms in a single array
    const myRoomsIds = [...user.createdRooms, ...user.joinedRooms];

    // Finds user's rooms that matches the search term
    const myRooms = await Room.aggregate([
      { $match: { $text: { $search: name }, _id: { $in: myRoomsIds } } },
      { $sort: { score: { $meta: "textScore" } } },
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
          isPinned: 1,
          showName: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          blockList: 1,
          status: 1,
          members: 1,
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

    // Finds rooms that match the search term and it does not matter
    // if they belong to the user or not.
    let resultRooms = await Room.aggregate([
      { $match: { $text: { $search: name }, status: "public" } },
      { $sort: { score: { $meta: "textScore" } } },
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
          isPinned: 1,
          showName: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          blockList: 1,
          status: 1,
          members: 1,
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

    // Remove the rooms from the results array where user
    // has created them.
    resultRooms = resultRooms.filter(
      (room) => !user.createdRooms.includes(room._id)
    );

    // Returns search results
    return {
      myRooms,
      resultRooms,
    };
  } catch (err) {
    throw err;
  }
};

// A service function that returns the members of a room
module.exports.getRoomMembers = async (user, roomId) => {
  try {
    // Find room with the given room id
    const rooms = await this.getMappedRooms([roomId]);
    const room = rooms[0];

    // Check if room does not exist
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is a member of the room
    const isRoomMember = room.members
      .map((i) => i._id.toString())
      .includes(roomId);

    // Check if the user is the author/owner of the room
    const isRoomAuthor = room.author[0]._id.toString() === user._id.toString();

    // Check if the user is either a room member or a room author.
    const isAuthorized = isRoomMember || isRoomAuthor;

    // Check if the user is authorized to do this action
    if (!isAuthorized) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    // Returns room members
    return room.members;
  } catch (err) {
    throw err;
  }
};

// A service function that gets rooms with all their data
// HTIN: it uses join
module.exports.getMappedRooms = async (roomIds = []) => {
  // Map `roomIds` arg and transform all its elements
  // to valid MongoId objects
  roomIds = roomIds.map((i) => new mongoose.Types.ObjectId(i));

  try {
    // Returns any room that matches one of the given ids
    return await Room.aggregate([
      { $match: { _id: { $in: roomIds } } },
      { $sort: { _id: -1 } },
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
          isPinned: 1,
          showName: 1,
          messages: 1,
          chatDisabled: 1,
          status: 1,
          author: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            nickname: 1,
            role: 1,
          },
          members: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            nickname: 1,
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

// A service function that returns all public rooms in the system
// HTIN: is returns 10 docs at a time
// HINT: the client side can specify the number of docs
//       to be skipped in the collection.
module.exports.getAllPublicRooms = async (skip) => {
  try {
    // Transform `skip` arg to integer type
    skip = parseInt(skip);

    // Return 10 rooms in descending order
    return await Room.aggregate([
      { $match: { status: "public" } },
      { $skip: skip },
      { $sort: { _id: -1 } },
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
          isPinned: 1,
          showName: 1,
          pinnedMessages: 1,
          messages: 1,
          chatDisabled: 1,
          blockList: 1,
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

// A service function that creates a new room in the DB
module.exports.createRoom = async (req) => {
  try {
    const user = req.user;
    const { name, status, code } = req.body;

    // Check if user has 10 rooms (The maximun number of rooms
    // a user can create)
    if (user.createdRooms.length === 10) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.user.reachedMaximumRooms;
      throw new ApiError(statusCode, message);
    }

    // Create the schema of the private room
    const privateRoomSchema = {
      name,
      author: user._id,
      status,
      code,
    };

    // Create the schema of the public room
    const publicRoomSchema = {
      name,
      author: user._id,
      status,
    };

    // Check if code is valid in case of private room
    const invalidCode =
      status === "private" && (!code || code.length < 1 || code.length > 16);
    if (invalidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidCode;
      throw new ApiError(statusCode, message);
    }

    // Creates new room in the DB
    const room = new Room(
      status === "private" ? privateRoomSchema : publicRoomSchema
    );

    // Save the room to the DB
    const newRoom = await room.save();

    // Adds the room id to the start of user's created rooms
    user.createdRooms.unshift(room._id);

    // Save the user to the DB
    await user.save();

    // Get room
    const mappedRoom = await this.getMappedRooms([newRoom._id]);

    // Return room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that adds users to the block list
// of a room
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
    userIds.forEach((userId) => room.blockList.unshift(userId));
    await room.save();

    // Get room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return the room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that deletes users from the block list
// of a room
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

    // Save the room to the DB
    await room.save();

    // Get the room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return the room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that resets a room
module.exports.resetRoom = async (user, roomId) => {
  try {
    // Check if room exists
    const room = await this.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Delete room assets
    await this.deleteRoomAssets(room._id);

    // Get the room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return the room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that deletes all messages for a room
module.exports.deleteRoomMessages = async (user, roomId) => {
  try {
    // Check if room exists
    const room = await this.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if the user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Find all messages belong to the room
    const messages = await Message.find({ receiver: room._id });

    // Delete all messages and their files
    messages.forEach(async (message) => {
      if (message.file.url) {
        await localStorage.deleteFile(message.file.url);
      }

      await message.delete();
    });

    // Get the room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return the room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that adds a pinned message to the room
module.exports.addPinnedMessage = async (req) => {
  try {
    const user = req.user;
    const { type, roomId, text, date, displayName } = req.body;
    const file = req?.files?.file;

    // Check if message type is valid
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

    // Check if the user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.UNAUTHORIZED;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Asking messages services to create a pinned message
    const message = await messagesService.createMessage(
      user,
      type,
      text,
      roomId,
      file,
      displayName,
      date,
      false,
      null,
      true
    );

    // Add the pinned message id to the start of user's
    // pinnedMessages array
    room.pinnedMessages.unshift(message._id);

    // Save the room to the DB
    await room.save();

    // Get room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that joins a user to a room
module.exports.joinRoom = async (req) => {
  try {
    const user = req.user;
    const { name, code } = req.query;

    // Check if room exists
    const room = await this.findRoomByName(name);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if join code is valid
    const invalidCode =
      room.status === "private" &&
      (!code || code.length < 1 || code.length > 16);
    if (invalidCode) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    if (room.status === "private" && room.code !== code) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.incorrectCode;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() === user._id.toString()) {
      const statusCode = httpStatus.BAD_GATEWAY;
      const message = errors.rooms.alreadyJoined;
      throw new ApiError(statusCode, message);
    }

    // Check if user is already a member of the room
    const isAlreadyJoined =
      user.joinedRooms.includes(room._id.toString()) &&
      room.members.includes(user._id.toString());
    if (isAlreadyJoined) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.alreadyJoined;
      throw new ApiError(statusCode, message);
    }

    // Add user as a member to the room
    room.members.unshift(user._id);

    // Add room as a joined room to the user
    user.joinedRooms.unshift(room._id);

    // Save the user to the DB
    await user.save();

    // Save the room to the DB
    await room.save();

    // Get the room
    const mappedRoom = await this.getMappedRooms([room._id]);

    // Return the room
    return mappedRoom[0];
  } catch (err) {
    throw err;
  }
};

// A service function that deletes a group of members
module.exports.deleteMembers = async (user, roomId, members) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Deletes group of memebrs
    room.members = room.members.filter(
      (roomId) => !members.includes(roomId.toString())
    );

    // Unjoin users from the room
    await usersService.unjoinUsersFromRoom(members, roomId);

    // Save the room to the DB
    // Return the room
    return await room.save();
  } catch (err) {
    throw err;
  }
};

// A service function that marks room's name as visible/invisible
module.exports.toggleShowName = async (user, roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Update room's visibility
    room.showName = !room.showName;

    // Save the room to the DB
    // Return the room
    return await room.save();
  } catch (err) {
    throw err;
  }
};

// A service function that marks room chatting as enables/disables
// for room members
module.exports.toggleChatDisabled = async (roomId, user) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Update room chatting status
    room.chatDisabled = !room.chatDisabled;

    // Save the room to the DB
    // Return the room
    return await room.save();
  } catch (err) {
    throw err;
  }
};

// A service function that marks room chatting as enables/disables
// for room members
module.exports.changeRoomName = async (roomId, user, name) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Change room name
    room.name = name;

    // Save the room to the DB
    await room.save();

    return room;
  } catch (err) {
    throw err;
  }
};

module.exports.deleteRoomAssets = async (roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Unjoin all memebers from this room
    await usersService.unjoinUsersFromRoom([...room.members], roomId);

    // Delete room members
    room.members = [];

    // Find room's messages
    const messages = await Message.find({ receiver: room._id });

    messages.forEach(async (message) => {
      const filePath = message?.file?.url;
      if (filePath) {
        await localStorage.deleteFile(filePath);
      }
    });

    // Delete any message belongs to the room
    await Message.deleteMany({ receiver: room._id });

    // Delete pinned messages
    room.pinnedMessages = [];

    // Save room to the DB
    await room.save();

    // Find room's assignments
    const assignments = await Assignment.find({ room: room._id });

    assignments.forEach(async (assignment) => {
      // Delete assignment's file
      await localStorage.deleteFile(assignment.file.url);

      // Get assignment submissions
      const submissions = await Submission.find({
        assignmentId: assignment._id,
      });

      // Delete submissions' files
      submissions.forEach(async (submission) => {
        // Delete submission's files
        submission.files.forEach(async (file) => {
          await localStorage.deleteFile(file.url);
        });
      });
    });

    // Delete room's assignments
    await Assignment.deleteMany({ room: room._id });

    // Delete room's submissions
    await Submission.deleteMany({ roomId: room._id });
  } catch (err) {
    throw err;
  }
};

// A service function that marks room's name as visible/invisible
module.exports.switchRoomToPublic = async (user, roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Update room's visibility
    room.status = "public";

    // Save the room to the DB
    await room.save();

    return room;
  } catch (err) {
    throw err;
  }
};

// A service function that marks room's name as visible/invisible
module.exports.switchRoomToPrivate = async (user, roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Check if user is the author of the room
    if (room.author.toString() !== user._id.toString()) {
      const statusCode = httpStatus.FORBIDDEN;
      const message = errors.rooms.unauthorized;
      throw new ApiError(statusCode, message);
    }

    // Update room's visibility
    room.status = "private";

    // Save the room to the DB
    await room.save();

    return room;
  } catch (err) {
    throw err;
  }
};

// A service function that marks room's name as visible/invisible
module.exports.pinRoom = async (roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Update room's visibility
    room.isPinned = true;

    // Save the room to the DB
    await room.save();

    return room;
  } catch (err) {
    throw err;
  }
};

// A service function that marks room's name as visible/invisible
module.exports.unpinRoom = async (roomId) => {
  try {
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    // Update room's visibility
    room.isPinned = false;

    // Save the room to the DB
    await room.save();

    return room;
  } catch (err) {
    throw err;
  }
};

module.exports.searchRoomMembers = async (user, roomId, searchText) => {
  try {
    const members = await this.getRoomMembers(user, roomId);

    if (!searchText) {
      return members;
    }

    return members.filter(
      (member) =>
        member.firstname.includes(searchText) ||
        member.lastname.includes(searchText)
    );
  } catch (err) {
    throw err;
  }
};

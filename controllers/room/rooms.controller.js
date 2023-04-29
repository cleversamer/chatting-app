const { ApiError } = require("../../middleware/apiError");
const { roomsService, assignemntsService } = require("../../services");
const scheduleService = require("../../services/system/schedule.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const { clientSchema: userSchema } = require("../../models/user.model");
const _ = require("lodash");

// A controller function that returns all rooms inside
module.exports.getAllRooms = async (req, res, next) => {
  try {
    // Asking service to get all rooms
    const rooms = await roomsService.getAllRooms();

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that deletes a room and reutrns it
module.exports.deleteRoom = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    // Asking service to delete a room
    const room = await roomsService.deleteRoom(roomId, user);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns all rooms added to the DB
// HINT: there's pagination -> limit = 10 docs & skip count is given by the client
module.exports.getAllPublicRooms = async (req, res, next) => {
  try {
    const { skip } = req.query;

    // Asking service to get 10 public rooms after skipping
    // the specified numner of docs.
    const rooms = await roomsService.getAllPublicRooms(skip);

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A function that resets the room and returns it
// * Reset room includes:
// 1. Delete all members
// 2. Delete all messages (including pinned messages)
// 3. Delete all assignments
// 4. Delete submissions of each assignment
module.exports.resetRoom = async (req, res, next) => {
  try {
    const user = req.user;
    const roomId = req.params.id;

    // Asking service to reset a room
    const data = await roomsService.resetRoom(user, roomId);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(data);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller functions that deletes all messages in a given room
module.exports.deleteRoomMessages = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    // Asking service to delete all messages for the given room
    const data = await roomsService.deleteRoomMessages(user, roomId);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(data);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that creates a new room in the DB
module.exports.createRoom = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to create a new room
    const room = await roomsService.createRoom(req);

    // Shceduling an event to run after 135 days
    // This event is all about resetting this room
    const runDate1 = new Date();
    runDate1.setMinutes(runDate1.getMinutes() + 60 * 24 * 135);
    scheduleService.scheduleEvent(runDate1, async () => {
      try {
        await roomsService.deleteRoom(room._id, { role: "admin" });
      } catch (err) {}
    });

    // Shceduling an event to run after 134 days
    // This event is all about notifying room's owner that
    // the room will be reseted after 24 hours.
    const runDate2 = new Date();
    runDate2.setMinutes(runDate2.getMinutes() + 60 * 24 * 134);
    scheduleService.scheduleEvent(runDate2, async () => {
      try {
        const title = "سيتم إعادة تعيين الغرفة خلال 7 أيام";
        user.addNotification(title, null, null, runDate2);
        await user.save();
      } catch (err) {}
    });

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    // If the error code is equal to `duplicateIndexKey` error code
    // then it means that the name of the room is already used.
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.alreadyExist;
      err = new ApiError(statusCode, message);
    }

    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that blocks some users from sending
// messages in the room
module.exports.blockUsersFromChatting = async (req, res, next) => {
  try {
    // Asking service to block users from chatting
    const room = await roomsService.blockUsersFromChatting(req);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that unblocks some users from sending
// messages in the room
module.exports.unblockUsersFromChatting = async (req, res, next) => {
  try {
    // Asking service to unblock users from chatting
    const room = await roomsService.unblockUsersFromChatting(req);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function for creating a new pinned message
// to the given room
module.exports.addPinnedMessage = async (req, res, next) => {
  try {
    // Asking service to create a new message for some room
    // and mark it as a pinned message
    const room = await roomsService.addPinnedMessage(req);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that joins a user to the given room
module.exports.joinRoom = async (req, res, next) => {
  try {
    // Asking service to add the user as a member to
    // the given room.
    const room = await roomsService.joinRoom(req);

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that looks for rooms related to the
// search term speficied by the user.
module.exports.searchRooms = async (req, res, next) => {
  try {
    const user = req.user;
    const { name } = req.query;
    const result = await roomsService.searchRooms(user, name);

    // Check if there're no rooms match the search term
    if (!result.myRooms.length && !result.resultRooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRoomsMatch;
      throw new ApiError(statusCode, message);
    }

    // Send the data back to the client.
    res.status(httpStatus.OK).json(result);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns all users that are
// memebers in the given room
module.exports.getRoomMembers = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.params;

    // Asking service to return room's members
    const members = await roomsService.getRoomMembers(user, roomId);

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ members });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that deletes members from a room
module.exports.deleteMembers = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, members } = req.body;

    // Asking service to delete some members in a room
    const room = await roomsService.deleteMembers(user, roomId, members);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that marks room as visible/invisible
module.exports.toggleShowName = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    // Asking service to mark room as visible/invisible
    const room = await roomsService.toggleShowName(user, roomId);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that marks room chatting as enabled/disabled
module.exports.toggleChatDisabled = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    // Asking service to mark room chatting as enabled/disabled
    const room = await roomsService.toggleChatDisabled(roomId, user);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that marks room chatting as enabled/disabled
module.exports.changeRoomName = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, name } = req.body;

    // Asking service to mark room chatting as enabled/disabled
    const room = await roomsService.changeRoomName(roomId, user, name);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

module.exports.getRoomActiveAssignments = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const assignments = await assignemntsService.getRoomsActiveAssignments([
      roomId,
    ]);

    res.status(httpStatus.OK).json({ assignments });
  } catch (err) {
    next(err);
  }
};

module.exports.switchRoomToPublic = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    const room = await roomsService.switchRoomToPublic(user, roomId);

    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.switchRoomToPrivate = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    const room = await roomsService.switchRoomToPrivate(user, roomId);

    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.pinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;

    const room = await roomsService.pinRoom(roomId);

    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.unpinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;

    const room = await roomsService.unpinRoom(roomId);

    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.searchRoomMembers = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, searchText } = req.body;

    const members = await roomsService.searchRoomMembers(
      user,
      roomId,
      searchText
    );

    res
      .status(httpStatus.OK)
      .json({ members: members.map((member) => _.pick(member, userSchema)) });
  } catch (err) {
    next(err);
  }
};

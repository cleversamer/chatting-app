const { clientSchema } = require("../../models/room.model");
const { ApiError } = require("../../middleware/apiError");
const { roomsService } = require("../../services");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const _ = require("lodash");

module.exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await roomsService.getAllRooms();
    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    const room = await roomsService.deleteRoom(roomId);
    res.status(httpStatus.OK).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.getAllPublicRooms = async (req, res, next) => {
  try {
    const { skip } = req.query;
    const rooms = await roomsService.getAllPublicRooms(skip);

    // if (!rooms || !rooms.length) {
    //   const statusCode = httpStatus.NOT_FOUND;
    //   const message = errors.rooms.noRooms;
    //   throw new ApiError(statusCode, message);
    // }

    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    next(err);
  }
};

module.exports.resetRoom = async (req, res, next) => {
  try {
    const user = req.user;
    const roomId = req.params.id;

    const data = await roomsService.resetRoom(user, roomId);

    res.status(httpStatus.CREATED).json(data);
  } catch (err) {
    next(err);
  }
};

// module.exports.getSuggestedRooms = async (req, res, next) => {
//   try {
//     const rooms = await roomsService.getSuggestedRooms();
//     if (!rooms || !rooms.length) {
//       const statusCode = httpStatus.NOT_FOUND;
//       const message = errors.rooms.noRooms;
//       throw new ApiError(statusCode, message);
//     }

//     res.status(httpStatus.OK).json({ rooms });
//   } catch (err) {
//     next(err);
//   }
// };

module.exports.createRoom = async (req, res, next) => {
  try {
    const room = await roomsService.createRoom(req);
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.alreadyExist;
      err = new ApiError(statusCode, message);
    }

    next(err);
  }
};

module.exports.blockUsersFromChatting = async (req, res, next) => {
  try {
    const room = await roomsService.blockUsersFromChatting(req);
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.unblockUsersFromChatting = async (req, res, next) => {
  try {
    const room = await roomsService.unblockUsersFromChatting(req);
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.addPinnedMessage = async (req, res, next) => {
  try {
    const room = await roomsService.addPinnedMessage(req);
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.joinRoom = async (req, res, next) => {
  try {
    const room = await roomsService.joinRoom(req);
    res.status(httpStatus.CREATED).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.searchRooms = async (req, res, next) => {
  try {
    const { name } = req.query;
    const rooms = await roomsService.searchRooms(name);

    if (!rooms || !rooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRoomsMatch;
      throw new ApiError(statusCode, message);
    }

    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteMembers = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, members } = req.body;

    const room = await roomsService.deleteMembers(user, roomId, members);

    res.status(httpStatus.OK).json(room);
  } catch (err) {
    next(err);
  }
};

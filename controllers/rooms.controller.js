const { roomsService } = require("../services");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const errors = require("../config/errors");

module.exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await roomsService.getAllRooms();
    res.status(httpStatus.OK).json(rooms);
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
    const rooms = await roomsService.getAllPublicRooms();
    if (!rooms || !rooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRooms;
      throw new ApiError(statusCode, message);
    }

    res.status(httpStatus.OK).json(rooms);
  } catch (err) {
    next(err);
  }
};

module.exports.resetRoom = async (req, res, next) => {
  try {
    const data = await roomsService.resetRoom(req);
    res.status(httpStatus.CREATED).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports.getSuggestedRooms = async (req, res, next) => {
  try {
    const rooms = await roomsService.getSuggestedRooms();
    if (!rooms || !rooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRooms;
      throw new ApiError(statusCode, message);
    }

    res.status(httpStatus.OK).json(rooms);
  } catch (err) {
    next(err);
  }
};

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

module.exports.toggleChatDisabled = async (req, res, next) => {
  try {
    const room = await roomsService.toggleChatDisabled(req);
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
      const message = errors.rooms.noRooms;
      throw new ApiError(statusCode, message);
    }

    res.status(httpStatus.OK).json(rooms);
  } catch (err) {
    next(err);
  }
};

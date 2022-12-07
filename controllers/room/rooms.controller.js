const { ApiError } = require("../../middleware/apiError");
const { roomsService } = require("../../services");
const scheduleService = require("../../services/system/schedule.service");
const notificationsService = require("../../services/user/notifications.service");
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

module.exports.deleteRoomMessages = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    const data = await roomsService.deleteRoomMessages(user, roomId);

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

    // Shceduling an event to run after 6 months
    const runDate1 = new Date();
    runDate1.setMinutes(runDate1.getMinutes() + 1);
    scheduleService.scheduleEvent(runDate1, async () => {
      try {
        await roomsService.resetRoom("admin", room._id);
      } catch (err) {
        // TODO: store the error in db
      }
    });

    // Shceduling an event to run after 6 months
    const runDate2 = new Date();
    runDate2.setSeconds(runDate2.getSeconds() + 30);
    scheduleService.scheduleEvent(runDate2, async () => {
      try {
        notificationsService.sendPushNotification(
          "غرفة test-1",
          "سيتم اعادة تعيين الغرفة خلال 24 ساعة",
          {},
          "cFdOP1dASfuUqFcCOkPCW0:APA91bE39yCjkac3cRH82iiDqeyB4QxxNPWL4x48trM41HXlLlAN28RlqBWbgPl-cOz_WJ1E6zFuBJ-yKLFIvVvhfj6Qrd1o5GEHo3_BkYkYRsYtVVHUxWIIMOWiv2sfHfkx4HDBjgjd"
        );
      } catch (err) {
        // TODO: store the error in db
      }
    });

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
    const user = req.user;
    const { name } = req.query;
    const result = await roomsService.searchRooms(user, name);

    if (!result.myRooms.length && !result.resultRooms.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.rooms.noRoomsMatch;
      throw new ApiError(statusCode, message);
    }

    res.status(httpStatus.OK).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getRoomMembers = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.params;

    const members = await roomsService.getRoomMembers(user, roomId);

    res.status(httpStatus.OK).json({ members });
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

module.exports.toggleShowName = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    const room = await roomsService.toggleShowName(user, roomId);

    res.status(httpStatus.OK).json(room);
  } catch (err) {
    next(err);
  }
};

module.exports.toggleChatDisabled = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId } = req.body;

    const room = await roomsService.toggleChatDisabled(roomId, user);

    res.status(httpStatus.OK).json(room);
  } catch (err) {
    next(err);
  }
};

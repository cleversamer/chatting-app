const { ApiError } = require("../../middleware/apiError");
const { User } = require("../../models/user.model");
const { Room } = require("../../models/room.model");
const { Assignment } = require("../../models/assignment.model");
const bcrypt = require("bcrypt");
const emailService = require("./email.service");
const roomsService = require("../room/rooms.service");
const notificationsService = require("./notifications.service");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const localStorage = require("../storage/localStorage.service");

module.exports.getAllUsers = async (user, role) => {
  try {
    return await User.aggregate([
      {
        $match: {
          _id: {
            $not: {
              $eq: user._id,
            },
          },
          role,
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          firstname: 1,
          lastname: 1,
          nickname: 1,
          role: 1,
          verified: 1,
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

module.exports.deleteUser = async (userId) => {
  try {
    if (!mongoose.isValidObjectId(userId)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.invalidMongoId;
      throw new ApiError(statusCode, message);
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.notFound;
      throw new ApiError(statusCode, message);
    }

    if (!user.createdRooms.length) {
      return user;
    }

    // Find user's rooms
    const rooms = await Room.find({ _id: { $in: user.createdRooms } });

    // Delete user's rooms and their data
    rooms.forEach(async (room) => {
      try {
        await roomsService.deleteRoom(room._id, { role: "admin" });
      } catch (err) {
        //
      }
    });

    // Delete user's avatar picture
    if (user.avatarUrl) {
      await localStorage.deleteFile(user.avatarUrl);
    }

    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    throw err;
  }
};

module.exports.validateToken = (token) => {
  try {
    return jwt.verify(token, process.env["JWT_PRIVATE_KEY"]);
  } catch (err) {
    throw err;
  }
};

module.exports.unjoinUsersFromRoom = async (userIds, roomId) => {
  try {
    const users = await User.find({ _id: { $in: userIds } });

    users.forEach(async (user) => {
      user.joinedRooms = user.joinedRooms.filter(
        (value) => value.toString() !== roomId.toString()
      );

      await user.save();
    });
  } catch (err) {
    throw err;
  }
};

module.exports.updateProfile = async (req) => {
  try {
    let user = req.user;
    const { firstname, lastname, email, password, nickname } = req.body;
    const avatar = req?.files?.avatar;

    if (
      !avatar &&
      !firstname &&
      !lastname &&
      !email &&
      !password &&
      !nickname
    ) {
      return user;
    }

    validateString(firstname, 1, 64, "invalidName");
    validateString(lastname, 1, 64, "invalidName");
    validateEmail(email, "invalidEmail");
    validateString(password, 8, 32, "invalidPassword");
    if (nickname) {
      validateString(nickname, 4, 32, "invalidNickname");
    }

    if (avatar) {
      // Delete old avatar
      if (user.avatarUrl) {
        await localStorage.deleteFile(user.avatarUrl);
      }

      const _file = await localStorage.storeFile(avatar);
      user.avatarUrl = _file.path;
    }

    if (firstname && user.firstname !== firstname) {
      user.firstname = firstname;
    }

    if (lastname && user.lastname !== lastname) {
      user.lastname = lastname;
    }

    user.nickname = nickname;

    if (password) {
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        user.password = hashed;
      }
    }

    if (email && user.email !== email) {
      user.email = email;
      user.verified = false;
    }

    const newUser = await user.save();

    if (email && user.email !== email) {
      await emailService.registerEmail(email, user);
    }

    return newUser;
  } catch (err) {
    throw err;
  }
};

const validateEmail = (email, err) => {
  const valid =
    !email ||
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  if (!valid) {
    throw new ApiError(httpStatus.BAD_REQUEST, errors.auth[err]);
  }

  return valid;
};

const validateString = (str, min, max, err) => {
  const valid =
    !str || (typeof str === "string" && str.length >= min && str.length <= max);

  if (!valid) {
    throw new ApiError(httpStatus.BAD_REQUEST, errors.auth[err]);
  }

  return valid;
};

module.exports.sendNotification = async (
  userIds,
  title,
  body,
  data,
  date,
  callback
) => {
  try {
    // Find users and map them to an array of device tokens.
    const users = await User.find({ _id: { $in: userIds } });
    const tokens = users.map((user) => {
      user.addNotification(title, body, data, date);
      user.save();

      return user.deviceToken;
    });

    notificationsService.sendPushNotification(
      title,
      body,
      data,
      tokens,
      callback
    );

    return true;
  } catch (err) {
    throw err;
  }
};

module.exports.getMyAssignments = async (user) => {
  try {
    let assignments = await Assignment.aggregate([
      { $match: { room: { $in: user.createdRooms } } },
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: "rooms",
          localField: "room",
          foreignField: "_id",
          as: "room",
        },
      },
      {
        $project: {
          title: 1,
          file: 1,
          clientDate: 1,
          date: 1,
          submissions: 1,
          expiresAt: 1,
          room: {
            _id: 1,
            name: 1,
            status: 1,
            members: 1,
          },
        },
      },
    ]);

    return assignments.map((item) => ({
      ...item,
      remainingTime: Assignment.getRemainingTime(item.expiresAt),
    }));
  } catch (err) {
    throw err;
  }
};

module.exports.searchTeachers = async (searchTerm) => {
  try {
    return await User.find({
      role: "teacher",
      $or: [
        { firstname: { $regex: RegExp(searchTerm, "i") } },
        { lastname: { $regex: RegExp(searchTerm, "i") } },
      ],
    });
  } catch (err) {
    throw err;
  }
};

module.exports.searchStudents = async (searchTerm) => {
  try {
    return await User.find({
      role: "student",
      $or: [
        { firstname: { $regex: RegExp(searchTerm, "i") } },
        { lastname: { $regex: RegExp(searchTerm, "i") } },
      ],
    });
  } catch (err) {
    throw err;
  }
};

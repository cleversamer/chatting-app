const mongoose = require("mongoose");
const { User } = require("../models/user.model");
const jwt = require("jsonwebtoken");

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
    await User.updateMany(
      { _id: { $in: userIds } },
      { $pull: { rooms: mongoose.Types.ObjectId(roomId) } },
      { new: true }
    );
  } catch (err) {
    throw err;
  }
};

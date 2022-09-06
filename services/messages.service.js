const { Message } = require("../models/message.model");
const roomsService = require("./rooms.service");
const errors = require("../config/errors");
const { ApiError } = require("../middleware/apiError");
const httpStatus = require("http-status");
const fs = require("fs");
const crypto = require("crypto");

module.exports.findMessageById;

module.exports.sendMessage = async (req) => {
  try {
    const user = req.user;
    let { type, text, date = new Date(), file, roomId } = req.body;

    text = text.trim();

    const room = await roomsService.findRoomById(roomId);
    if (!room) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.notFound;
      throw new ApiError(statusCode, message);
    }

    const notRoomMember =
      !room.members.includes(user._id.toString()) &&
      room.author.toString() !== user._id.toString();
    if (notRoomMember) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.notJoined;
      throw new ApiError(statusCode, message);
    }

    if (room.chatDisabled && user._id.toString() !== room.author.toString()) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.chatDisabled;
      throw new ApiError(statusCode, message);
    }

    const emptyMessage = !file.base46 && !text;
    if (emptyMessage) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.rooms.invalidMessage;
      throw new ApiError(statusCode, message);
    }

    let fileUrl = "";
    if (typeof file === "object" && Object.keys(file).length) {
      const content = file.base64.split(",")[1];
      const extension = file.ext;
      const readFile = Buffer.from(content, "base64");
      const diskName = crypto.randomUUID();
      fs.writeFileSync(`./uploads/${diskName}.${extension}`, readFile, "utf8");
      fileUrl = `/${diskName}.${extension}`;
    }

    const message = new Message({
      text,
      file: { displayName: file?.name, url: fileUrl },
      date,
      to: roomId,
      from: user._id,
      type,
    });

    return await message.save();
  } catch (err) {
    throw err;
  }
};

module.exports.getRoomMessages = async (roomId) => {
  try {
    return await Message.aggregate([
      { $match: { to: roomId } },
      {
        $lookup: {
          from: "users",
          localField: "from",
          foreignField: "_id",
          as: "sender",
        },
      },
      {
        $project: {
          _id: 1,
          from: 1,
          text: 1,
          date: 1,
          sender: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            role: 1,
          },
        },
      },
    ]);
  } catch (err) {}
};

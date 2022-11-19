const { CLIENT_SCHEMA } = require("../../models/message.model");
const { messagesService } = require("../../services");
const httpStatus = require("http-status");
const _ = require("lodash");

module.exports.createMessage = async (req, res, next) => {
  try {
    const user = req.user;
    let { type, text, roomId, date } = req.body;
    const file = req?.files?.file;

    const message = await messagesService.createMessage(
      user,
      type,
      text,
      roomId,
      file,
      date
    );

    res.status(httpStatus.OK).json(_.pick(message, CLIENT_SCHEMA));
  } catch (err) {
    next(err);
  }
};

module.exports.getRoomMessages = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const messages = await messagesService.getRoomMessages(roomId);
    res.status(httpStatus.OK).json({ messages });
  } catch (err) {
    next(err);
  }
};

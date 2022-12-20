const { CLIENT_SCHEMA } = require("../../models/message.model");
const { messagesService } = require("../../services");
const httpStatus = require("http-status");
const _ = require("lodash");

module.exports.createMessage = async (req, res, next) => {
  try {
    const user = req.user;
    let { type, text, roomId, date, isReply, repliedMessage, displayName } =
      req.body;
    const file = req?.files?.file;

    const message = await messagesService.createMessage(
      user,
      type,
      text,
      roomId,
      file,
      displayName,
      date,
      isReply,
      repliedMessage,
      false
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

module.exports.deleteMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { messageId } = req.body;

    const message = await messagesService.deleteMessage(user, messageId);

    res.status(httpStatus.OK).json(message);
  } catch (err) {
    next(err);
  }
};

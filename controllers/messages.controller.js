const { messagesService } = require("../services");
const httpStatus = require("http-status");

module.exports.sendMessage = async (req, res, next) => {
  try {
    const message = await messagesService.sendMessage(req);
    res.status(httpStatus.OK).json(message);
  } catch (err) {
    next(err);
  }
};

module.exports.getRoomMessages = async (req, res, next) => {
  try {
    const roomId = req.params.id;
    const messages = await messagesService.getRoomMessages(roomId);
    res.status(httpStatus.OK).json(messages);
  } catch (err) {
    next(err);
  }
};

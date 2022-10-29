const { messagesService } = require("../../services");
const httpStatus = require("http-status");

module.exports.createMessage = async (req, res, next) => {
  try {
    const user = req.user;
    let { type, text, roomId, assignmentId } = req.body;
    const file = req?.files?.file;

    const message = await messagesService.createMessage(
      user,
      type,
      text,
      roomId,
      assignmentId,
      file
    );

    res.status(httpStatus.OK).json(message);
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

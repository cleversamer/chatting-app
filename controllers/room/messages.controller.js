const { CLIENT_SCHEMA } = require("../../models/message.model");
const { messagesService } = require("../../services");
const localStorage = require("../../services/storage/localStorage.service");
const httpStatus = require("http-status");
const _ = require("lodash");

// A controller function for creating a new message in the DB
module.exports.createMessage = async (req, res, next) => {
  try {
    const user = req.user;
    let { type, text, roomId, date, isReply, repliedMessage, displayName } =
      req.body;
    const file = req?.files?.file;

    // Asking service to create a new message
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

    // Send the data back to the client.
    res.status(httpStatus.OK).json(_.pick(message, CLIENT_SCHEMA));
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns all messages that belong
// to the room with the specified id
module.exports.getRoomMessages = async (req, res, next) => {
  try {
    const roomId = req.params.id;

    // Asking service to get all messages that belong to the given room
    const messages = await messagesService.getRoomMessages(roomId);

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ messages });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that deletes a message
module.exports.deleteMessage = async (req, res, next) => {
  try {
    const user = req.user;
    const { messageId } = req.body;

    // Asking service to delete a message
    const message = await messagesService.deleteMessage(user, messageId);

    // Delete message file after 3 minutes
    if (message.file.url) {
      await localStorage.deleteFile(message.file.url);
    }

    // Send the data back to the client.
    res.status(httpStatus.OK).json(message);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

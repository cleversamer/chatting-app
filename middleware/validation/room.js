const { check, validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ApiError } = require("../apiError");
const errors = require("../../config/errors");

const handler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.array()[0].msg;
    const error = new ApiError(statusCode, message);
    return next(error);
  }

  next();
};

const createRoomValidator = [
  check("name")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage(errors.rooms.invalidName),

  check("status")
    .trim()
    .isIn(["public", "private"])
    .withMessage(errors.rooms.invalidStatus),

  handler,
];

module.exports = {
  createRoomValidator,
};

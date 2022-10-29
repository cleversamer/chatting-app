const { check, validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ApiError } = require("../apiError");
const { SUPPORTED_ROLES } = require("../../models/user.model");
const { auth: errors } = require("../../config/errors");

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

const loginValidator = [
  check("email").trim().isEmail().withMessage(errors.invalidEmail).bail(),

  check("password")
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage(errors.invalidPassword),

  handler,
];

const registerValidator = [
  ...loginValidator,

  check("firstname")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage(errors.invalidName),

  check("lastname")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage(errors.invalidName),

  check("role")
    .isIn(SUPPORTED_ROLES.filter((role) => role.toLowerCase() !== "admin"))
    .withMessage(errors.invalidRole),

  handler,
];

const resetPasswordValidator = [
  check("newPassword")
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage(errors.invalidPassword),

  handler,
];

const forgotPasswordValidator = [
  check("email").trim().isEmail().withMessage(errors.invalidEmail).bail(),

  check("newPassword")
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage(errors.invalidPassword),

  handler,
];

const emailValidator = [
  check("email").trim().isEmail().withMessage(errors.invalidEmail).bail(),
];

module.exports = {
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  emailValidator,
};

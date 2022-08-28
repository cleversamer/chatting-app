const { check, validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { ApiError } = require("../apiError");
const { auth: errors } = require("../../config/errors");

const registerValidator = [
  check("email").trim().isEmail().withMessage(errors.invalidEmail).bail(),

  check("password")
    .trim()
    .isLength({ min: 8, max: 32 })
    .withMessage(errors.invalidPassword),

  check("firstname")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage(errors.invalidName),

  check("lastname")
    .trim()
    .isLength({ min: 1, max: 64 })
    .withMessage(errors.invalidName),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(httpStatus.BAD_REQUEST, errors.array()[0].msg));
      //   return res.status(httpStatus.BAD_REQUEST).json({
      //     errors: errors.array(),
      //   });
    }

    next();
  },
];

module.exports = {
  registerValidator,
};

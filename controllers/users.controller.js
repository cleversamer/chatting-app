const httpStatus = require("http-status");
const { clientSchema } = require("../models/user.model");
const { emailService } = require("../services");
const { ApiError } = require("../middleware/apiError");
const errors = require("../config/errors");
const success = require("../config/success");
const _ = require("lodash");
const bcrypt = require("bcrypt");

module.exports.isAuth = async (req, res, next) => {
  try {
    res.status(httpStatus.OK).json(_.pick(req.user, clientSchema));
  } catch (err) {
    next(err);
  }
};

module.exports.verifyUser = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (user.verified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    if ((!code && code != 0) || code.toString().length !== 4) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.invalidCode;
      throw new ApiError(statusCode, message);
    }

    if (user.verificationCode.code == code) {
      const diff = new Date() - new Date(user.verificationCode.expiresAt);
      console.log(diff);
      const condition = diff < 10 * 60 * 1000;
      if (!condition) {
        const statusCode = httpStatus.BAD_REQUEST;
        const message = errors.auth.expiredCode;
        throw new ApiError(statusCode, message);
      }

      user.verifyEmail();
      await user.save();

      return res.status(httpStatus.OK).json(_.pick(user, clientSchema));
    }

    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.auth.incorrectCode;
    throw new ApiError(statusCode, message);
  } catch (err) {
    next(err);
  }
};

module.exports.resendVerificationCode = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.verified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    user.updateVerificationCode();
    await user.save();

    await emailService.registerEmail(user.email, user);

    res
      .status(httpStatus.OK)
      .json({ ok: true, message: success.auth.verificationCodeSent });
  } catch (err) {
    next(err);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = req.user;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;
    await user.save();

    res.status(httpStatus.CREATED).json(_.pick(req.user, clientSchema));
  } catch (err) {
    next(err);
  }
};

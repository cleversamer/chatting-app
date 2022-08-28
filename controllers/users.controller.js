const { usersService, emailService } = require("../services");
const httpStatus = require("http-status");
const { ApiError } = require("../middleware/apiError");
const bcrypt = require("bcrypt");
const errors = require("../config/errors");
const success = require("../config/success");

module.exports.verifyAccount = async (req, res, next) => {
  try {
    const token = usersService.validateToken(req.query.key);
    const user = await usersService.findUserById(token.sub);

    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    if (user.verified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    user.verified = true;
    await user.save();

    res.render("success");
  } catch (err) {
    next(err);
  }
};

module.exports.sendPasswordResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await usersService.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.notFound;
      throw new ApiError(statusCode, message);
    }

    await emailService.resetPassword(email, user);

    res
      .status(httpStatus.OK)
      .json({ status: "ok", mssg: success.auth.passwordResetEmailSent });
  } catch (err) {
    next(err);
  }
};

module.exports.getResetPasswordPage = async (req, res, next) => {
  try {
    const { key } = req.params;

    const token = usersService.validateToken(key);
    const user = await usersService.findUserById(token.sub);

    if (!user) {
      return res.render("error-reset-password");
    }

    res.render("reset-password");
  } catch (err) {
    res.render("error-reset-password");
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { password1, password2 } = req.body;

    if (password1 !== password2) {
      return res.render("error-reset-password");
    }

    if (password1.length < 8 || password1.length > 32) {
      return res.render("error-reset-password");
    }

    const token = usersService.validateToken(key);
    const user = await usersService.findUserById(token.sub);
    if (!user) {
      return res.render("error-reset-password");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password1, salt);
    user.password = hashed;
    await user.save();

    res.render("success");
  } catch (err) {
    res.render("error-reset-password");
  }
};

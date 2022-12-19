const _ = require("lodash");
const { ApiError } = require("../../middleware/apiError");
const { authService, emailService } = require("../../services");
const { clientSchema } = require("../../models/user.model");
const errors = require("../../config/errors");
const httpStatus = require("http-status");

module.exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstname,
      lastname,
      nickname,
      role,
      deviceToken,
    } = req.body;

    const user = await authService.createUser(
      email,
      password,
      firstname,
      lastname,
      nickname,
      role,
      deviceToken
    );

    const token = user.genAuthToken();

    await emailService.registerEmail(email, user);

    const body = {
      user: _.pick(user, clientSchema),
      token,
    };

    res.status(httpStatus.CREATED).json(body);
  } catch (err) {
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.emailUsed;
      err = new ApiError(statusCode, message);
    }

    next(err);
  }
};

module.exports.signin = async (req, res, next) => {
  try {
    const { email, password, deviceToken } = req.body;
    const user = await authService.signInWithEmailAndPassword(
      email,
      password,
      deviceToken
    );
    const token = user.genAuthToken();

    const body = {
      user: _.pick(user, clientSchema),
      token,
    };

    res.status(httpStatus.OK).json(body);
  } catch (err) {
    next(err);
  }
};

const _ = require("lodash");
const { ApiError } = require("../../middleware/apiError");
const { authService, emailService } = require("../../services");
const { clientSchema } = require("../../models/user.model");
const errors = require("../../config/errors");
const httpStatus = require("http-status");

// A controller function for creating a new user
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

    // Asking service to create a new user
    const user = await authService.createUser(
      email,
      password,
      firstname,
      lastname,
      nickname,
      role,
      deviceToken
    );

    // Generates authentication token for the user
    const token = user.genAuthToken();

    // Asking email service to send a mail to user's email
    await emailService.registerEmail(email, user);

    // Creating response body
    const body = {
      user: _.pick(user, clientSchema),
      token,
    };

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(body);
  } catch (err) {
    // If the error code is equal to `duplicateIndexKey` error code
    // then it means that the email is already used.
    if (err.code === errors.codes.duplicateIndexKey) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.emailUsed;
      err = new ApiError(statusCode, message);
    }

    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that finds a user in the DB
module.exports.signin = async (req, res, next) => {
  try {
    const { email, password, deviceToken } = req.body;

    // Asking service to find a user with the given email
    // and password.
    const user = await authService.signInWithEmailAndPassword(
      email,
      password,
      deviceToken
    );

    // Generates authentication token for the user
    const token = user.genAuthToken();

    // Creates the response body
    const body = {
      user: _.pick(user, clientSchema),
      token,
    };

    // Send the data back to the client.
    res.status(httpStatus.OK).json(body);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

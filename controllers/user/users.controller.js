const _ = require("lodash");
const { ApiError } = require("../../middleware/apiError");
const { User, clientSchema } = require("../../models/user.model");
const {
  emailService,
  usersService,
  roomsService,
  assignemntsService,
  excelService,
} = require("../../services");
const bcrypt = require("bcrypt");
const errors = require("../../config/errors");
const httpStatus = require("http-status");
const success = require("../../config/success");

module.exports.isAuth = async (req, res, next) => {
  try {
    // Creates the response object
    const response = _.pick(req.user, clientSchema);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that verifies user's email
module.exports.verifyUser = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = req.user;

    // Check if user's email is already verified
    if (user.verified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Check if verification code is valid
    if ((!code && code != 0) || code.toString().length !== 4) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.invalidCode;
      throw new ApiError(statusCode, message);
    }

    // Check if verification code is correct
    if (user.verificationCode.code == code) {
      // Check if verification code is expired
      const diff = new Date() - new Date(user.verificationCode.expiresAt);
      const condition = diff < 10 * 60 * 1000;
      if (!condition) {
        const statusCode = httpStatus.BAD_REQUEST;
        const message = errors.auth.expiredCode;
        throw new ApiError(statusCode, message);
      }

      // Verify user's email
      user.verifyEmail();

      // Save the user
      await user.save();

      // Send the verified user back to the client
      return res.status(httpStatus.OK).json(_.pick(user, clientSchema));
    }

    // Throws an error
    // Means that the verification code is incorrect
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.auth.incorrectCode;
    throw new ApiError(statusCode, message);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that resends user's email verification code
module.exports.resendVerificationCode = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user's email is already verified
    if (user.verified) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.user.alreadyVerified;
      throw new ApiError(statusCode, message);
    }

    // Update user's email verification code
    user.updateVerificationCode();

    // Save the user to the DB
    await user.save();

    // Asking email service to send a mail to user's email
    // that includes the new verification code
    await emailService.registerEmail(user.email, user);

    // Send data back to the client
    res
      .status(httpStatus.OK)
      .json({ ok: true, message: success.auth.verificationCodeSent });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that lets user to change their password
module.exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const user = req.user;

    // Generates a salt to hash the new password
    const salt = await bcrypt.genSalt(10);

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashed;

    // Save the user to the DB
    await user.save();

    // Send user data back to the client
    res.status(httpStatus.CREATED).json(_.pick(user, clientSchema));
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns user's rooms
// including the rooms they created and the rooms
// they joined.
module.exports.getUserRooms = async (req, res, next) => {
  try {
    const user = req.user;

    // Creating an array of user's rooms
    const roomIds = [...user.createdRooms, ...user.joinedRooms];

    // Asking rooms service to find documents with the given ids
    const rooms = await roomsService.getMappedRooms(roomIds);

    // Send the data back to the client
    res.status(httpStatus.OK).json({ rooms });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that sends a code to user's email
// to use it and reset their password.
module.exports.sendForgotPasswordCode = async (req, res, next) => {
  try {
    const { email } = req.query;

    // Check if user exists
    const user = await usersService.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Update user's reset password code
    user.generatePasswordResetCode();

    // Save the user to the DB
    const updatedUser = await user.save();

    // Asking email service to send a mail to user's email
    // that includes the code.
    await emailService.forgotPasswordEmail(email, updatedUser);

    // Send the data back to the client
    res
      .status(httpStatus.OK)
      .json({ ok: true, message: success.auth.passwordResetCodeSent });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that resets user's password
// using the code sent to theirt email
module.exports.handleForgotPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    // Check if user exists
    const user = await usersService.findUserByEmail(email);
    if (!user) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.auth.emailNotUsed;
      throw new ApiError(statusCode, message);
    }

    // Check if code is valid
    if ((!code && code != 0) || code.toString().length !== 4) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.auth.invalidCode;
      throw new ApiError(statusCode, message);
    }

    // Check if code is correct
    if (user.resetPasswordCode.code == code) {
      // Check if code is expired
      const diff = new Date() - new Date(user.resetPasswordCode.expiresAt);
      const condition = diff < 10 * 60 * 1000;
      if (!condition) {
        const statusCode = httpStatus.BAD_REQUEST;
        const message = errors.auth.expiredCode;
        throw new ApiError(statusCode, message);
      }

      // Generates a salt for password hashing
      const salt = await bcrypt.genSalt(10);

      // Hashes the new password
      const hashed = await bcrypt.hash(newPassword, salt);

      // Update user's password
      user.password = hashed;

      // Save the user to the DB
      await user.save();

      // Send new user back to the client
      return res.status(httpStatus.OK).json(_.pick(user, clientSchema));
    }

    // Throws an error
    // Means that the code is incorrect
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.auth.incorrectCode;
    throw new ApiError(statusCode, message);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that lets user update their profile data
module.exports.updateProfile = async (req, res, next) => {
  try {
    // Asking service to update user's profile
    const user = await usersService.updateProfile(req);

    // Send the updated user back to the client
    res.status(httpStatus.CREATED).json(_.pick(user, clientSchema));
  } catch (err) {
    // If the error code is equal to `duplicateIndexKey` error code
    // then it means that the email is already used.
    //
    // HINT:
    // This happend when the user tries to update their email
    // and MongoDB found a duplicate value.
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

// A controller function that finds all user in the system
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const user = req.user;
    let { role } = req.query;

    // Check if role is correct
    // If it's not, the default is `student`
    if (!["student", "teacher"].includes(role)) {
      // Set the default value to `student`
      role = "student";
    }

    // Asking service to find all users
    const users = await usersService.getAllUsers(user, role);

    // Check if there are no users
    if (!users || !users.length) {
      const statusCode = httpStatus.NOT_FOUND;
      const message = errors.user.noUsers;
      throw new ApiError(statusCode, message);
    }

    // Send the data back to the client
    res.status(httpStatus.OK).json({ users });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that deletes a user
module.exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Asking service to delete the user
    const deletedUser = await usersService.deleteUser(userId);

    // Send the data back to the client
    res.status(httpStatus.OK).json(deletedUser);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that deletes a user
module.exports.deleteMyAccount = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to delete the user
    const deletedUser = await usersService.deleteUser(user._id);

    // Send the data back to the client
    res.status(httpStatus.OK).json(deletedUser);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that find users with the given array of IDs
// and gets their device tokens, and finally send a notification
// to their devices.
module.exports.sendNotification = async (req, res, next) => {
  try {
    const {
      userIds = [],
      title = "",
      body = "",
      data = {},
      date = null,
    } = req.body;

    // Build the callback function to be executed when an error occurrs
    const callback = (err, response) => {
      if (err) {
        const statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        const message = errors.system.notification;
        const err = new ApiError(statusCode, message);
        return next(err);
      }

      // Sends the data back to the client
      res.status(httpStatus.OK).json(success.auth.notificationSent);
    };

    // Asking notifications service to send a notification
    // to the given users
    await usersService.sendNotification(
      userIds,
      title,
      body,
      data,
      date,
      callback
    );
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

module.exports.seeNotifications = async (req, res, next) => {
  try {
    const user = req.user;

    // Marks user's notifications as seen
    user.seeNotifications();

    // Save the user to the DB
    await user.save();

    // Creates the response body
    const response = {
      notifications: user.notifications,
    };

    // Send the data back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

module.exports.getMyAssignments = async (req, res, next) => {
  try {
    const user = req.user;

    // Asking service to get user's assignments
    const assignments = await usersService.getMyAssignments(user);

    // Send the data back to the client
    res.status(httpStatus.OK).json(assignments);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns user's assignments
module.exports.getMyActiveAssignments = async (req, res, next) => {
  try {
    const user = req.user;

    const assignments = await assignemntsService.getRoomsActiveAssignments(
      user.joinedRooms
    );

    // Send the data back to the client
    res.status(httpStatus.OK).json({ assignments });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

module.exports.exportUsersToExcel = async (req, res, next) => {
  try {
    const users = await User.find().sort({ _id: -1 });

    // Get the path to the excel file
    const filePath = await excelService.exportUsersToExcelFile(users);

    // Create the response object
    const response = {
      type: "file/xlsx",
      path: filePath,
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Name of fields that will be sent back to the client
const clientSchema = [
  "_id",
  "avatarUrl",
  "email",
  "role",
  "firstname",
  "lastname",
  "nickname",
  "createdRooms",
  "joinedRooms",
  "notifications",
  "verified",
];

// An enum of user roles
const SUPPORTED_ROLES = ["student", "teacher", "admin"];

// Creating the schema of the user document
const userSchema = new mongoose.Schema(
  {
    // Path of user's avatar url
    avatarUrl: {
      type: String,
      default: "",
    },
    // User's email
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // User's encrypted password
    password: {
      type: String,
      trim: true,
      required: true,
    },
    // User's role (on of the above enum)
    role: {
      type: String,
      enum: SUPPORTED_ROLES,
      default: "student",
    },
    // User's first name
    firstname: {
      type: String,
      trim: true,
      required: true,
    },
    // User's last name
    lastname: {
      type: String,
      trim: true,
      required: true,
    },
    // User's nickname
    // It shows up in the client app when it is not empty
    nickname: {
      type: String,
      default: "",
    },
    // Email verification code
    verificationCode: {
      type: Object,
    },
    // Marks user's email as verified
    verified: {
      type: Boolean,
      default: false,
    },
    // An ordered list of references to the rooms which
    // this user has created (descending order).
    createdRooms: {
      type: Array,
    },
    // An ordered list of references to the rooms which
    // this user has joined (descending order).
    joinedRooms: {
      type: Array,
    },
    // An ordered list of notifications received by the
    // user (descending order).
    notifications: {
      type: Array,
      default: [],
    },
    // User's device token
    // Should be updated when login/register
    deviceToken: {
      type: String,
      required: true,
    },
    // User's reset password code
    // used in forgot password api
    resetPasswordCode: {
      code: {
        type: String,
      },
      expiresAt: {
        type: String,
      },
      default: { code: "", expiresAt: "" },
    },
  },
  { minimize: false }
);

// Updating user's email verification code whenever
// user's doc gets updated in the database
// Reason: Security
userSchema.pre("save", function (next) {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.verificationCode = { code, expiresAt };

  next();
});

// Updates user's email verification code
userSchema.methods.updateVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.verificationCode = { code, expiresAt };
};

// Updates user's reset password code
userSchema.methods.generatePasswordResetCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.resetPasswordCode = { code, expiresAt };
};

// Marks user's email as verified
userSchema.methods.verifyEmail = function () {
  this.verified = true;
};

// Generates a bearer authentication token
userSchema.methods.genAuthToken = function () {
  const body = { sub: this._id.toHexString(), email: this.email };
  const token = jwt.sign(body, process.env["JWT_PRIVATE_KEY"], {
    expiresIn: "1d",
  });

  return token;
};

// Decode user's password which is encrypted and compares it
// to the given password.
// returns `true` of `false`
userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

// Adds a new notification to the start of user's notifications array.
userSchema.methods.addNotification = function (title, body, data, date) {
  const notification = { title, body, date, seen: false, data };

  if (this.notifications.length === 30) {
    this.notifications.pop();
  }

  this.notifications.unshift(notification);
};

// Marks user's notifications as seen
userSchema.methods.seeNotifications = function () {
  this.notifications = this.notifications.map((n) => ({
    ...n,
    seen: true,
  }));
};

// Creating user model
const User = mongoose.model("User", userSchema);

// Export model data
module.exports = {
  User,
  clientSchema,
  SUPPORTED_ROLES,
};

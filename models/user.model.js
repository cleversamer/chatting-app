const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const clientSchema = [
  "_id",
  "avatarUrl",
  "email",
  "role",
  "firstname",
  "lastname",
  "nickname",
  "rooms",
  "notifications",
  "verified",
];

const SUPPORTED_ROLES = ["student", "teacher", "admin"];

const userSchema = new mongoose.Schema(
  {
    avatarUrl: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: SUPPORTED_ROLES,
      default: "student",
    },
    firstname: {
      type: String,
      trim: true,
      required: true,
    },
    lastname: {
      type: String,
      trim: true,
      required: true,
    },
    nickname: {
      type: String,
      default: "",
    },
    verificationCode: {
      type: Object,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdRooms: {
      type: Array,
    },
    joinedRooms: {
      type: Array,
    },
    notifications: {
      type: Array,
      default: [],
    },
    deviceToken: {
      type: String,
      required: true,
    },
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

userSchema.pre("save", function (next) {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.verificationCode = { code, expiresAt };

  next();
});

userSchema.methods.updateVerificationCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.verificationCode = { code, expiresAt };
};

userSchema.methods.generatePasswordResetCode = function () {
  const code = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date() + 10 * 60 * 1000;
  this.resetPasswordCode = { code, expiresAt };
};

userSchema.methods.verifyEmail = function () {
  this.verified = true;
};

userSchema.methods.genAuthToken = function () {
  const body = { sub: this._id.toHexString(), email: this.email };
  const token = jwt.sign(body, process.env["JWT_PRIVATE_KEY"], {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

userSchema.methods.addNotification = function (content) {
  const notification = { content, seen: false };

  if (this.notifications.length === 10) {
    this.notifications.pop();
  }

  this.notifications.unshift(notification);
};

userSchema.methods.seeNotifications = function () {
  this.notifications = this.notifications.map((n) => ({
    ...n,
    seen: true,
  }));
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  clientSchema,
  SUPPORTED_ROLES,
};

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const clientSchema = [
  "_id",
  "email",
  "role",
  "firstname",
  "lastname",
  "verified",
];

const userSchema = new mongoose.Schema(
  {
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
      enum: ["student", "teacher"],
      default: "student",
    },
    firstname: {
      type: String,
      minLength: 1,
      maxLength: 64,
      trim: true,
      required: true,
    },
    lastname: {
      type: String,
      minLength: 1,
      maxLength: 64,
      trim: true,
      required: true,
    },
    verificationCode: {
      type: Object,
    },
    verified: {
      type: Boolean,
      default: false,
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

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  clientSchema,
};

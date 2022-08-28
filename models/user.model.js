const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email address.");
      }
    },
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
    maxLength: 32,
    trim: true,
    required: true,
  },
  lastname: {
    type: String,
    minLength: 1,
    maxLength: 32,
    trim: true,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

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

userSchema.methods.genRegisterToken = function () {
  const body = { sub: this._id.toHexString() };
  const token = jwt.sign(body, process.env["JWT_PRIVATE_KEY"], {
    expiresIn: "1h",
  });

  return token;
};

userSchema.methods.genPasswordResetToken = function () {
  const body = { sub: this._id.toHexString() };
  const token = jwt.sign(body, process.env["JWT_PRIVATE_KEY"], {
    expiresIn: "15m",
  });

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};

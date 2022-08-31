const { authService, emailService } = require("../services");
const httpStatus = require("http-status");
const { clientSchema } = require("../models/user.model");
const _ = require("lodash");

module.exports.register = async (req, res, next) => {
  try {
    const { email, password, firstname, lastname } = req.body;
    const user = await authService.createUser(
      email,
      password,
      firstname,
      lastname
    );
    const token = user.genAuthToken();

    await emailService.registerEmail(email, user);

    const body = {
      user: _.pick(user, clientSchema),
      token,
    };

    res.status(httpStatus.CREATED).json(body);
  } catch (err) {
    next(err);
  }
};

module.exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.signInWithEmailAndPassword(email, password);
    const token = user.genAuthToken();

    const body = {
      user: _.pick(user, clientSchema),
      token,
    };
    res.cookie("x-access-token", token).status(200).json(body);
  } catch (err) {
    next(err);
  }
};

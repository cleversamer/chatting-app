const { authService, emailService, usersService } = require("../services");
const httpStatus = require("http-status");
const errors = require("../config/errors");

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

    res
      .cookie("x-access-token", token)
      .status(httpStatus.CREATED)
      .json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.signInWithEmailAndPassword(email, password);
    const token = user.genAuthToken();

    res.cookie("x-access-token", token).status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
};

module.exports.isAuth = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (err) {
    next(err);
  }
};

module.exports.verifyAccount = async (req, res, next) => {
  try {
    const token = await usersService.validateToken(req.query.key);
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

    res.status(httpStatus.CREATED).json(user);
  } catch (err) {
    next(err);
  }
};

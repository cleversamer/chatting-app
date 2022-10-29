const { Router } = require("express");
const router = Router();
const { usersController } = require("../../controllers");
const auth = require("../../middleware/auth");
const validator = require("../../middleware/validation/auth");

router.get("/isauth", [auth("readOwn", "user")], usersController.isAuth);

router
  .route("/verify")
  .get(
    [auth("updateOwn", "verificationCode", true)],
    usersController.resendVerificationCode
  )
  .post(
    [auth("updateOwn", "verificationCode", true)],
    usersController.verifyUser
  );

router.get(
  "/my-rooms",
  [auth("readOwn", "room")],
  usersController.getUserRooms
);

router
  .route("/forgot-password")
  .get([validator.emailValidator], usersController.sendForgotPasswordCode)
  .post(
    [validator.forgotPasswordValidator],
    usersController.handleForgotPassword
  );

router.post(
  "/reset-password",
  [auth("updateOwn", "password"), validator.resetPasswordValidator],
  usersController.resetPassword
);

router.patch(
  "/profile",
  [auth("updateOwn", "profile")],
  usersController.updateProfile
);

router
  .route("/")
  .get([auth("readAny", "userType")], usersController.getAllUsers)
  .delete([auth("deleteAny", "userType")], usersController.deleteUser);

module.exports = router;
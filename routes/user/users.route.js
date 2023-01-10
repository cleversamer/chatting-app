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

router.delete(
  "/delete-my-account",
  auth("deleteOwn", "user"),
  usersController.deleteMyAccount
);

router.post(
  "/send-notification",
  auth("createAny", "notification"),
  usersController.sendNotification
);

router.get(
  "/see-notifications",
  auth("readOwn", "notification"),
  usersController.seeNotifications
);

router.get(
  "/my-assignments",
  auth("readOwn", "createdAssignments"),
  usersController.getMyAssignments
);

router.get(
  "/my-active-assignments",
  [auth("readOwn", "assignment")],
  usersController.getMyActiveAssignments
);

module.exports = router;

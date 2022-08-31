const { Router } = require("express");
const router = Router();
const { usersController } = require("../controllers");
const auth = require("../middleware/auth");
const { resetPasswordValidator } = require("../middleware/validation/auth");

router.get("/isauth", [auth("readOwn", "user")], usersController.isAuth);

router
  .route("/verify")
  .get(
    [auth("updateOwn", "verificationCode")],
    usersController.resendVerificationCode
  )
  .post([auth("updateOwn", "verificationCode")], usersController.verifyUser);

router.post(
  "/reset-password",
  [auth("updateOwn", "password"), resetPasswordValidator],
  usersController.resetPassword
);

module.exports = router;

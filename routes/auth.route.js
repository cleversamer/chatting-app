const { Router } = require("express");
const router = Router();
const { authController } = require("../controllers");
const validator = require("../middleware/validation/auth");

router.post(
  "/register",
  [validator.registerValidator],
  authController.register
);

router.post("/login", [validator.loginValidator], authController.signin);

module.exports = router;

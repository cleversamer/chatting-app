const { Router } = require("express");
const router = Router();
const { usersController } = require("../controllers");
const auth = require("../middleware/auth");

router.get("/verify-email", usersController.verifyAccount);

router.post("/forgot-password", usersController.sendPasswordResetEmail);

router.get("/reset-password/:key", usersController.getResetPasswordPage);

router.post("/reset-password/:key", usersController.resetPassword);

module.exports = router;

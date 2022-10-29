const { Router } = require("express");
const router = Router();
const { messagesController } = require("../../controllers");
const auth = require("../../middleware/auth");

router.post(
  "/send",
  [auth("createOwn", "message")],
  messagesController.createMessage
);

router.get("/room/:id", messagesController.getRoomMessages);

module.exports = router;
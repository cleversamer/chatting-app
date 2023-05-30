const { Router } = require("express");
const router = Router();
const { messagesController } = require("../../controllers");
const auth = require("../../middleware/auth");

router.post(
  "/send",
  auth("createOwn", "message"),
  messagesController.createMessage
);

router.post(
  "/:messageId/poll/vote",
  auth("createOwn", "message"),
  messagesController.createVote
);

router.get(
  "/room/:id",
  auth("readOwn", "message"),
  messagesController.getRoomMessages
);

router.delete(
  "/delete",
  auth("deleteOwn", "message"),
  messagesController.deleteMessage
);

// router.post(
//   "/view-message",
//   auth("readOwn", "message"),
//   messagesController.viewMessage
// );

module.exports = router;

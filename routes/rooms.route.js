const { Router } = require("express");
const router = Router();
const { roomsController } = require("../controllers");
const validator = require("../middleware/validation/room");
const auth = require("../middleware/auth");

router
  .route("/")
  .get([auth("readAny", "room")], roomsController.getAllPublicRooms)
  .post(
    [auth("createOwn", "room"), validator.createRoomValidator],
    roomsController.createRoom
  );

router.get(
  "/suggested",
  [auth("readAny", "room")],
  roomsController.getSuggestedRooms
);

router.post(
  "/:id/add-pinned-message",
  [auth("updateOwn", "room")],
  roomsController.addPinnedMessage
);

router.patch(
  "/:id/toggle-chat-disable",
  [auth("updateOwn", "room")],
  roomsController.toggleChatDisabled
);

router.put(
  "/:id/reset-room",
  [auth("updateOwn", "room")],
  roomsController.resetRoom
);

router.get("/:id/join", [auth("updateOwn", "room")], roomsController.joinRoom);

module.exports = router;

const { Router } = require("express");
const router = Router();
const { roomsController } = require("../../controllers");
const validator = require("../../middleware/validation/room");
const auth = require("../../middleware/auth");

router
  .route("/")
  .get([auth("readAny", "room")], roomsController.getAllPublicRooms)
  .post(
    [auth("createOwn", "room"), validator.createRoomValidator],
    roomsController.createRoom
  )
  .delete([auth("deleteOwn", "room")], roomsController.deleteRoom);

router.get("/all", [auth("readAny", "roomType")], roomsController.getAllRooms);

router.post(
  "/add-pinned-message",
  [auth("updateOwn", "room")],
  roomsController.addPinnedMessage
);

router.patch(
  "/block-users",
  [auth("updateOwn", "room")],
  roomsController.blockUsersFromChatting
);

router.patch(
  "/unblock-users",
  [auth("updateOwn", "room")],
  roomsController.unblockUsersFromChatting
);

router.put(
  "/:id/reset-room",
  [auth("updateOwn", "room")],
  roomsController.resetRoom
);

router.delete(
  "/delete-messages",
  [auth("updateOwn", "room")],
  roomsController.deleteRoomMessages
);

router.get("/join", [auth("updateOwn", "room")], roomsController.joinRoom);

router.get("/search", [auth("readAny", "room")], roomsController.searchRooms);

router.get(
  "/:roomId/members",
  [auth("readAny", "room")],
  roomsController.getRoomMembers
);

router.delete(
  "/delete-members",
  auth("updateOwn", "room"),
  roomsController.deleteMembers
);

router.patch(
  "/toggle-show-name",
  auth("updateOwn", "room"),
  roomsController.toggleShowName
);

router.patch(
  "/toggle-chat-disabled",
  auth("updateOwn", "room"),
  roomsController.toggleChatDisabled
);

router.get(
  "/:roomId/active-assignments",
  roomsController.getRoomActiveAssignments
);

module.exports = router;

const { Router } = require("express");
const router = Router();
const { roomsController } = require("../../controllers");
const validator = require("../../middleware/validation/room");
const auth = require("../../middleware/auth");

router
  .route("/")
  .get(auth("readAny", "room"), roomsController.getAllPublicRooms)
  .post(
    validator.createRoomValidator,
    auth("createOwn", "room"),
    roomsController.createRoom
  )
  .delete(auth("deleteOwn", "room"), roomsController.deleteRoom);

router.get("/all", auth("readAny", "roomType"), roomsController.getAllRooms);

router.post(
  "/add-pinned-message",
  auth("updateOwn", "room"),
  roomsController.addPinnedMessage
);

router.patch(
  "/block-users",
  auth("updateOwn", "room"),
  roomsController.blockUsersFromChatting
);

router.patch(
  "/unblock-users",
  auth("updateOwn", "room"),
  roomsController.unblockUsersFromChatting
);

router.put(
  "/:id/reset-room",
  auth("updateOwn", "room"),
  roomsController.resetRoom
);

router.delete(
  "/delete-messages",
  auth("updateOwn", "room"),
  roomsController.deleteRoomMessages
);

router.get("/join", auth("updateOwn", "room"), roomsController.joinRoom);

router.get("/search", auth("readAny", "room"), roomsController.searchRooms);

router.get(
  "/:roomId/members",
  auth("readAny", "room"),
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

router.patch(
  "/change-room-name",
  validator.validateChangeRoomName,
  auth("updateOwn", "room"),
  roomsController.changeRoomName
);

router.get(
  "/:roomId/active-assignments",
  roomsController.getRoomActiveAssignments
);

router.post(
  "/switch-to-public",
  auth("updateOwn", "room"),
  roomsController.switchRoomToPublic
);

router.post(
  "/switch-to-private",
  auth("updateOwn", "room"),
  roomsController.switchRoomToPrivate
);

router.post("/pin", auth("updateAny", "pinnedRoom"), roomsController.pinRoom);

router.post(
  "/unpin",
  auth("updateAny", "pinnedRoom"),
  roomsController.unpinRoom
);

router.post(
  "/members/search",
  auth("updateOwn", "room"),
  roomsController.searchRoomMembers
);

module.exports = router;

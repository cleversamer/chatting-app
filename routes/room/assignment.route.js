const { Router } = require("express");
const router = Router();
const { assignmentsController } = require("../../controllers");
const auth = require("../../middleware/auth");

router.post(
  "/",
  auth("createOwn", "assignment"),
  assignmentsController.createAssignment
);

router.get(
  "/get/:assignmentId",
  auth("readOwn", "assignment"),
  assignmentsController.getAssignment
);

router.get(
  "/:roomId",
  auth("readOwn", "assignment"),
  assignmentsController.getRoomAssignments
);

router.patch(
  "/addSubmissionTime",
  auth("createOwn", "assignment"),
  assignmentsController.addSubmissionTime
);

router.post(
  "/submit",
  auth("createOwn", "submission"),
  assignmentsController.createSubmission
);

router.get(
  "/:id/submissions",
  auth("readAny", "submission"),
  assignmentsController.getAssignmentSubmissions
);

router.get(
  "/download/:roomId/:assignmentId",
  auth("readAny", "submission"),
  assignmentsController.downloadAssignmentSubmissions
);

router.get(
  "/:assignmentId/submission-status",
  auth("readOwn", "submission"),
  assignmentsController.getMySubmissionStatus
);

module.exports = router;

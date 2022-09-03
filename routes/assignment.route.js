const { Router } = require("express");
const router = Router();
const { assignmentsController } = require("../controllers");
const auth = require("../middleware/auth");

router.post(
  "/",
  [auth("createOwn", "assignment")],
  assignmentsController.createAssignment
);

router.post(
  "/submit",
  [auth("createOwn", "submission")],
  assignmentsController.addSubmission
);

router.get(
  "/:id/submissions",
  [auth("readAny", "submission")],
  assignmentsController.getAssignmentSubmissions
);

module.exports = router;

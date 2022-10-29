const { assignemntsService } = require("../../services");
const httpStatus = require("http-status");

module.exports.createAssignment = async (req, res, next) => {
  try {
    const user = req.user;
    const { title, roomId, expiresAfterDays } = req.body;
    const file = req?.files?.file;

    const assignment = await assignemntsService.createAssignment(
      user,
      title,
      roomId,
      expiresAfterDays,
      file
    );

    res.status(httpStatus.CREATED).json(assignment);
  } catch (err) {
    next(err);
  }
};

module.exports.addSubmissionTime = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId, hours } = req.body;

    const assignment = await assignemntsService.addSubmissionTime(
      user,
      roomId,
      assignmentId,
      hours
    );

    res.status(httpStatus.CREATED).json(assignment);
  } catch (err) {
    next(err);
  }
};

module.exports.createSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId } = req.body;
    const file = req?.files?.file;

    const submission = await assignemntsService.createSubmission(
      user,
      roomId,
      assignmentId,
      file
    );

    res.status(httpStatus.CREATED).json(submission);
  } catch (err) {
    next(err);
  }
};

module.exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    const assignmentId = req.params.id;
    const { roomId } = req.query;

    const submissions = await assignemntsService.getAssignmentSubmissions(
      user,
      assignmentId,
      roomId
    );

    res.status(httpStatus.OK).json({ submissions });
  } catch (err) {
    next(err);
  }
};

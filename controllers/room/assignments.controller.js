const { assignemntsService } = require("../../services");
const httpStatus = require("http-status");

module.exports.createAssignment = async (req, res, next) => {
  try {
    const user = req.user;
    const { title, roomId, minutes, clientDate } = req.body;
    const file = req?.files?.file;

    const assignment = await assignemntsService.createAssignment(
      user,
      title,
      roomId,
      minutes,
      file,
      clientDate
    );

    res.status(httpStatus.CREATED).json(assignment);
  } catch (err) {
    next(err);
  }
};

module.exports.getRoomAssignments = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const assignments = await assignemntsService.getRoomAssignments(roomId);

    res.status(httpStatus.OK).json({ assignments });
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
    const file1 = req?.files?.file1;
    const file2 = req?.files?.file2;
    const file3 = req?.files?.file3;

    const submission = await assignemntsService.createSubmission(
      user,
      roomId,
      assignmentId,
      file1,
      file2,
      file3
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

module.exports.downloadAssignmentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId } = req.params;

    const zipFile = await assignemntsService.downloadAssignmentSubmissions(
      user,
      assignmentId,
      roomId
    );

    res.send(zipFile);
  } catch (err) {
    next(err);
  }
};

module.exports.getMySubmissionStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { assignmentId } = req.params;

    const isSubmitted = await assignemntsService.getMySubmissionStatus(
      user,
      assignmentId
    );

    res.status(httpStatus.OK).json({ submitted: isSubmitted });
  } catch (err) {
    next(err);
  }
};

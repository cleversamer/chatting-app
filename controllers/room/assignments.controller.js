const { assignemntsService } = require("../../services");
const scheduleService = require("../../services/system/schedule.service");
const localStorage = require("../../services/storage/localStorage.service");
const httpStatus = require("http-status");

// A controller function for creating a new assignment in the DB
module.exports.createAssignment = async (req, res, next) => {
  try {
    const user = req.user;
    const { title, roomId, minutes, clientDate, displayName } = req.body;
    const file = req?.files?.file;

    // Asking service to create an assignment
    const assignment = await assignemntsService.createAssignment(
      user,
      title,
      roomId,
      minutes,
      file,
      displayName,
      clientDate
    );

    // Delete assignment and its files after 30 days
    const runDate = new Date();
    runDate.setMinutes(runDate.getMinutes() + 1440 * 30); // PRODUCTION
    // runDate.setMinutes(runDate.getMinutes() + 1); // TEST
    scheduleService.scheduleEvent(runDate, async () => {
      await assignemntsService.deleteAssignment(assignment._id);
    });

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(assignment);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns an assignemnt by a given id
module.exports.getAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    // Asking service to find an assignment by a specific id
    const assignment = await assignemntsService.getAssignment(assignmentId);

    // Send the data back to the client.
    res.status(httpStatus.OK).json(assignment);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns the assignemnts of a room
// Given and id of the room.
module.exports.getRoomAssignments = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Asking the service to find all assignments related to the
    // given room id
    const assignments = await assignemntsService.getRoomAssignments(roomId);

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ assignments });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that adds an extra time to the remaining
// time of the specified assignment id
module.exports.addSubmissionTime = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId, hours } = req.body;

    // Asking service to add extra time to the assignment
    // with the given id
    const assignment = await assignemntsService.addSubmissionTime(
      user,
      roomId,
      assignmentId,
      hours
    );

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(assignment);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that creates a new submission in the DB
module.exports.createSubmission = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId, displayName1, displayName2, displayName3 } =
      req.body;
    const file1 = req?.files?.file1;
    const file2 = req?.files?.file2;
    const file3 = req?.files?.file3;

    // Asking the service to create a submission to the given assignment
    const submission = await assignemntsService.createSubmission(
      user,
      roomId,
      assignmentId,
      file1,
      file2,
      file3,
      displayName1,
      displayName2,
      displayName3
    );

    // Send the data back to the client.
    res.status(httpStatus.CREATED).json(submission);
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns all the submissions of the
// assignment of the given id
module.exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    const assignmentId = req.params.id;
    const { roomId } = req.query;

    // Asking service to find all submissions belog to the assignemnt
    // with the given id
    const submissions = await assignemntsService.getAssignmentSubmissions(
      user,
      assignmentId,
      roomId
    );

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ submissions });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// FIXME:
// A controller function that returns a ZIP file of all submission files
// of the assignment with the given id
module.exports.downloadAssignmentSubmissions = async (req, res, next) => {
  try {
    const user = req.user;
    const { roomId, assignmentId } = req.params;

    // Asking serivce to compress submissions' files and return a ZIP file
    const zipFile = await assignemntsService.downloadAssignmentSubmissions(
      user,
      assignmentId,
      roomId
    );

    const zipFilePath = zipFile.split("uploads")[1];

    // Delete zip file after 3 minutes
    const runDate = new Date();
    runDate.setMinutes(runDate.getMinutes() + 3);
    scheduleService.scheduleEvent(runDate, async () => {
      await localStorage.deleteFile(zipFilePath);
    });

    // Send the file back to the client
    res.status(httpStatus.CREATED).json({
      type: "file/zip",
      path: zipFilePath,
    });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

// A controller function that returns the submission status for
// a particular user in a given assignemnt
module.exports.getMySubmissionStatus = async (req, res, next) => {
  try {
    const user = req.user;
    const { assignmentId } = req.params;

    // Asking service to figure out if the requesting user has created
    // a submission for the assignemnt or not.
    // returns `true` or `false`
    const isSubmitted = await assignemntsService.getMySubmissionStatus(
      user,
      assignmentId
    );

    // Send the data back to the client.
    res.status(httpStatus.OK).json({ submitted: isSubmitted });
  } catch (err) {
    // Pass the execution to the next middleware function
    // with the error object.
    // The error often comes from used services.
    next(err);
  }
};

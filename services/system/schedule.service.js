const schedule = require("node-schedule");

const defualtCallback = () => {
  console.log("Schedules event to run.");
  console.log("Current date:", new Date());
};

module.exports.scheduleEvent = (runDate, callback = defualtCallback) => {
  schedule.scheduleJob(runDate, callback);
};

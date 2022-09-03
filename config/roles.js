const AccessControl = require("accesscontrol");

const allRights = {
  "create:any": ["*"],
  "read:any": ["*"],
  "update:any": ["*"],
  "delete:any": ["*"],
};

let grantsObject = {
  teacher: {
    user: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    submission: allRights,
  },
  stdteacher: {
    user: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    submission: allRights,
  },
  student: {
    user: {
      "read:own": ["*"],
    },
    verificationCode: {
      "update:own": ["*"],
    },
    password: {
      "update:own": ["*"],
    },
    room: {
      "read:any": ["*"],
      "update:own": ["*"],
    },
    message: {
      "create:own": ["*"],
    },
    assignment: {
      "read:any": ["*"],
    },
    submission: {
      "create:own": ["*"],
      "read:own": ["*"],
    },
  },
};

const roles = new AccessControl(grantsObject);

module.exports = roles;

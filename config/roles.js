const AccessControl = require("accesscontrol");

const allRights = {
  "create:any": ["*"],
  "read:any": ["*"],
  "update:any": ["*"],
  "delete:any": ["*"],
};

let grantsObject = {
  admin: {
    user: allRights,
    userType: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    submission: allRights,
    profile: allRights,
    roomType: allRights,
    notification: allRights,
  },
  teacher: {
    user: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    submission: allRights,
    profile: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    notification: allRights,
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
      "update:own": ["*"],
      "delete:own": ["*"],
    },
    assignment: {
      "read:any": ["*"],
    },
    submission: {
      "create:own": ["*"],
      "read:own": ["*"],
    },
    profile: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    notification: {
      "read:own": ["*"],
    },
  },
};

const roles = new AccessControl(grantsObject);

module.exports = roles;

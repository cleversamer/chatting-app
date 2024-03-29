const AccessControl = require("accesscontrol");

const allRights = {
  "create:any": ["*"],
  "read:any": ["*"],
  "update:any": ["*"],
  "delete:any": ["*"],
};

// An object that specifies the rights of each role
let grantsObject = {
  // Admin rights
  admin: {
    user: allRights,
    userType: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    createdAssignments: allRights,
    submission: allRights,
    profile: allRights,
    roomType: allRights,
    notification: allRights,
    pinnedRoom: allRights,
  },
  // Teacher rights
  teacher: {
    user: allRights,
    verificationCode: allRights,
    password: allRights,
    room: allRights,
    message: allRights,
    assignment: allRights,
    createdAssignments: allRights,
    submission: allRights,
    profile: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    notification: allRights,
    pinnedRoom: {
      "read:any": ["*"],
    },
  },
  // Student rights
  student: {
    user: {
      "read:own": ["*"],
      "delete:own": ["*"],
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
      "read:own": ["*"],
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
    pinnedRoom: {
      "read:any": ["*"],
    },
  },
};

// Creating an instance of AccessControl class
const roles = new AccessControl(grantsObject);

module.exports = roles;

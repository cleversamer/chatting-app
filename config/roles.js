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
  },
  student: {
    user: {
      "read:own": ["*"],
    },
  },
};

const roles = new AccessControl(grantsObject);

module.exports = roles;

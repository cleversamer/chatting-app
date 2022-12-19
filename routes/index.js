const { Router } = require("express");
const router = Router();
const authRoute = require("./user/auth.route");
const usersRoute = require("./user/users.route");
const roomsRoute = require("./room/rooms.route");
const messagesRoute = require("./room/messages.route");
const assignmentsRoute = require("./room/assignment.route");

const routes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/users",
    route: usersRoute,
  },
  {
    path: "/rooms",
    route: roomsRoute,
  },
  {
    path: "/messages",
    route: messagesRoute,
  },
  {
    path: "/assignments",
    route: assignmentsRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;

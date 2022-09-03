const { Router } = require("express");
const router = Router();
const authRoute = require("./auth.route");
const usersRoute = require("./users.route");
const roomsRoute = require("./rooms.route");
const messagesRoute = require("./messages.route");
const assignmentsRoute = require("./assignment.route");

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

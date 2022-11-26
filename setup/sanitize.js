const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const upload = require("express-fileupload");
const { limitHandler } = require("../middleware/apiError");

module.exports = (app) => {
  app.use(
    upload({
      limits: { fileSize: 10 * 1024 * 1024 },
      abortOnLimit: true,
      limitHandler,
    })
  );
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("uploads"));
  app.use(cors({ origin: true }));
  app.use(xss());
  app.use(mongoSanitize());
};

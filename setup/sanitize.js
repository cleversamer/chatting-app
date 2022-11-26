const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const upload = require("express-fileupload");

module.exports = (app) => {
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("uploads"));
  app.use(cors({ origin: true }));
  app.use(upload({ limits: { fileSize: 10 * 1024 * 1024 } }));
  app.use(xss());
  app.use(mongoSanitize());
};

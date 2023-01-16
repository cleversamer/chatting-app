const express = require("express");
const upload = require("express-fileupload");
const { limitHandler } = require("../middleware/apiError");

module.exports = (app) => {
  app.use(
    upload({
      limits: { fileSize: 1 * 1024 * 1024 },
      abortOnLimit: true,
      limitHandler,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("uploads"));
};

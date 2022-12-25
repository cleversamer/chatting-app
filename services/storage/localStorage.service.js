const { ApiError } = require("../../middleware/apiError");
const crypto = require("crypto");
const errors = require("../../config/errors");
const fs = require("fs");
const httpStatus = require("http-status");

const storeFile = async (file, title = "") => {
  try {
    const readFile = Buffer.from(file.data, "base64");

    const diskName = title
      ? `${filterName(`${title}_${getCurrentDate()}`)}_${crypto
          .randomUUID()
          .substring(0, 10)}`
      : crypto.randomUUID();

    const nameParts = file.name.split(".");
    const extension = nameParts[nameParts.length - 1];

    const name = `${diskName}.${extension}`;
    const path = `/${name}`;
    fs.writeFileSync(`./uploads${path}`, readFile, "utf8");

    return { originalName: file.name, name, path };
  } catch (err) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.system.fileUploadError;
    throw new ApiError(statusCode, message);
  }
};

const filterName = (name = "") => {
  return name.split(" ").join("_").split(":").join("_");
};

const getCurrentDate = () => {
  let strDate = new Date().toLocaleString();
  strDate = strDate.split(", ");
  let part1 = strDate[0];
  let part2 = strDate[1].split(" ");
  let part21 = part2[0].split(":").slice(0, 2).join(":");
  let part22 = part2[1];

  let date = `${part1}_${part21}_${part22}`;
  date = date.split("/").join("-");
  return date;
};

const deleteFile = async (file) => {
  try {
    if (!file || !file.name || !file.path) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.invalidFile;
      throw new ApiError(statusCode, message);
    }

    fs.unlink(`./uploads${file.path}`, (err) => {
      if (err) {
        throw err;
      }
    });

    return true;
  } catch (err) {
    if (!(err instanceof ApiError)) {
      const statusCode = httpStatus.BAD_REQUEST;
      const message = errors.system.fileUploadError;
      err = new ApiError(statusCode, message);
    }

    throw err;
  }
};

module.exports = {
  storeFile,
  deleteFile,
};

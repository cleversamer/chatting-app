const fs = require("fs");
const archiver = require("archiver");
const httpStatus = require("http-status");
const errors = require("../../config/errors");
const { ApiError } = require("../../middleware/apiError");

module.exports.compressFiles = async (title, files = []) => {
  try {
    const fileName = filterName(`${title}_${getCurrentDate()}`);
    const output = fs.createWriteStream(`../../../uploads/${fileName}.zip`);
    const archive = archiver("zip", {
      gzip: true,
      zlib: { level: 9 }, // Sets the compression level.
    });

    archive.on("error", function (err) {
      throw err;
    });

    // pipe archive data to the output file
    archive.pipe(output);

    // append files
    files.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    // wait for streams to complete
    archive
      .finalize()
      .then((value) => {
        console.log("value", value);
      })
      .catch((err) => {
        console.log("err", err);
      });
  } catch (err) {
    const statusCode = httpStatus.BAD_REQUEST;
    const message = errors.system.fileUploadError;
    throw new ApiError(statusCode, message);
  }
};

const filterName = (name = "") => {
  return name.split(" ").join("_");
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

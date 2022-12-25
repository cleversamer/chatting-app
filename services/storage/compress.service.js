const AdmZip = require("adm-zip");
const httpStatus = require("http-status");
const errors = require("../../config/errors");
const { ApiError } = require("../../middleware/apiError");

module.exports.compressFiles = async (title, files = []) => {
  try {
    // Creating an instance of AdmZip class
    const zip = new AdmZip();

    // Deciding file name
    const fileName = filterName(`${title}_${getCurrentDate()}`);
    const outputFile = `./uploads/${fileName}.zip`;

    files.forEach((file, index) => {
      const path = `./uploads/${file.path.substring(1)}`;
      zip.addLocalFile(path);
    });

    zip.writeZip(outputFile);

    return outputFile;
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

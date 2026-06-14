const Document = require("../models/Document");
const Chat = require("../models/Chat");
const cloudinary = require("../config/cloudinary");
const logger = require("./logger");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = parseInt(process.env.DOC_RETENTION_DAYS || "30", 10);

async function purgeOldDocuments() {
  logger.info("Document purging is disabled (document expiration is turned off).");
  return;
}

function scheduleDailyPurge() {
  logger.info("Daily document purge scheduler is disabled (document expiration is turned off).");
}

module.exports = {
  scheduleDailyPurge,
  purgeOldDocuments,
};

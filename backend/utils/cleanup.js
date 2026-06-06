const Document = require("../models/Document");
const Chat = require("../models/Chat");
const cloudinary = require("../config/cloudinary");
const logger = require("./logger");

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const RETENTION_DAYS = parseInt(process.env.DOC_RETENTION_DAYS || "30", 10);

async function purgeOldDocuments() {
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * MS_PER_DAY);
    const oldDocs = await Document.find({ createdAt: { $lt: cutoff } });
    if (!oldDocs.length) return logger.info("No old documents to purge.");

    logger.info(
      `Purging ${oldDocs.length} documents older than ${RETENTION_DAYS} days...`,
    );

    for (const doc of oldDocs) {
      try {
        if (doc.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(doc.cloudinaryPublicId, {
            resource_type: "auto",
          });
        }
      } catch (err) {
        logger.warn(
          `Failed to delete Cloudinary asset for ${doc._id}: ${err.message}`,
        );
      }

      try {
        await Chat.deleteMany({
          documentId: doc.documentId,
          userId: doc.userId,
        });
      } catch (err) {
        logger.warn(`Failed to delete chats for ${doc._id}: ${err.message}`);
      }

      try {
        await Document.deleteOne({ _id: doc._id });
      } catch (err) {
        logger.warn(`Failed to delete Document ${doc._id}: ${err.message}`);
      }
    }

    logger.info("Old document purge complete.");
  } catch (err) {
    logger.error(`Document purge failed: ${err.message}`);
  }
}

function scheduleDailyPurge() {
  // Run once at startup
  purgeOldDocuments().catch((err) =>
    logger.warn(`Initial purge failed: ${err.message}`),
  );
  // Then schedule every 24 hours
  setInterval(() => {
    purgeOldDocuments().catch((err) =>
      logger.error(`Scheduled purge failed: ${err.message}`),
    );
  }, MS_PER_DAY);
}

module.exports = {
  scheduleDailyPurge,
  purgeOldDocuments,
};

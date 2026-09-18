require('dotenv').config();
const connectDB = require('../config/mongodb');
const Document = require('../models/Document');
const { ensureDocumentIndexed } = require('../services/ragProxyService');
const logger = require('../utils/logger');

const reindexAll = async () => {
  try {
    logger.info('Starting full RAG re-indexing process...');
    
    // 1. Connect to MongoDB
    await connectDB();
    logger.info('Connected to MongoDB.');

    // 2. Fetch all documents
    const docs = await Document.find({});
    logger.info(`Found ${docs.length} documents in database.`);

    if (docs.length === 0) {
      logger.info('No documents to index. Finished.');
      process.exit(0);
    }

    // 3. Re-index each document
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      logger.info(`\n[${i + 1}/${docs.length}] Processing: ${doc.originalName} (ID: ${doc.documentId})`);
      try {
        await ensureDocumentIndexed(doc.documentId);
        logger.info(`✅ Indexed successfully: ${doc.originalName}`);
      } catch (err) {
        logger.error(`❌ Failed to index ${doc.originalName}: ${err.message}`);
      }
    }

    logger.info('\nFull RAG re-indexing complete.');
    process.exit(0);
  } catch (err) {
    logger.error(`Fatal error in re-indexing script: ${err.message}`);
    process.exit(1);
  }
};

reindexAll();

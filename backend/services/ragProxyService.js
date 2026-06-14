const FormData = require('form-data');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Document = require('../models/Document');
const logger = require('../utils/logger');

const RAW_URL = process.env.RAG_SERVICE_URL;
const RAG_BASE_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

/**
 * Ensures that a document is indexed in the RAG service.
 * If not, downloads the file from Cloudinary and ingests it under its existing documentId.
 * @param {string} documentId
 */
const ensureDocumentIndexed = async (documentId) => {
  try {
    const checkResponse = await fetch(`${RAG_BASE_URL}/documents/${documentId}`);
    if (checkResponse.ok) {
      // Document is already indexed!
      return;
    }
    
    if (checkResponse.status === 404) {
      logger.info(`Document ${documentId} is missing from RAG registry. Triggering auto-reindexing...`);
      const docMongo = await Document.findOne({ documentId });
      if (!docMongo) {
        throw new Error(`Document ${documentId} not found in MongoDB.`);
      }

      let fileBuffer;
      if (docMongo.fileUrl && (docMongo.fileUrl.startsWith('http://') || docMongo.fileUrl.startsWith('https://'))) {
        logger.info(`Downloading original document file from Cloudinary: ${docMongo.originalName}`);
        const fileResponse = await fetch(docMongo.fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download document from Cloudinary: ${fileResponse.statusText}`);
        }
        fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
      } else if (docMongo.fileUrl) {
        // Fallback: Check local uploads directory for legacy files
        const path = require('path');
        const localPath = path.join(__dirname, '..', 'uploads', docMongo.fileUrl);
        if (fs.existsSync(localPath)) {
          logger.info(`Reading original document file from local uploads: ${docMongo.originalName}`);
          fileBuffer = fs.readFileSync(localPath);
        } else {
          throw new Error(`Document file URL is not a valid HTTP URL and local file does not exist: "${docMongo.fileUrl}"`);
        }
      } else {
        throw new Error('Document record does not contain a fileUrl.');
      }

      logger.info(`Re-ingesting document to RAG service: ${docMongo.originalName} (${documentId})`);
      const form = new FormData();
      form.append('file', fileBuffer, { filename: docMongo.originalName });
      form.append('document_id', documentId);

      const ingestResponse = await fetch(`${RAG_BASE_URL}/ingest`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      });

      if (!ingestResponse.ok) {
        const errBody = await ingestResponse.text();
        throw new Error(`Re-ingestion failed with status ${ingestResponse.status}: ${errBody}`);
      }

      const result = await ingestResponse.json();
      logger.info(`Document auto-reindexed successfully: ${result.document_id}`);
      return;
    }

    throw new Error(`RAG service check failed: ${checkResponse.status}`);
  } catch (error) {
    logger.error(`Failed to ensure document ${documentId} is indexed: ${error.message}`);
    throw error;
  }
};

/**
 * Proxy: Upload and ingest a document into the RAG microservice
 * @param {Buffer} fileBuffer - File buffer from multer memoryStorage
 * @param {string} originalName - Original file name
 * @returns {Promise<{document_id, filename, num_chunks, message}>}
 */
const ingestDocument = async (fileBuffer, originalName, documentId = null) => {
  logger.info(`Ingesting document: ${originalName} to RAG service`);

  const form = new FormData();
  form.append('file', fileBuffer, { filename: originalName });
  if (documentId) {
    form.append('document_id', documentId);
  }

  const response = await fetch(`${RAG_BASE_URL}/ingest`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error(`RAG /ingest failed: ${errBody}`);
    throw new Error(`RAG service ingestion failed: ${response.status}`);
  }

  const result = await response.json();
  logger.info(`Document ingested successfully: ${result.document_id}`);
  return result;
};

/**
 * Proxy: Analyze a previously ingested document
 * @param {string} documentId
 * @param {string} query
 * @returns {Promise<AnalyzeResponse>}
 */
const analyzeDocument = async (documentId, query = 'Summarise this legal document and explain the key obligations.') => {
  await ensureDocumentIndexed(documentId);

  logger.info(`Analyzing document: ${documentId}`);

  const response = await fetch(`${RAG_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, query })
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error(`RAG /analyze failed: ${errBody}`);
    if (response.status === 404) {
      throw new Error('DOCUMENT_INDEX_EXPIRED');
    }
    throw new Error(`RAG service analysis failed: ${response.status}`);
  }

  return await response.json();
};

/**
 * Proxy: Chat with a previously ingested document
 * @param {string} documentId
 * @param {string} question
 * @returns {Promise<ChatResponse>}
 */
const chatWithDocument = async (documentId, question) => {
  await ensureDocumentIndexed(documentId);

  logger.info(`Chat request for document: ${documentId}`);

  const response = await fetch(`${RAG_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, question })
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error(`RAG /chat failed: ${errBody}`);
    if (response.status === 404) {
      throw new Error('DOCUMENT_INDEX_EXPIRED');
    }
    throw new Error(`RAG service chat failed: ${response.status}`);
  }

  return await response.json();
};

module.exports = {
  ingestDocument,
  analyzeDocument,
  chatWithDocument,
  ensureDocumentIndexed
};

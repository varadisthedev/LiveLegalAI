const FormData = require('form-data');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const logger = require('../utils/logger');

const RAW_URL = process.env.RAG_SERVICE_URL;
const RAG_BASE_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

/**
 * Proxy: Upload and ingest a document into the RAG microservice
 * @param {string} filePath - Local path to the uploaded file
 * @param {string} originalName - Original file name
 * @returns {Promise<{document_id, filename, num_chunks, message}>}
 */
const ingestDocument = async (filePath, originalName) => {
  logger.info(`Ingesting document: ${originalName} to RAG service`);

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), originalName);

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
  logger.info(`Analyzing document: ${documentId}`);

  const response = await fetch(`${RAG_BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, query })
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error(`RAG /analyze failed: ${errBody}`);
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
  logger.info(`Chat request for document: ${documentId}`);

  const response = await fetch(`${RAG_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId, question })
  });

  if (!response.ok) {
    const errBody = await response.text();
    logger.error(`RAG /chat failed: ${errBody}`);
    throw new Error(`RAG service chat failed: ${response.status}`);
  }

  return await response.json();
};

module.exports = {
  ingestDocument,
  analyzeDocument,
  chatWithDocument
};

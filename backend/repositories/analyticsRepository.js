const { v4: uuidv4 } = require('uuid');
const { executeQuery, isSnowflakeConnected } = require('../config/snowflake');
const logger = require('../utils/logger');

/**
 * Save rich analytics data to Snowflake
 * Provides an enterprise-grade BI/Analytics feed of all processed legal documents.
 * Returns null gracefully if Snowflake isn't connected.
 * 
 * @param {object} analyticsData 
 */
const saveAnalytics = async (analyticsData) => {
  if (!isSnowflakeConnected()) {
    logger.warn('Snowflake not connected, skipping analytics write.');
    return null;
  }

  const { 
    documentId, 
    documentType, 
    legalCategory, 
    severityScore, 
    riskLevel, 
    riskFactors, // Array of factors
    userId, 
    filename, 
    numChunks 
  } = analyticsData;

  const id = uuidv4();
  
  // Convert riskFactors array to a stringified JSON for Snowflake
  const riskFactorsStr = riskFactors ? JSON.stringify(riskFactors) : '[]';

  const sqlText = `
    INSERT INTO DOCUMENT_ANALYTICS (
      id, document_id, document_type, legal_category, 
      severity_score, risk_level, risk_factors, 
      user_id, filename, num_chunks, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
  `;

  // Provide defaults for any undefined values
  const binds = [
    id, 
    documentId || 'unknown',
    documentType || 'Unknown', 
    legalCategory || 'Unknown', 
    severityScore || 0, 
    riskLevel || 'Unknown', 
    riskFactorsStr,
    userId || 'anonymous',
    filename || 'unknown',
    numChunks || 0
  ];
  
  try {
    await executeQuery(sqlText, binds);
    logger.info(`Snowflake analytics saved for document: ${documentId}`);
    return id;
  } catch (err) {
    logger.error(`Failed to save analytics to Snowflake: ${err.message}`);
    return null;
  }
};

module.exports = {
  saveAnalytics
};

const { v4: uuidv4 } = require('uuid');
const { executeQuery } = require('../config/snowflake');

/**
 * Save analytics data to Snowflake
 * Used to power dashboards for judges/admins
 * @param {object} analyticsData 
 */
const saveAnalytics = async (analyticsData) => {
  const { documentType, legalCategory, severityScore, riskLevel, userId } = analyticsData;
  const id = uuidv4();
  
  // Note: ensure DOCUMENT_ANALYTICS table is created in Snowflake
  const sqlText = `
    INSERT INTO DOCUMENT_ANALYTICS (id, document_type, legal_category, severity_score, risk_level, user_history, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
  `;
  const binds = [id, documentType, legalCategory, severityScore, riskLevel, userId];
  
  await executeQuery(sqlText, binds);
  return id;
};

module.exports = {
  saveAnalytics
};

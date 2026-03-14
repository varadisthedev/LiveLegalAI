const snowflake = require('snowflake-sdk');
const logger = require('../utils/logger');

// Disable OCSP checking — avoids common timeout issues on Windows/local dev
snowflake.configure({ ocspFailOpen: true });

let connection = null;
let isConnected = false;

/**
 * Create a single Snowflake connection (not a pool).
 * Pools cause issues on Windows and with the free tier.
 */
const connectSnowflake = () => {
  return new Promise((resolve, reject) => {
    connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT,
      username: process.env.SNOWFLAKE_USERNAME,
      password: process.env.SNOWFLAKE_PASSWORD,
      database: process.env.SNOWFLAKE_DATABASE,
      schema: process.env.SNOWFLAKE_SCHEMA,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    });

    connection.connect((err, conn) => {
      if (err) {
        logger.error(`Snowflake connection failed: ${err.message}`);
        isConnected = false;
        reject(err);
      } else {
        logger.info(`Snowflake connected: ${conn.getId()}`);
        isConnected = true;
        resolve(conn);
      }
    });
  });
};

/**
 * Execute a SQL query against Snowflake
 * @param {string} sqlText - SQL statement (use ? for bind placeholders)
 * @param {Array} binds - Values to bind to the query
 * @returns {Promise<Array>} - Result rows
 */
const executeQuery = (sqlText, binds = []) => {
  return new Promise((resolve, reject) => {
    if (!connection || !isConnected) {
      reject(new Error('Snowflake is not connected.'));
      return;
    }

    connection.execute({
      sqlText,
      binds,
      complete: (err, stmt, rows) => {
        if (err) {
          logger.error(`Snowflake query failed: ${err.message}`);
          reject(err);
        } else {
          resolve(rows);
        }
      },
    });
  });
};

/**
 * Initialize Snowflake — connect and ensure tables exist.
 * Called once on server boot. Non-blocking: server continues even if Snowflake is down.
 */
const initSnowflake = async () => {
  try {
    await connectSnowflake();

    // Create the analytics table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS DOCUMENT_ANALYTICS (
        id              VARCHAR(36) PRIMARY KEY,
        document_id     VARCHAR(50),
        document_type   VARCHAR(100),
        legal_category  VARCHAR(100),
        severity_score  NUMBER(3,0),
        risk_level      VARCHAR(20),
        risk_factors    VARCHAR(1000),
        user_id         VARCHAR(100),
        filename        VARCHAR(500),
        num_chunks      NUMBER(5,0),
        created_at      TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
      )
    `);
    logger.info('Snowflake DOCUMENT_ANALYTICS table ready.');

  } catch (err) {
    logger.error(`Snowflake initialization failed: ${err.message}`);
    logger.warn('Server will continue without Snowflake. Analytics will be unavailable.');
  }
};

/**
 * Check if Snowflake is currently connected
 */
const isSnowflakeConnected = () => isConnected;

module.exports = {
  connectSnowflake,
  executeQuery,
  initSnowflake,
  isSnowflakeConnected,
};

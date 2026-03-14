const snowflake = require('snowflake-sdk');

const connectionPool = snowflake.createPool(
  {
    account: process.env.SNOWFLAKE_ACCOUNT,
    username: process.env.SNOWFLAKE_USERNAME,
    password: process.env.SNOWFLAKE_PASSWORD,
    database: process.env.SNOWFLAKE_DATABASE,
    schema: process.env.SNOWFLAKE_SCHEMA,
    warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  },
  {
    max: 10,
    min: 0,
  }
);

/**
 * Execute a query against Snowflake pool
 * @param {string} sqlText 
 * @param {Array} binds 
 * @returns {Promise<Array>}
 */
const executeQuery = (sqlText, binds = []) => {
  return new Promise((resolve, reject) => {
    connectionPool.use(async (clientConnection) => {
      clientConnection.execute({
        sqlText,
        binds,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Failed to execute statement due to the following error: ' + err.message);
            reject(err);
          } else {
            resolve(rows);
          }
        },
      });
    });
  });
};

module.exports = {
  connectionPool,
  executeQuery,
};

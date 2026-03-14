require('dotenv').config();
const { connectSnowflake, executeQuery } = require('./config/snowflake');

async function checkSnowflake() {
  try {
    const conn = await connectSnowflake();
    console.log("Connected. Querying...");
    const rows = await executeQuery('SELECT * FROM DOCUMENT_ANALYTICS ORDER BY created_at DESC LIMIT 5');
    console.log("Found rows:", rows.length);
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSnowflake();

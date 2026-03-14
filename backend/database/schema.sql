-- Only maintaining the Analytics table now as Chat and Document history moved to Mongo
-- and Embeddings moved to Qdrant.

CREATE OR REPLACE TABLE DOCUMENT_ANALYTICS (
  id VARCHAR(36) PRIMARY KEY,
  document_type VARCHAR(100),
  legal_category VARCHAR(100),
  severity_score INT,
  risk_level VARCHAR(50),
  user_history VARCHAR(255),
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

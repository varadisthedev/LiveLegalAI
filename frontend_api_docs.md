# LiveLegal AI — Frontend API Integration Guide

> **IMPORTANT FOR FRONTEND TEAM**: 
> You should **ONLY** communicate with the Express JS backend (Port `5000`). 
> Do **NOT** call the Python RAG service directly. The Express backend handles all database storage (MongoDB + Snowflake) and securely proxies requests to the RAG service.

## 🔒 Authentication
All endpoints require a mock user ID for the hackathon. 
Pass this in the headers of **Every Request**:
```json
{
  "x-user-id": "user_12345" 
}
```

---

## 1. Document Upload
Uploads a document, parses it into vector chunks, and creates a pending record in MongoDB.

* **URL**: `POST /api/document/upload`
* **Headers**: `x-user-id: <user_id>`
* **Content-Type**: `multipart/form-data`
* **Body**:
  * [document](file:///C:/Users/varad/Desktop/LiveLegalAI/rag_service/core/document_registry.py#88-91): The file object (PDF or DOCX limit 10MB)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "65f01...d8",           // MongoDB Document ID
    "documentId": "doc_xyz123",   // RAG Vector ID (Save this!)
    "filename": "notice.pdf",
    "numChunks": 4,
    "message": "Document ingested successfully."
  },
  "error": null
}
```

---

## 2. Document Analysis (Dashboard Data)
This triggers the AI to analyze the document. It returns the summary, risk factors (for the chart), and suggested reply.
> *Note: This endpoint also automatically saves the BI data to Snowflake internally!*

* **URL**: `POST /api/chat/analyze`
* **Headers**: `x-user-id: <user_id>`, `Content-Type: application/json`
* **Body**:
```json
{
  "document_id": "doc_xyz123"  // The RAG ID from the upload response
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_xyz123",
    "summary": "This is a formal copyright infringement notice...",
    "explanation": "You are required to take down the video listed...",
    "suggested_reply": "Dear Legal Team, I have received your notice...",
    "severity_score": 85,
    "risk_level": "High",
    "document_type": "Copyright / DMCA Strike",
    "risk_factors": [
      { "label": "Lawsuit / litigation", "points": 40, "category": "legal_action" },
      { "label": "Monetary demand", "points": 15, "category": "financial" }
    ]
  },
  "error": null
}
```

---

## 3. Chat with Document (AI Chatbot)
Ask a specific question about the uploaded document.

* **URL**: `POST /api/chat/chat`
* **Headers**: `x-user-id: <user_id>`, `Content-Type: application/json`
* **Body**:
```json
{
  "document_id": "doc_xyz123",
  "question": "What is the exact deadline to respond?"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "document_id": "doc_xyz123",
    "question": "What is the exact deadline to respond?",
    "answer": "You must respond within 14 days, by March 28...",
    "sources_used": 3,
    "context_snippets": [
      "REQUIRED ACTION: You must respond within 14 days..."
    ]
  },
  "error": null
}
```

---

## 4. Get User Document History
Retrieves all documents the user has uploaded (for the sidebar/dashboard list).

* **URL**: `GET /api/document/history`
* **Headers**: `x-user-id: <user_id>`

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f01...",
      "documentId": "doc_xyz123",
      "originalName": "notice.pdf",
      "analyzed": true,
      "documentType": "Copyright / DMCA Strike",
      "severityScore": 85,
      "riskLevel": "High",
      "createdAt": "2024-03-14T10:00:00.000Z"
    }
  ],
  "error": null
}
```

---

## 5. Get User Chat History
Retrieves all past chatbot interactions for the user. Useful for rendering previous messages when they open a document.

* **URL**: `GET /api/chat/history`
* **Headers**: `x-user-id: <user_id>`

**Success Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f02...",
      "documentId": "doc_xyz123",
      "question": "What is the exact deadline to respond?",
      "response": "You must respond within 14 days...",
      "responseType": "rag_chat",
      "createdAt": "2024-03-14T10:05:00.000Z"
    }
  ],
  "error": null
}
```

---

## Typical Frontend React Flow:
1. User uploads a file 👉 Call `POST /api/document/upload`. Save `documentId` to state.
2. User clicks "Analyze" 👉 Call `POST /api/chat/analyze` using the `documentId`.
3. Dashboard renders the severity chart taking the array from `response.data.risk_factors`.
4. User types in chat box 👉 Call `POST /api/chat/chat` using `documentId` and `question`.
5. Chat UI maps over `response.data.context_snippets` to show sources below the AI message.

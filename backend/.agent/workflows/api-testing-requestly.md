---
description: How to test the AI Legal Agent APIs using Requestly API Client
---

# API Testing Workflow (Requestly)

This guide takes you step-by-step through testing every route in the AI Legal Agent backend using the **Requestly API Client** (or any similar tool like Postman).

## Prerequisites
1. Ensure your server is running (`npm start`) on `http://localhost:5000`.
2. Ensure you have your environment variables set up correctly (`MONGODB_URI`, Keys, etc.).

---

## 1. Setup Requestly Authorization
Since the backend relies on the frontend to pass the user's ID, you just need to set up a global header in Requestly:
1. Open Requestly API Client and create a new Workspace/Collection for "Legal AI".
2. At the Collection level (or on each request natively), go to the **Headers** tab.
3. Add a new Header:
   - **Key**: `x-user-id`
   - **Value**: `user_12345` (Or any dummy string you want to use to group your chat history!)

---



## 2. Upload & Analyze Document (OCR + Scoring)
**Route**: `POST http://localhost:5000/api/document/upload`

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/document/upload`
3. **Body** (Form-Data):
   - **Key**: `document` (Change the type from "Text" to "File")
   - **Value**: Select an image or PDF of a legal document (e.g., an eviction notice).
4. **Send**. The response will take a few seconds as OpenAI Vision analyzes it. It will return the `documentType`, `legalCategory`, `severityScore`, and `recommendedActions`.

---

## 4. Retrieve Document History
**Route**: `GET http://localhost:5000/api/document/history`

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/document/history`
3. **Send**. You will see an array of all documents you previously uploaded.

---

## 5. Get Specific Document
**Route**: `GET http://localhost:5000/api/document/:id`

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/document/YOUR_DOCUMENT_ID` (Replace with the `_id` from the history request).
3. **Send**. It returns the specific document details.

---

## 6. Text Chat / Legal RAG Pipeline
**Route**: `POST http://localhost:5000/api/chat/text`

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/chat/text`
3. **Headers**: `Content-Type: application/json`
4. **Body** (Raw JSON):
```json
{
  "question": "What is the penalty for rash driving in India?",
  "responseStyle": "detailed", 
  "history": []
}
```
*Note: `responseStyle` can be: `"brief"`, `"detailed"`, or `"bullet_points"`.*
5. **Send**. The system retrieves context from Qdrant, builds the prompt, calls OpenAI, and returns the generated answer.

---

## 7. Chat History
**Route**: `GET http://localhost:5000/api/chat/history`

1. **Method**: `GET`
2. **URL**: `http://localhost:5000/api/chat/history`
3. **Send**. Returns an array of your previous chats, tracking both `question` and `response`.

---

## 8. Voice Chat Pipeline (ElevenLabs)
**Route**: `POST http://localhost:5000/api/voice/chat`

1. **Method**: `POST`
2. **URL**: `http://localhost:5000/api/voice/chat`
3. **Headers**: `Content-Type: application/json`
4. **Body** (Raw JSON):
```json
{
  "question": "Can you summarize my rights as a consumer?",
  "responseStyle": "brief"
}
```
5. **Send**. 
   - **IMPORTANT IN REQUESTLY**: This endpoint returns a continuous `audio/mpeg` stream. Requestly usually attempts to download the result as a file or play it as a base64 buffer. 
   - Check the **Headers** in the response. You will see `X-Text-Answer` which contains the Base64 encoded text answer that was read aloud!

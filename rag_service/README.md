# LiveLegal AI — RAG Microservice

A **Python FastAPI microservice** implementing Retrieval-Augmented Generation (RAG) for legal document analysis.

Built for hackathon speed — **explicit, modular, and extremely easy to debug**.

---

## Architecture Overview

```
              Express.js Backend
                     │
                     │ HTTP (JSON / multipart)
                     ▼
              ┌─────────────────┐
              │   FastAPI App   │  main.py
              │   api/routes.py │
              └────────┬────────┘
                       │
          ┌────────────┴─────────────┐
          │       core/              │
          │  rag_pipeline.py         │  ←── orchestrates everything
          │  ├── document_parser.py  │  parse PDF/DOCX
          │  ├── text_cleaner.py     │  clean noise
          │  ├── chunker.py          │  sliding-window split
          │  ├── embeddings.py       │  SentenceTransformers / OpenAI
          │  ├── vector_store.py     │  FAISS (per-document index)
          │  ├── retriever.py        │  cosine similarity search
          │  └── severity_scoring.py │  rule-based 0–100 score
          └──────────────────────────┘
```

---

## Quick Start

### 1. Prerequisites

- Python 3.11+
- An **Anthropic API key** (Claude)
- _(Optional)_ An OpenAI API key (for higher-quality embeddings)

### 2. Set up a virtual environment

```bash
cd rag_service

# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> **Note:** The first run will download the SentenceTransformer model (~90 MB) automatically.

### 4. Configure environment

```bash
# Copy the example env file
copy .env.example .env      # Windows
cp .env.example .env        # macOS/Linux

# Edit .env and add your API key
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Run the service

```bash
python main.py
```

The service starts at **http://localhost:8000**

- **Swagger UI:** http://localhost:8000/docs
- **Health check:** http://localhost:8000/health

---

## API Endpoints

### `POST /ingest` — Upload a Document

Accepts PDF or DOCX. Returns a `document_id` for subsequent calls.

**Request:** `multipart/form-data`
```
file: <your PDF or DOCX file>
```

**Response:**
```json
{
  "document_id": "doc_a3f8c2e10b91",
  "filename": "cease_and_desist.pdf",
  "num_chunks": 18,
  "message": "Document ingested successfully."
}
```

**curl:**
```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@/path/to/legal_document.pdf"
```

---

### `POST /analyze` — Analyse a Document

Returns a plain-English summary, legal explanation, suggested reply, and severity score.

**Request:** `application/json`
```json
{
  "document_id": "doc_a3f8c2e10b91",
  "query": "What are the main legal obligations in this document?"
}
```

**Response:**
```json
{
  "document_id": "doc_a3f8c2e10b91",
  "summary": "This is a cease and desist letter from Acme Corp demanding that you stop using their trademarked logo within 14 days.",
  "explanation": "You have received a formal legal demand. The sender claims you are infringing their trademark and requires you to immediately stop using the logo. Failure to comply could lead to a lawsuit.",
  "suggested_reply": "You should immediately stop using the logo and send a written response acknowledging receipt of the letter. Consult a trademark attorney before taking any further action.",
  "severity_score": 65
}
```

**curl:**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"document_id": "doc_a3f8c2e10b91"}'
```

---

### `POST /chat` — Chat with a Document

Ask a specific question. Answer is grounded strictly in the document.

**Request:** `application/json`
```json
{
  "document_id": "doc_a3f8c2e10b91",
  "question": "What is the deadline mentioned in this notice?"
}
```

**Response:**
```json
{
  "document_id": "doc_a3f8c2e10b91",
  "question": "What is the deadline mentioned in this notice?",
  "answer": "According to the document, you must comply within 14 days of receiving this letter.",
  "sources_used": 5
}
```

**curl:**
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"document_id": "doc_a3f8c2e10b91", "question": "What is the deadline?"}'
```

---

## Severity Score Logic

The severity score (0–100) is **rule-based** and fully explainable:

| Trigger                  | Points |
|--------------------------|--------|
| Lawsuit / litigation     | +40    |
| Deadline / due date      | +20    |
| Monetary demand          | +15    |
| Copyright / DMCA strike  | +10    |
| Warning notice           | +5     |

Scores are additive and capped at 100. Each triggered rule is logged for debugging.

---

## Configuration Reference

All settings live in `.env` (copy from `.env.example`):

| Variable                    | Default                     | Description                                        |
|-----------------------------|-----------------------------|----------------------------------------------------|
| `ANTHROPIC_API_KEY`         | *(required)*                | Your Anthropic Claude API key                      |
| `CLAUDE_MODEL`              | `claude-3-5-sonnet-20241022`| Claude model version                               |
| `USE_OPENAI_EMBEDDINGS`     | `false`                     | Use OpenAI instead of SentenceTransformers         |
| `OPENAI_API_KEY`            | *(optional)*                | OpenAI key (only needed if above is `true`)        |
| `SENTENCE_TRANSFORMER_MODEL`| `all-MiniLM-L6-v2`         | Local embedding model name                         |
| `FAISS_INDEX_DIR`           | `./faiss_indexes`           | Where FAISS indexes are stored                     |
| `UPLOAD_DIR`                | `./uploaded_files`          | Temporary upload directory                         |
| `CHUNK_SIZE`                | `500`                       | Characters per chunk                               |
| `CHUNK_OVERLAP`             | `50`                        | Overlap between adjacent chunks                    |
| `TOP_K_CHUNKS`              | `5`                         | Chunks to retrieve per query                       |
| `MAX_FILE_SIZE_MB`          | `20`                        | Maximum upload file size                           |

---

## Calling from Express.js

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const RAG_URL = 'http://localhost:8000';

// 1. Ingest a document
async function ingestDocument(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  
  const res = await axios.post(`${RAG_URL}/ingest`, form, {
    headers: form.getHeaders(),
  });
  return res.data.document_id;
}

// 2. Analyse
async function analyzeDocument(documentId) {
  const res = await axios.post(`${RAG_URL}/analyze`, { document_id: documentId });
  return res.data; // { summary, explanation, suggested_reply, severity_score }
}

// 3. Chat
async function chatWithDocument(documentId, question) {
  const res = await axios.post(`${RAG_URL}/chat`, {
    document_id: documentId,
    question,
  });
  return res.data.answer;
}
```

---

## Project Structure

```
rag_service/
├── main.py                    # FastAPI app entry point
├── config.py                  # All environment variables & constants
├── logger.py                  # Centralised logging (import from here)
├── requirements.txt
├── .env.example               # Copy to .env and fill in keys
│
├── api/
│   └── routes.py              # HTTP route handlers (thin layer)
│
├── core/
│   ├── document_parser.py     # PDF (pdfplumber) + DOCX parsing
│   ├── text_cleaner.py        # Noise removal & normalisation
│   ├── chunker.py             # Sliding-window text chunker
│   ├── embeddings.py          # SentenceTransformers / OpenAI embeddings
│   ├── vector_store.py        # FAISS index save/load (per-document)
│   ├── retriever.py           # Top-K chunk retrieval + context formatting
│   ├── rag_pipeline.py        # Pipeline orchestration (ingest/analyze/chat)
│   └── severity_scoring.py    # Rule-based 0–100 severity scorer
│
├── models/
│   ├── request_models.py      # Pydantic request schemas
│   └── response_models.py     # Pydantic response schemas
│
└── utils/
    └── file_utils.py          # Upload handling, ID generation
```

---

## Troubleshooting

**`FileNotFoundError: No FAISS index found for document_id=...`**
→ You must call `/ingest` before `/analyze` or `/chat`.

**`ValueError: No text could be extracted from this PDF`**
→ The PDF is likely scanned (image-based). Use a text-based PDF or run OCR first.

**`ANTHROPIC_API_KEY is not set`**
→ Create a `.env` file from `.env.example` and set your key.

**First run is slow**
→ SentenceTransformer model (`all-MiniLM-L6-v2`, ~90 MB) is downloading. This only happens once.

---

## Design Principles

- **No hidden pipelines** — every step is an explicit function call
- **Observable** — every major step is logged with `[INFO]` messages
- **Modular** — swap any module (e.g. FAISS → Pinecone) without touching others
- **Human-debuggable** — read `rag_pipeline.py` top-to-bottom and you understand everything
- **AI-agent friendly** — each file has a clear responsibility; easy for agents to extend

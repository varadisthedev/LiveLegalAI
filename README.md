# LiveLegalAI — Minimal Overview

LiveLegalAI is a small multi-service project for document-grounded legal analysis. It consists of:

- `frontend/` — React + Vite UI (Clerk auth) for upload, history, analysis, and settings.
- `backend/` — Node/Express API that stores metadata, proxies to the RAG service, and handles uploads and reports.
- `rag_service/` — Python FastAPI service that ingests documents, creates per-document FAISS indexes, and runs retrieval + generation.

Quick start (development):

1. Start the RAG service (Python):

```bash
cd rag_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

2. Start the backend (Node):

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

3. Start the frontend:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Key notes:
- The backend expects a user identifier via the `x-user-id` header for protected routes.
- The RAG service performs text extraction, chunking, embeddings, and FAISS index management per `document_id`.
- PDFs/DOCs uploaded via the frontend are ingested by the RAG service and then referenced by the backend.

Where to look:
- Frontend pages: `frontend/src/pages/`
- Backend controllers: `backend/controllers/`
- RAG core pipeline: `rag_service/core/`

If you want a deeper developer guide, say which area (frontend/backend/rag_service) you'd like expanded and I'll add concise run / debug steps.

# LiveLegalAI — Minimal Overview

LiveLegalAI is a small multi-service project for document-grounded legal analysis. It consists of:

- `frontend/` — Next.js (App Router, TypeScript) UI for upload, history, analysis, chat, and settings. Auth via NextAuth (credentials + Google OAuth), Tailwind CSS + shadcn/ui, feature-based folder structure.
- `backend/` — Node/Express API with its own JWT auth (bcrypt-hashed passwords + Google ID token verification), that stores metadata, proxies to the RAG service, and handles uploads and reports.
- `rag_service/` — Python FastAPI service that ingests documents, creates per-document FAISS indexes, and runs retrieval + generation. Only PDF and DOCX are parsed.

Quick start (development), in three separate terminals:

1. RAG service (Python):

```bash
cd rag_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python main.py
```

2. Backend (Node):

```bash
cd backend
npm install
copy .env.example .env   # fill in JWT_SECRET, GOOGLE_CLIENT_ID, MONGODB_URI, etc.
npm run dev
```

3. Frontend (Next.js):

```bash
cd frontend
npm install
copy .env.example .env.local   # fill in NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, etc.
npm run dev
```

Key notes:
- Auth is JWT-only: the Express backend issues its own token on register/login/Google sign-in (`/api/auth/*`), and every protected API route (`requireAuth` middleware) verifies it via `Authorization: Bearer <token>`. NextAuth on the frontend wraps that same backend token in its session — it never uses a Google-native token for API calls.
- Google OAuth requires a Google Cloud OAuth Client ID/Secret (redirect URI `http://localhost:3000/api/auth/callback/google` in dev), shared between `frontend/.env.local` (`GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`) and `backend/.env` (`GOOGLE_CLIENT_ID` only — used to verify token audience).
- The RAG service performs text extraction, chunking, embeddings, and FAISS index management per `document_id`. It only supports PDF and DOCX uploads.
- PDFs/DOCs uploaded via the frontend are ingested by the RAG service and then referenced by the backend.

Where to look:
- Frontend routes: `frontend/src/app/`; feature code: `frontend/src/features/`
- Backend controllers: `backend/controllers/`; auth: `backend/controllers/authController.js`, `backend/middleware/authMiddleware.js`
- RAG core pipeline: `rag_service/core/`


## For deployment using a VPS:
1. git clone the repo, then edit root .env (real domain + email) and each service's .env 
2. Point the domain's DNS A record at the VPS IP.
3. docker compose up -d --build
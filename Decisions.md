# Decisions.md

Architectural and operational decisions made while setting up production deployment for LiveLegalAI. Each entry records what was decided, why, and what it trades off — so future changes can be made with the same context instead of re-deriving it.

---

## Deployment architecture

**Decision:** Single `docker-compose.yaml` at repo root running four containers — `caddy`, `frontend`, `backend`, `rag_service` — on one internal Docker bridge network. Only `caddy` publishes ports to the host (80/443); `frontend`/`backend`/`rag_service` use `expose` only and are reachable solely from other containers on that network.

**Why:** The user is deploying to a single Ubuntu VPS and explicitly asked for the easiest viable setup, with no prior Caddy experience. Caddy gets automatic Let's Encrypt HTTPS from a two-line config (no manual cert/renewal management, no separate certbot container). Keeping `rag_service` off the public internet entirely is also a real security requirement, not just convenience — see the "rag_service has no request-level auth" entry below.

**How to apply:** Any new backend-facing service should join the `livelegalai` network and stay off the host port map; only add a route in `Caddyfile` if it needs to be reachable from the browser.

---

## Reverse proxy routing

**Decision:** `Caddyfile` routes `/api/*`, `/docs*`, `/health` to `backend:5000`; everything else to `frontend:3000`. `rag_service` gets no public route at all.

**Why:** The Express backend already mounts its own routes under `/api/*` (see `backend/app.js`), so path-based routing at the proxy layer needed no backend code changes. `rag_service` is designed for server-to-server calls only (its own `main.py` comment: "no need for cors... server <-> server communication") and was never meant to be internet-facing.

---

## Environment variable / build-time split

**Decision:** `NEXT_PUBLIC_BACKEND_URL` lives in two places — the root `.env` (read by `docker-compose.yaml` as a build `arg`, baked into the client JS bundle at `docker compose build` time) and `frontend/.env.local` (read at container runtime). Both must be set to the same public origin (`https://<DOMAIN>`).

**Why:** Next.js inlines `NEXT_PUBLIC_*` variables into the browser bundle during `next build`, not at container start — a runtime-only env var would leave the browser bundle with an empty string. `src/lib/api-client.ts` (client-side, via `next-auth/react`) and `src/lib/auth.ts` (server-side, in NextAuth callbacks) both read this single var, so no client/server URL split was needed — the public origin works for both since Caddy proxies `/api/*` back to `backend` either way.

**How to apply:** Any future `NEXT_PUBLIC_*` variable needs the same treatment: add it to the root `.env`, wire it as a `build.args` entry in `docker-compose.yaml`, and add an `ARG`/`ENV` pair in `frontend/Dockerfile`'s builder stage before `npm run build`.

---

## Internal service URLs use Docker DNS, not localhost

**Decision:** `backend/api_express/.env`'s `RAG_SERVICE_URL` is `http://rag_service:8000` (not `localhost`); `backend/rag-api_python/.env`'s `MASTER_BACKEND_URL` is `http://backend:5000`. `FRONTEND_URL` (used for CORS in `app.js`) and `NEXTAUTH_URL`/`NEXT_PUBLIC_BACKEND_URL` are the public `https://<DOMAIN>` — those cross the browser, so they can't be internal service names.

**Why:** Inside Docker Compose's default network, `localhost` inside one container never reaches another container — Compose gives each service a DNS name matching its service key. This is a common first-deploy failure mode, so it's called out explicitly here.

---

## Fixed while touching these files

- `backend/.env`'s `MONGODB_URI` had a malformed query string (`?appName=backend-legal?directConnection=false&...` — two `?` in one URI, invalid syntax). Fixed to a single `?` followed by `&`-joined params. This would very likely have broken or degraded the Atlas connection.
- `backend/.env` had a `//cloudinary : ...` comment using JS-style `//` instead of `#`. `docker compose`'s env-file parser rejects this outright (`unexpected character "/" in variable name`) — `docker compose config` failed until this was fixed. Env files are not JS; only `#` starts a comment.
- `rag_service/.env.example` was missing `INTERNAL_API_KEY`, `MASTER_BACKEND_URL`, `ENVIRONMENT`, and `PORT` entries that the real `.env` (and `main.py`, which hard-requires `MASTER_BACKEND_URL` at startup) actually needs — the example was out of sync with what the app requires to boot. Added them.
- Generated a real random value for `INTERNAL_API_KEY` in `rag_service/.env` (was the literal placeholder string `your-long-random-secret`). Not currently enforced by any code path — see the health/security section below.

---

## Health checks

**Decision — backend `GET /health` is a liveness check, not a readiness check.** It returns HTTP 200 as long as the Express process can respond at all. Dependency state (MongoDB connection, RAG service reachability) is reported inside the JSON body (`status: "ok" | "degraded"`), not via the HTTP status code.

**Why:** `backend/config/mongodb.js`'s `connectDB()` already has an explicit design decision baked in — it does not exit on a failed Mongo connection, specifically so the RAG-proxy endpoints keep working even if MongoDB/Atlas is briefly unreachable (see the comment in that file: "Do NOT exit — keep serving RAG endpoints even if MongoDB is unavailable"). Making `/health` return 503 on a Mongo outage would contradict that: `docker-compose.yaml` uses `depends_on: condition: service_healthy` to gate startup order, and a hard-failing health check would make `frontend`/`caddy` refuse to start (or Docker report the container "unhealthy") over exactly the kind of transient outage the app was already built to tolerate.

`RAG_SERVICE_URL` health check uses a 2-second timeout via `AbortController` so a hung `rag_service` can't stall the backend's own health check (and by extension, anything gated on `depends_on: condition: service_healthy`).

`/health` is registered before `globalLimiter` and `cors` in `app.js` — it's a system endpoint (Docker healthcheck, uptime monitors), not user traffic, and must stay reachable even if a client IP is being rate-limited.

**Decision — rag_service `GET /health` IS a readiness check.** It returns HTTP 503 when a hard dependency is down: FAISS/upload directories aren't writable, or no LLM provider (`ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`GEMINI_API_KEY`) is configured at all, or `USE_OPENAI_EMBEDDINGS=true` without an `OPENAI_API_KEY`.

**Why the asymmetry with backend:** `rag_service` has no equivalent "keep serving in a degraded state" design — every one of its endpoints (`/ingest`, `/analyze`, `/chat`) hard-requires writable storage and at least one working LLM provider to do anything useful. A 503 here is accurate: the service genuinely cannot serve its purpose, so it's correct for `depends_on: condition: service_healthy` to block on it and for Docker to report it unhealthy.

**Decision — Docker `HEALTHCHECK` instructions use inline `node -e` / `python -c` scripts instead of installing `curl`/`wget`.** `node:20-alpine`'s BusyBox `wget` support is inconsistent across image variants, and `python:3.11-slim` (Debian) has neither `curl` nor `wget` preinstalled — adding either would mean an extra `apt-get install` layer. Both runtimes can make an HTTP request with zero extra dependencies.

**Decision — frontend has no dedicated `/health` API route**, only a Docker `HEALTHCHECK` that GETs `/` and accepts any status `< 500`. Not building a dedicated health endpoint was a scope call — only "Express and Python backend" health checks were requested; the Next.js app has no meaningful backend dependencies of its own to report on (it talks to `backend`, which already has its own health check).

---

## Security

A manual audit (Mongoose/repository layer, Express routes/validators/middleware, FastAPI routes, and the filesystem-backed FAISS store) found and fixed the following. Checked with a passing syntax/import check and a manual exploit-payload test against the fixed validators — not a full test suite.

**Fixed — NoSQL operator injection via `document_id`, enabling cross-tenant document access (highest severity finding).** `POST /api/chat/analyze` and `POST /api/chat/chat` (`backend/controllers/chatController.js`) read `document_id` straight off `req.body` with no validation — `chatRoutes.js` never applied any validator to these routes (`validators/chatValidator.js`'s `validateChat` existed but was never wired in). A body like `{"document_id": {"$ne": null}, "question": "x"}` reaches Mongoose as a literal query object. The critical path is `documentRepository.findDocumentByDocumentId` (used by `ragProxyService.ensureDocumentIndexed` to auto-reindex on a cache miss), which has **no `userId` scope by design** ("regardless of owner" — it's meant to be called with a trusted, already-resolved ID). `{documentId: {$ne: null}}` matches an arbitrary document belonging to *any* user, and the code then downloads that document's file from Cloudinary server-side. `findDocumentByDocumentIdForUser` (used first, scoped by `userId`) is lower severity alone but still returns whichever of the *caller's own* documents happens to match first, regardless of the `document_id` they claimed to want.
  - Fixed: `chatValidator.js` gained `validateDocumentId`, requiring `document_id` to be a string matching `^[A-Za-z0-9_-]{1,64}$` (the format both this backend and `rag_service` actually generate) — rejects objects, Mongo operators, and path-traversal characters in one check. Wired into both routes in `chatRoutes.js`.
  - Also fixed (defense-in-depth): `documentRepository.js`'s three `documentId`-keyed functions (`findDocumentByDocumentId`, `findDocumentByDocumentIdForUser`, `updateDocumentByDocumentId`) now throw if `documentId` isn't a non-empty string, so a future caller that skips route-level validation still can't build an operator-injected filter.

**Fixed — path traversal via `document_id` reaching the filesystem, `rag_service`.** `document_id` is used unsanitized in `os.path.join()` in three places: `utils/file_utils.py`'s `save_upload_file` (`UPLOAD_DIR/{document_id}.{ext}`) and `core/vector_store.py`'s `_index_path`/`_chunks_path` (`FAISS_INDEX_DIR/{document_id}.index` etc). `POST /ingest` accepts an optional client-supplied `document_id` as a plain form field with no format check — Pydantic wasn't even in play there since it's a `Form(None)`, not a request-model field. (On the two JSON-body endpoints, Pydantic's bare `str` type on `AnalyzeRequest`/`ChatRequest.document_id` blocks *objects* but not traversal strings like `"../../etc/passwd"` — a `str` is a `str` regardless of content.)
  - Fixed: added `validate_document_id()` in `utils/file_utils.py` (regex `^[A-Za-z0-9_-]{1,64}$`, same pattern as the Express-side check) and call it in `/ingest` before a client-supplied `document_id` is used. Added `pattern=` to the `document_id` `Field()` on `AnalyzeRequest`/`ChatRequest` in `models/request_models.py`, so FastAPI 422s malformed IDs before pipeline code ever runs. Also added the same `validate_document_id()` call inside `vector_store.py`'s `_index_path`/`_chunks_path` directly — the actual filesystem boundary — so any future internal caller that bypasses the API layer is still covered.

**Fixed — error responses could leak internal error messages.** `backend/middleware/errorMiddleware.js` sent `err.message` to the client for *any* thrown error, not just deliberate `AppError`s — a raw Mongoose `CastError`, driver error, or unexpected exception's message (which can describe internal field/query shape) went straight to the response.
  - Fixed: `errorHandler` now only passes `err.message` through as-is for `err instanceof AppError` (or in non-production, for debugging); anything else is masked to a generic `"Internal Server Error"` in production. The full error is still logged server-side either way — no change to logging.

**Fixed — Content-Disposition header value built from an unsanitized client-supplied filename.** `documentController.js`'s `downloadReport` built `Content-Disposition: attachment; filename="${doc.originalName}.pdf"` directly from the uploaded file's original name (fully attacker-controlled at upload time). A `"` in the filename breaks out of the quoted parameter, letting a client influence how the header is parsed (a real, if low-severity, issue — Node's `http` module already blocks literal CR/LF in header values, so this isn't a raw header-injection/response-splitting vector, but the quote-breakout was live).
  - Fixed: strip `"`, `\r`, `\n` from `originalName` before it goes into the header value.

**Confirmed already safe — no change needed:**
- Auth brute-force protection: `authLimiter` (10/15min per IP) is correctly wired to `/api/auth/register`, `/login`, and `/google` in `authRoutes.js`.
- Password handling: `bcrypt.hash`/`bcrypt.compare` via `bcryptjs`, salt rounds from `BCRYPT_SALT_ROUNDS` (env-configured, defaults to 12); no plaintext password ever logged or returned.
- JWT: `jsonwebtoken`'s `jwt.verify(token, process.env.JWT_SECRET)` — no `algorithms` allowlist is passed explicitly, but `jsonwebtoken` only accepts `HS256` by default unless a public key object is passed (it isn't here), so an attacker cannot force `alg: none`. Secret sourced from env only.
- Google OAuth: `google-auth-library`'s `verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })` — audience is checked, so a token issued for a different Google client can't be replayed here.
- File upload validation: `multer` config (`uploadMiddleware.js`) enforces a size limit (`MAX_UPLOAD_SIZE`, default 10MB) and an extension+mimetype allowlist (images/PDF/DOCX) via `fileFilter`. `rag_service`'s own `/ingest` independently re-validates the extension (`ALLOWED_EXTENSIONS = {pdf, docx}`) and enforces `MAX_FILE_SIZE_MB` while streaming to disk in 64KB chunks (no full-file memory load) — so a malicious or buggy backend can't bypass the RAG service's own limits either.
- SSRF: the only server-initiated fetch from a stored URL (`ensureDocumentIndexed` downloading `docMongo.fileUrl`) always downloads from a Cloudinary `secure_url` that the backend itself generated during upload (`cloudinary.uploader.upload_stream`) — never a client-supplied URL, so there's no attacker-controlled fetch target.
- XSS / PDF generation: `pdfkit`'s `.text()` calls render literal glyphs, not markup — user-supplied text (summary, filenames, etc.) can't inject formatting or break out of the document structure.
- CORS: `app.js` sets a single static `origin` from `FRONTEND_URL` (no reflection of the request's `Origin` header), and `credentials` is not enabled — consistent with the app using `Authorization: Bearer` tokens rather than cookies, so there's no cross-site-cookie exposure to guard against.

**Architectural finding, not fixed — flagged as a decision, not a bug:** `rag_service` enforces **no request-level authentication** on any endpoint (`/ingest`, `/analyze`, `/chat`, `/documents*`). `main.py` requires `MASTER_BACKEND_URL` to be set at startup, and `rag_service/.env` already has an `INTERNAL_API_KEY`, but neither is actually checked on incoming requests anywhere in `api/routes.py` — `INTERNAL_API_KEY` is currently a generated-but-unused value. Today this is mitigated entirely by network topology: `docker-compose.yaml` only publishes `caddy`'s ports, so `rag_service` is unreachable from outside the `livelegalai` Docker network, and `Caddyfile` gives it no public route. That's a real boundary, but it means `rag_service`'s security posture is *entirely* dependent on the Docker network staying correctly configured — anyone who runs it standalone (`docker run -p 8000:8000 ...`), misconfigures `docker-compose.yaml`, or gets a foothold in any other container on the same network has unauthenticated access to ingest/analyze/chat against every document. Given `INTERNAL_API_KEY` already exists as a value, wiring it as a shared-secret header check (`backend` sends it, `rag_service` rejects requests without it) would be a small, low-risk addition — left undone pending a call on whether that's worth doing now versus staying network-isolation-only.

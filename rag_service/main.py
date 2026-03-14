"""
main.py
-------
FastAPI application entry point.

This file wires together:
  - The FastAPI app instance
  - CORS middleware (so the Express.js backend can call this service)
  - The API router from api/routes.py
  - Startup / shutdown event handlers
  - Uvicorn runner (for `python main.py` invocation)

KEEP THIS FILE THIN.
All business logic lives in core/ and api/routes.py.
"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router
from config import APP_TITLE, APP_VERSION, APP_DESCRIPTION, FAISS_INDEX_DIR, UPLOAD_DIR
from logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.

    Using a factory function makes it easy to spin up the app in tests
    with different configurations.
    """
    app = FastAPI(
        title=APP_TITLE,
        version=APP_VERSION,
        description=APP_DESCRIPTION,
        docs_url="/docs",        # Swagger UI at http://localhost:8000/docs
        redoc_url="/redoc",      # ReDoc UI at http://localhost:8000/redoc
    )

    # -----------------------------------------------------------------------
    # CORS — allow the Express.js backend (and local dev frontends) to call us
    # -----------------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],          # Restrict to your Express.js domain in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # -----------------------------------------------------------------------
    # Mount the API router (all routes live in api/routes.py)
    # -----------------------------------------------------------------------
    app.include_router(router)

    # -----------------------------------------------------------------------
    # Startup events — ensure required directories exist
    # -----------------------------------------------------------------------
    @app.on_event("startup")
    async def on_startup():
        os.makedirs(FAISS_INDEX_DIR, exist_ok=True)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        logger.info(f"RAG Microservice starting up — {APP_TITLE} v{APP_VERSION}")
        logger.info(f"FAISS index directory : {FAISS_INDEX_DIR}")
        logger.info(f"Upload directory      : {UPLOAD_DIR}")
        logger.info("All systems ready. API docs available at http://localhost:8000/docs")

    @app.on_event("shutdown")
    async def on_shutdown():
        logger.info("RAG Microservice shutting down — goodbye!")

    return app


# ---------------------------------------------------------------------------
# Application instance (used by uvicorn when launched as a module)
# ---------------------------------------------------------------------------
app = create_app()


# ---------------------------------------------------------------------------
# Run directly with: python main.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # Railway passes the assigned port in the PORT environment variable.
    # We default to 8000 for local development.
    port = int(os.environ.get("PORT", "8000"))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=False,         # Turn off reload for production stability
        log_level="info",
    )

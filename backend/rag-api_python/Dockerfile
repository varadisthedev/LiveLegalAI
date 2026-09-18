FROM python:3.11-slim

WORKDIR /app

# libgomp1 is required at runtime by torch/faiss (OpenMP), not present on slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p faiss_indexes uploaded_files

EXPOSE 8000

# /health returns HTTP 503 when a hard dependency (writable storage, a
# configured LLM provider) is down — urlopen raises on non-2xx, which fails
# the check, so this doubles as a readiness probe, not just liveness.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=4)" || exit 1

CMD ["python", "main.py"]

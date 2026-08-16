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
CMD ["python", "main.py"]

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download FinBERT model to avoid first-run delay (optional - adds ~400MB to image)
# RUN python -c "from transformers import AutoModelForSequenceClassification, AutoTokenizer; \
#     AutoTokenizer.from_pretrained('ProsusAI/finbert'); \
#     AutoModelForSequenceClassification.from_pretrained('ProsusAI/finbert')"

# Copy app
COPY app ./app

# Create models directory for FinBERT cache
RUN mkdir -p ./models

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Run with reload disabled for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


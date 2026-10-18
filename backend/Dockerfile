# ==============================================================================
# TerraGuard AI Backend — Multi-Architecture Containerfile
# Targets: linux/s390x (IBM LinuxONE / zSystems) & linux/amd64
# ==============================================================================

FROM --platform=$TARGETPLATFORM python:3.11-slim-bookworm AS builder

WORKDIR /app

# Install system dependencies required for geospatial libraries and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Final Production Stage
FROM --platform=$TARGETPLATFORM python:3.11-slim-bookworm AS runner

LABEL maintainer="TerraGuard AI Engineering Team - IBM LinuxONE Datathon"
LABEL description="TerraGuard AI Backend Service on IBM LinuxONE (s390x)"

WORKDIR /app

# Install runtime runtime libraries (libpq for PostGIS/PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed wheels and site-packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create unprivileged application user for OpenShift / LinuxONE security compliance
RUN useradd -u 1001 -m -s /bin/bash terraguard && \
    chown -R terraguard:terraguard /app

# Copy application code
COPY --chown=terraguard:terraguard app ./app
COPY --chown=terraguard:terraguard scripts ./scripts
COPY --chown=terraguard:terraguard .env.example ./.env

USER 1001

EXPOSE 8000

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    ENVIRONMENT=production \
    PORT=8000 \
    HOST=0.0.0.0 \
    IS_LINUXONE=true

HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

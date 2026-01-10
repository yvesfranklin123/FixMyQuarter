# --- Étape 1 : Builder (Compilation) ---
FROM python:3.10-slim as builder

WORKDIR /app

# Installation des outils système nécessaires pour compiler (gcc, libpq...)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Création du venv
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Étape 2 : Runtime (Image finale) ---
FROM python:3.10-slim

WORKDIR /app

# Installation des libs runtime minimales (ffmpeg pour vidéo, poppler pour PDF, clamav pour virus)
RUN apt-get update && apt-get install -y \
    libpq5 \
    ffmpeg \
    poppler-utils \
    clamav \
    && rm -rf /var/lib/apt/lists/*

# Copie de l'environnement virtuel depuis le builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Configuration Python
ENV PYTHONPATH=/app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copie du code source
COPY . .

# On expose le port (doc seulement, docker-compose gère le mapping)
EXPOSE 8000

# Commande par défaut (peut être surchargée par docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
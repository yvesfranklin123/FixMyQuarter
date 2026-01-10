#!/bin/bash
set -e

# Usage: ./deploy_workers.sh [NUMBER_OF_INSTANCES]
REPLICAS=${1:-1} # Par défaut : 1 worker

echo "👷 Scaling Celery Workers to $REPLICAS instances..."

# Vérification que Docker est lancé
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running."
  exit 1
fi

# Scaling via Docker Compose
# --no-recreate : Ne redémarre pas ceux qui tournent déjà
# --scale : Multiplie le service 'worker' défini dans docker-compose.yml
docker-compose up -d --scale worker=$REPLICAS --no-recreate

echo "✅ Workers scaled successfully."
echo "📊 Current status:"
docker-compose ps worker
#!/bin/bash
set -e

BACKUP_DIR="./data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="db_backup_${TIMESTAMP}.sql.gz"

# Création du dossier si inexistant
mkdir -p $BACKUP_DIR

echo "📦 Starting Backup..."

# Dump compressé
docker-compose exec -T db pg_dump -U postgres nexus_db | gzip > "$BACKUP_DIR/$FILENAME"

echo "✅ Backup saved to $BACKUP_DIR/$FILENAME"

# Nettoyage des vieux backups (+7 jours)
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned."
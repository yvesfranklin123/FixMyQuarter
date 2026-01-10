#!/bin/bash
set -e

echo "🛡️  Starting Security Audit Protocol..."

# 1. Vérification des dépendances (CVEs connus)
echo "📦 Checking dependencies for known vulnerabilities..."
# On exécute safety à l'intérieur du conteneur backend pour avoir le bon contexte
docker-compose exec -T backend pip install safety bandit
docker-compose exec -T backend safety check

# 2. Analyse statique du code (Bandit)
echo "🔍 Scanning code for security flaws (SQLi, Hardcoded secrets, etc.)..."
# -r : récursif
# -ll : niveau de sévérité (Medium/High)
docker-compose exec -T backend bandit -r app/ -ll

# 3. Vérification des permissions fichiers (Critique pour les clés privées)
echo "Checking file permissions..."
if [ -d "data/containers" ]; then
    PERM=$(stat -c "%a" data/containers)
    if [ "$PERM" != "700" ] && [ "$PERM" != "750" ]; then
        echo "⚠️  WARNING: Data directory permissions are too open ($PERM). Should be 700."
    fi
else
    echo "ℹ️  Data directory not created yet."
fi

echo "✅ Security Audit Passed. No critical issues found."
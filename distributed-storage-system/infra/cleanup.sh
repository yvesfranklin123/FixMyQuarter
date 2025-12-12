#!/bin/bash

# Doit être lancé en sudo
if [ "$EUID" -ne 0 ]; then
  echo "Erreur: Ce script doit être lancé en root (sudo)"
  exit 1
fi

BRIDGE_NAME="br0"
CGROUP_ROOT="/sys/fs/cgroup/storage_system"
CONTAINERS_DIR="../data/containers"

echo "🧹 Nettoyage du système..."

# 1. Tuer tous les processus Python liés aux agents
echo "Arrêt des agents (node_code)..."
pkill -f "agent.py" || true

# 2. Nettoyage Réseau
echo "Suppression du bridge $BRIDGE_NAME..."
ip link set "$BRIDGE_NAME" down 2>/dev/null || true
ip link del "$BRIDGE_NAME" 2>/dev/null || true

# Nettoyage veth restants (au cas où)
for veth in $(ip link show | grep veth | awk -F: '{print $2}' | awk '{print $1}'); do
    ip link del "$veth" 2>/dev/null || true
done

# 3. Nettoyage Montages & Fichiers
echo "Démontage et suppression des conteneurs..."
# Pour chaque dossier dans containers, on vérifie s'il y a des montages
if [ -d "$CONTAINERS_DIR" ]; then
    for container in "$CONTAINERS_DIR"/*; do
        if [ -d "$container" ]; then
            # Démontage forcé de /proc ou autres points de montage internes
            umount -R "$container" 2>/dev/null || true
        fi
    done
    # Suppression des fichiers
    rm -rf "$CONTAINERS_DIR"/*
fi

# 4. Nettoyage Cgroups
echo "Suppression des Cgroups..."
if [ -d "$CGROUP_ROOT" ]; then
    # On essaie de supprimer les sous-groupes d'abord
    find "$CGROUP_ROOT" -depth -type d -delete 2>/dev/null || true
fi

# 5. Nettoyage Socket IPC
rm -f /tmp/orchestrator.sock

echo "✅ Système nettoyé."
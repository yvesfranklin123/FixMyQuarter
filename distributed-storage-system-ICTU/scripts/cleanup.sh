#!/bin/bash

# Vérification Root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Erreur: Ce script doit être lancé en root (sudo ./cleanup.sh)"
  exit 1
fi

BRIDGE_NAME="br0"
CGROUP_ROOT="/sys/fs/cgroup/nexus_storage" # Nom unique pour éviter les conflits
CONTAINERS_DIR="../data/containers"

echo "🧹 === NETTOYAGE DU SYSTÈME === 🧹"

# 1. Tuer les processus Agents
echo "☠️  Arrêt des processus 'agent.py'..."
pkill -f "agent.py" || echo "   Aucun agent en cours."

# 2. Nettoyage Réseau
echo "🌐 Suppression du bridge $BRIDGE_NAME..."
ip link set "$BRIDGE_NAME" down 2>/dev/null || true
ip link del "$BRIDGE_NAME" 2>/dev/null || true

# Nettoyage des interfaces virtuelles (veth) orphelines
echo "   Suppression des interfaces veth..."
for veth in $(ip link show | grep veth | awk -F: '{print $2}' | awk '{print $1}'); do
    ip link del "$veth" 2>/dev/null
done

# 3. Démontage et Suppression des Conteneurs
echo "📂 Nettoyage des conteneurs dans $CONTAINERS_DIR..."
if [ -d "$CONTAINERS_DIR" ]; then
    # Démontage récursif de tout ce qui pourrait être monté (proc, sys...)
    # grep -v évite de démonter le disque principal par erreur
    mount | grep "$CONTAINERS_DIR" | awk '{print $3}' | sort -r | xargs -r umount -f
    
    # Suppression des fichiers
    rm -rf "$CONTAINERS_DIR"/*
fi

# 4. Nettoyage Cgroups (Limites CPU/RAM)
echo "⚡ Suppression des Cgroups..."
if [ -d "$CGROUP_ROOT" ]; then
    find "$CGROUP_ROOT" -depth -type d -delete 2>/dev/null || true
    rmdir "$CGROUP_ROOT" 2>/dev/null || true
fi

# 5. Nettoyage Sockets
rm -f /tmp/orchestrator.sock
rm -f /tmp/nexus_*.sock

echo "✅ Système propre."
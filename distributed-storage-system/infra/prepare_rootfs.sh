#!/bin/bash
set -e

# Configuration
ROOTFS_DIR="../data/rootfs_base"
ALPINE_VERSION="3.19.1"
ARCH="x86_64"
ALPINE_URL="https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/${ARCH}/alpine-minirootfs-${ALPINE_VERSION}-${ARCH}.tar.gz"

# Couleurs pour le logging
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}[*] Préparation du RootFS de base...${NC}"

# Création du dossier cible
if [ -d "$ROOTFS_DIR" ]; then
    echo "Le dossier $ROOTFS_DIR existe déjà. Suppression..."
    rm -rf "$ROOTFS_DIR"
fi
mkdir -p "$ROOTFS_DIR"

# Téléchargement
echo -e "${GREEN}[*] Téléchargement d'Alpine Linux ${ALPINE_VERSION}...${NC}"
wget -q "$ALPINE_URL" -O alpine.tar.gz

# Extraction
echo -e "${GREEN}[*] Extraction du système de fichiers...${NC}"
tar -xzf alpine.tar.gz -C "$ROOTFS_DIR"

# Nettoyage archive
rm alpine.tar.gz

# Configuration DNS
echo -e "${GREEN}[*] Configuration du DNS (resolv.conf)...${NC}"
cp templates/resolv.conf "$ROOTFS_DIR/etc/resolv.conf"

# Installation de Python 3 (Nécessaire pour l'agent)
# On utilise chroot pour exécuter apk à l'intérieur du rootfs
echo -e "${GREEN}[*] Installation de Python 3 et dépendances dans le RootFS...${NC}"

# Copie temporaire du resolv.conf de l'hôte pour avoir internet durant le build
cp /etc/resolv.conf "$ROOTFS_DIR/etc/resolv.conf"

# Montage de /proc pour que apk fonctionne
mount -t proc /proc "$ROOTFS_DIR/proc"

# Installation
chroot "$ROOTFS_DIR" /sbin/apk add --no-cache python3 py3-pip

# Démontage de /proc
umount "$ROOTFS_DIR/proc"

# Restauration du resolv.conf template
cp templates/resolv.conf "$ROOTFS_DIR/etc/resolv.conf"

# Création des dossiers nécessaires
mkdir -p "$ROOTFS_DIR/app"
mkdir -p "$ROOTFS_DIR/storage"

echo -e "${GREEN}[OK] RootFS prêt dans $ROOTFS_DIR${NC}"
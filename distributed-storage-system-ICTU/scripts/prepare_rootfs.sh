#!/bin/bash
set -e

# Configuration
# On remonte d'un cran (..) car le script est dans /scripts/
ROOTFS_DIR="../data/rootfs_base"
ALPINE_VERSION="3.19.1"
ARCH="x86_64"
ALPINE_URL="https://dl-cdn.alpinelinux.org/alpine/v3.19/releases/${ARCH}/alpine-minirootfs-${ALPINE_VERSION}-${ARCH}.tar.gz"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[*] Préparation du RootFS de base...${NC}"

# 1. Nettoyage préventif
if [ -d "$ROOTFS_DIR" ]; then
    echo "⚠️  Le dossier $ROOTFS_DIR existe déjà. Suppression..."
    # Protection contre la suppression accidentelle de /
    if [ "$ROOTFS_DIR" == "/" ]; then exit 1; fi
    sudo rm -rf "$ROOTFS_DIR"
fi
mkdir -p "$ROOTFS_DIR"

# 2. Téléchargement
echo -e "${GREEN}[*] Téléchargement d'Alpine Linux ${ALPINE_VERSION}...${NC}"
wget -q "$ALPINE_URL" -O alpine.tar.gz

# 3. Extraction
echo -e "${GREEN}[*] Extraction du système de fichiers...${NC}"
sudo tar -xzf alpine.tar.gz -C "$ROOTFS_DIR"
rm alpine.tar.gz

# 4. Configuration DNS (Copie depuis l'hôte ou template)
echo -e "${GREEN}[*] Configuration du DNS...${NC}"
# Si le template n'existe pas, on utilise celui de l'hôte
if [ -f "templates/resolv.conf" ]; then
    sudo cp templates/resolv.conf "$ROOTFS_DIR/etc/resolv.conf"
else
    echo "   Template non trouvé, copie de /etc/resolv.conf"
    sudo cp /etc/resolv.conf "$ROOTFS_DIR/etc/resolv.conf"
fi

# 5. Installation de Python 3 (Via Chroot)
echo -e "${GREEN}[*] Installation de Python 3 et PIP dans le RootFS...${NC}"

# Montage temporaire de /proc pour que apk fonctionne
sudo mount -t proc /proc "$ROOTFS_DIR/proc"

# Exécution de l'installation DANS le dossier cible
sudo chroot "$ROOTFS_DIR" /sbin/apk add --no-cache python3 py3-pip py3-grpcio py3-protobuf

# Nettoyage
sudo umount "$ROOTFS_DIR/proc"

# 6. Création des dossiers de l'application
sudo mkdir -p "$ROOTFS_DIR/app"
sudo mkdir -p "$ROOTFS_DIR/data_storage"

echo -e "${BLUE}[OK] RootFS prêt dans $ROOTFS_DIR${NC}"
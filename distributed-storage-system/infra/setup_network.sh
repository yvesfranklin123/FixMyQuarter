#!/bin/bash
set -e

# Doit être lancé en sudo
if [ "$EUID" -ne 0 ]; then
  echo "Erreur: Ce script doit être lancé en root (sudo)"
  exit 1
fi

# Configuration (Doit matcher le .env)
BRIDGE_NAME="br0"
GATEWAY_IP="10.10.0.1"
SUBNET_CIDR="10.10.0.1/24"
# Interface physique principale (ex: eth0 ou wlan0) - Détection automatique
PHYSICAL_IFACE=$(ip route get 1.1.1.1 | awk '{print $5; exit}')

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[*] Configuration du réseau pour le Stockage Distribué...${NC}"
echo "Interface physique détectée : $PHYSICAL_IFACE"

# 1. Activation du Forwarding IP (Routage)
echo "Activation IP Forwarding..."
sysctl -w net.ipv4.ip_forward=1 > /dev/null

# 2. Création du Bridge
if ip link show "$BRIDGE_NAME" > /dev/null 2>&1; then
    echo "Le bridge $BRIDGE_NAME existe déjà."
else
    echo "Création du bridge $BRIDGE_NAME..."
    ip link add name "$BRIDGE_NAME" type bridge
fi

# 3. Assignation IP Gateway
echo "Configuration IP Gateway $GATEWAY_IP..."
# On supprime l'ancienne IP si elle existe pour éviter les doublons
ip addr flush dev "$BRIDGE_NAME"
ip addr add "$SUBNET_CIDR" dev "$BRIDGE_NAME"
ip link set "$BRIDGE_NAME" up

# 4. Configuration NAT (Masquerade) avec IPTables
echo "Configuration du NAT (iptables)..."

# Nettoyage des anciennes règles NAT liées à ce subnet
iptables -t nat -D POSTROUTING -s "${SUBNET_CIDR%/*}/24" ! -d "${SUBNET_CIDR%/*}/24" -j MASQUERADE 2>/dev/null || true

# Ajout de la règle
iptables -t nat -A POSTROUTING -s "${SUBNET_CIDR%/*}/24" ! -d "${SUBNET_CIDR%/*}/24" -j MASQUERADE

# Accepter le forwarding entre le bridge et l'interface physique
iptables -A FORWARD -i "$BRIDGE_NAME" -o "$PHYSICAL_IFACE" -j ACCEPT
iptables -A FORWARD -i "$PHYSICAL_IFACE" -o "$BRIDGE_NAME" -j ACCEPT

echo -e "${GREEN}[OK] Réseau prêt : $BRIDGE_NAME ($GATEWAY_IP) -> NAT -> $PHYSICAL_IFACE${NC}"
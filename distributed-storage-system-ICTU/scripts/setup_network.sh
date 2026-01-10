#!/bin/bash
set -e

# Configuration
BRIDGE="br0"
GATEWAY_IP="10.10.0.1/24"

# Codes couleurs
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}=== 🌐 Configuration du Réseau Distribué ===${NC}"

# 1. Vérifier si le bridge existe déjà
if ip link show "$BRIDGE" > /dev/null 2>&1; then
    echo "✅ Le bridge $BRIDGE existe déjà."
else
    echo "🛠️  Création du bridge $BRIDGE..."
    
    # Création de l'interface bridge
    sudo ip link add name "$BRIDGE" type bridge
    
    # Activation
    sudo ip link set "$BRIDGE" up
    
    # Assignation de l'IP Gateway (La porte de sortie pour les nœuds)
    sudo ip addr add "$GATEWAY_IP" dev "$BRIDGE"
    
    echo "✅ Bridge $BRIDGE créé et configuré ($GATEWAY_IP)."
fi

# 2. Activer le forwarding IP (Essentiel pour le NAT)
echo "🔄 Activation de l'IP Forwarding..."
sudo sysctl -w net.ipv4.ip_forward=1 > /dev/null

# 3. Règle NAT (Masquerading) pour que les nœuds aient accès à Internet
echo "🛡️  Configuration du NAT (iptables)..."
# Note: On suppose que l'interface internet principale est eth0 ou wlan0. 
# Cette commande attrape tout ce qui sort.
if ! sudo iptables -t nat -C POSTROUTING -s 10.10.0.0/24 ! -d 10.10.0.0/24 -j MASQUERADE 2>/dev/null; then
    sudo iptables -t nat -A POSTROUTING -s 10.10.0.0/24 ! -d 10.10.0.0/24 -j MASQUERADE
    echo "✅ NAT activé pour 10.10.0.0/24"
fi

echo -e "${GREEN}=== 🚀 Réseau Prêt ! ===${NC}"
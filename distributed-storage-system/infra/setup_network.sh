#!/bin/bash

# Configuration
BRIDGE="br0"
GATEWAY_IP="10.10.0.1/24"

echo "=== Configuration du Réseau Distribué ==="

# 1. Vérifier si le bridge existe déjà
if ip link show $BRIDGE > /dev/null 2>&1; then
    echo "✅ Le bridge $BRIDGE existe déjà."
else
    echo "🛠️ Création du bridge $BRIDGE..."
    # Création de l'interface bridge
    sudo ip link add name $BRIDGE type bridge
    # On l'allume
    sudo ip link set $BRIDGE up
    # On lui donne l'adresse IP de la passerelle (Gateway)
    sudo ip addr add $GATEWAY_IP dev $BRIDGE
    echo "✅ Bridge $BRIDGE créé et configuré ($GATEWAY_IP)."
fi

# 2. Activer le forwarding IP (pour que les packets circulent)
echo "🔄 Activation de l'IP Forwarding..."
sudo sysctl -w net.ipv4.ip_forward=1 > /dev/null

echo "=== Prêt à accueillir des nœuds ! ==="
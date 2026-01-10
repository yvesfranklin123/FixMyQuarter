#!/bin/bash
# Usage: ./restore_node.sh <NODE_ID_TO_RESTORE>

NODE_ID=$1

if [ -z "$NODE_ID" ]; then
    echo "Usage: $0 <node_id>"
    exit 1
fi

echo "🚑 Initiating Recovery Protocol for Node: $NODE_ID"

# Appel à l'API Admin pour lancer la reconstruction
# On suppose que l'API a un endpoint pour ça
curl -X POST http://localhost:8000/api/v1/admin/nodes/$NODE_ID/recover \
     -H "Authorization: Bearer $ADMIN_TOKEN"

echo "\n⏳ Recovery task triggered in background."
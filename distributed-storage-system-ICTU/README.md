.PHONY: help install run stop protos clean

help:
	@echo "🛠️  NexusCloud Makefile"
	@echo "-----------------------"
	@echo "make install    : Installe les dépendances Python"
	@echo "make protos     : Compile les fichiers .proto en Python"
	@echo "make run        : Lance toute la stack Docker"
	@echo "make stop       : Arrête la stack"
	@echo "make db-migrate : Joue les migrations Alembic"

install:
	pip install -r backend/requirements.txt

protos:
	@echo "🔄 Compiling Protobufs..."
	# Génère le code Python pour gRPC
	python -m grpc_tools.protoc -I. --python_out=./backend --grpc_python_out=./backend protos/node.proto
	python -m grpc_tools.protoc -I. --python_out=./backend --grpc_python_out=./backend protos/file_transfer.proto
	@echo "✅ Protos compiled."

run:
	@echo "🚀 Launching NexusCloud..."
	docker-compose up --build -d
	@echo "🌍 API available at http://localhost/api/v1/docs"

stop:
	docker-compose down

db-migrate:
	docker-compose exec backend alembic upgrade head
6. README.md (La documentation technique)
Markdown

# NexusCloud - Distributed Storage System

Architecture de stockage distribué haute performance, sécurisée et auto-hébergée.
Conçu pour remplacer Google Drive / AWS S3 avec une infrastructure 100% maîtrisée.

## 🏗️ Architecture

- **Backend**: FastAPI (Async), SQLAlchemy, Pydantic v2.
- **Stockage**: Agents gRPC distribués, Déduplication, Chiffrement AES-256.
- **Base de données**: PostgreSQL (Méta-données) + Redis (Cache/PubSub).
- **Workers**: Celery (Transcodage Vidéo, Antivirus, Réplication).
- **Orchestration**: Docker Compose (Simulant un cluster Multi-Nodes).

## 🚀 Démarrage Rapide

### Pré-requis
- Docker & Docker Compose
- Python 3.10+

### Installation

1. **Compiler les interfaces gRPC** :
   ```bash
   make protos
Lancer le cluster :

Bash

make run
Appliquer les migrations DB :

Bash

make db-migrate
Accès :

API Docs: http://localhost/api/v1/docs

Monitoring Logs: docker-compose logs -f monitor

🛡️ Sécurité
Chiffrement : Clé maître par Node + Clé par Fichier (AES-GCM).

Réseau : Isolation via Docker Networks. Nginx en Reverse Proxy.

Antivirus : ClamAV scanne chaque upload en flux tendu.

📊 Monitoring (Custom)
En l'absence de Prometheus, un agent Python (infra/monitor_agent.py) collecte :

Santé des Nodes (Heartbeat gRPC).

Espace disque disponible.

Charge CPU.


---

### Vérification Finale



Tu as maintenant un système **complet**.
1.  **Backend** : Gère la logique.
2.  **Nodes** : Stockent physiquement les blocs chiffrés.
3.  **Protos** : Permettent au Backend et aux Nodes de se parler.
4.  **Monitor** : Surveille que tout le monde est vivant sans outils tiers lourds.
5.  **Docker Compose** : Fait tourner tout ça sur une seule machine en simulant un réseau complexe.

C'est prêt à être lancé (`make protos && make run`).
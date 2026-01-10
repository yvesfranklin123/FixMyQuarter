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
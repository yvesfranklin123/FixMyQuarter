.PHONY: all install install-backend install-frontend setup-infra run-orchestrator run-webapp run-frontend run-workers test clean help

PYTHON = python3
PIP = pip3
NPM = npm

BACKEND_DIR = backend
FRONTEND_DIR = frontend
INFRA_DIR = infra

all: help

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && $(PIP) install -e .

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

setup-infra:
	@echo "Setting up infrastructure (requires sudo)..."
	cd $(INFRA_DIR) && sudo chmod +x *.sh
	cd $(INFRA_DIR) && sudo ./prepare_rootfs.sh
	cd $(INFRA_DIR) && sudo ./setup_network.sh

run-orchestrator:
	@echo "Starting Orchestrator Daemon (requires sudo)..."
	cd $(BACKEND_DIR) && sudo $(PYTHON) -m app.orchestrator.daemon

run-webapp:
	@echo "Starting FastAPI Webapp..."
	cd $(BACKEND_DIR) && $(PYTHON) -m uvicorn app.webapp.main:app --reload --host 0.0.0.0 --port 8000

run-frontend:
	@echo "Starting Next.js Frontend..."
	cd $(FRONTEND_DIR) && $(NPM) run dev

run-workers:
	@echo "Starting Background Workers..."
	cd $(BACKEND_DIR) && celery -A app.workers.celery_app worker --loglevel=info

test: test-backend

test-backend:
	cd $(BACKEND_DIR) && pytest

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".next" -exec rm -rf {} +
	find . -type d -name "node_modules" -exec rm -rf {} +
	cd $(INFRA_DIR) && sudo ./cleanup.sh

help:
	@echo "Available commands:"
	@echo "  make install           - Install backend and frontend dependencies"
	@echo "  make setup-infra       - Prepare rootfs and network bridge (sudo)"
	@echo "  make run-orchestrator  - Run the system daemon (sudo)"
	@echo "  make run-webapp        - Run the API server"
	@echo "  make run-frontend      - Run the Next.js dev server"
	@echo "  make run-workers       - Run background tasks"
	@echo "  make test              - Run backend tests"
	@echo "  make clean             - Remove artifacts and cleanup nodes (sudo)"
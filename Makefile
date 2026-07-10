# Goald Dev Container Makefile
# Build and deploy the development container for Goald React Native/Expo app

.PHONY: help build up down logs shell test lint typecheck preflight clean dev expo-start expo-doctor expo-doctor-ci

# Default target
.DEFAULT_GOAL := help

# Configuration
DEVCONTAINER_DIR := .devcontainer
CONTAINER_NAME := goald-devcontainer
WORKSPACE := /workspaces/Goald
DOCKER_COMPOSE := docker compose -f $(DEVCONTAINER_DIR)/docker-compose.yml

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

help: ## Show this help message
	@echo "$(GREEN)Goald Dev Container Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# =============================================================================
# Container Lifecycle
# =============================================================================

build: ## Build the dev container image
	@echo "$(GREEN)Building dev container...$(NC)"
	docker build -t $(CONTAINER_NAME) -f $(DEVCONTAINER_DIR)/Dockerfile .

up: ## Start the dev container in detached mode
	@echo "$(GREEN)Starting dev container...$(NC)"
	$(DOCKER_COMPOSE) up -d

down: ## Stop and remove the dev container
	@echo "$(YELLOW)Stopping dev container...$(NC)"
	$(DOCKER_COMPOSE) down

restart: down up ## Restart the dev container

logs: ## Show container logs
	$(DOCKER_COMPOSE) logs -f

shell: ## Open a shell in the running container
	$(DOCKER_COMPOSE) exec app bash

shell-root: ## Open a root shell in the running container
	$(DOCKER_COMPOSE) exec -u root app bash

# =============================================================================
# Development Commands (run inside container)
# =============================================================================

dev: ## Start Expo development server (runs in container)
	@echo "$(GREEN)Starting Expo dev server...$(NC)"
	$(DOCKER_COMPOSE) exec app npx expo start --dev-client --tunnel

expo-start: ## Alias for dev
	$(MAKE) dev

expo-doctor: ## Run Expo Doctor to diagnose issues
	$(DOCKER_COMPOSE) exec app npx expo-doctor

expo-doctor-ci: ## Run Expo Doctor in CI mode
	$(DOCKER_COMPOSE) exec app npx expo-doctor --ci

# =============================================================================
# Development Tasks (run inside container)
# =============================================================================

install: ## Install npm dependencies in container
	$(DOCKER_COMPOSE) exec app npm install

install-ci: ## Install dependencies with npm ci
	$(DOCKER_COMPOSE) exec app npm ci

test: ## Run tests in container
	$(DOCKER_COMPOSE) exec app npm test

test-watch: ## Run tests in watch mode
	$(DOCKER_COMPOSE) exec app npm test -- --watch

test-ci: ## Run tests in CI mode
	$(DOCKER_COMPOSE) exec app npm test -- --ci --coverage

lint: ## Run ESLint in container
	$(DOCKER_COMPOSE) exec app npm run lint

lint-fix: ## Run ESLint with auto-fix
	$(DOCKER_COMPOSE) exec app npm run lint -- --fix

typecheck: ## Run TypeScript type checking
	$(DOCKER_COMPOSE) exec app npm run typecheck

preflight: ## Run preflight checks (lint + typecheck + test)
	$(DOCKER_COMPOSE) exec app npm run preflight

# =============================================================================
# Build Commands
# =============================================================================

build-android: ## Build Android APK (requires EAS)
	$(DOCKER_COMPOSE) exec app eas build --platform android --profile preview

build-ios: ## Build iOS app (requires EAS + Apple account)
	$(DOCKER_COMPOSE) exec app eas build --platform ios --profile preview

build-all: ## Build for all platforms
	$(DOCKER_COMPOSE) exec app eas build --platform all --profile preview

# =============================================================================
# Utility Commands
# =============================================================================

clean: ## Clean up containers, volumes, and images
	@echo "$(RED)Cleaning up dev container resources...$(NC)"
	$(DOCKER_COMPOSE) down -v --remove-orphans
	docker volume rm goald-node-modules goald-expo-cache 2>/dev/null || true
	docker rmi $(CONTAINER_NAME) 2>/dev/null || true

clean-all: ## Clean everything including node_modules in workspace
	$(MAKE) clean
	rm -rf node_modules package-lock.json

status: ## Show container status
	@echo "$(GREEN)Container Status:$(NC)"
	@docker ps -a --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

ports: ## Show forwarded ports
	@echo "$(GREEN)Forwarded Ports:$(NC)"
	@docker port $(CONTAINER_NAME) 2>/dev/null || echo "Container not running"

# =============================================================================
# CI/CD Helpers
# =============================================================================

ci-build: ## Build container for CI
	docker build -t $(CONTAINER_NAME):ci -f $(DEVCONTAINER_DIR)/Dockerfile .

ci-test: ## Run full test suite in CI container
	docker run --rm -v $(PWD):$(WORKSPACE) -w $(WORKSPACE) $(CONTAINER_NAME):ci npm ci && npm run preflight

# =============================================================================
# Development Workflow Shortcuts
# =============================================================================

setup: build up install ## Full setup: build, start, install deps
	@echo "$(GREEN)Setup complete! Run 'make dev' to start Expo.$(NC)"

reset: clean setup ## Full reset: clean and rebuild everything

# Quick commands for common workflows
logs-expo: ## Show Expo-specific logs
	$(DOCKER_COMPOSE) exec app tail -f ~/.expo/logs/*.log 2>/dev/null || echo "No Expo logs found"

# =============================================================================
# Environment & Debugging
# =============================================================================

env: ## Show environment variables in container
	$(DOCKER_COMPOSE) exec app env | sort

doctor: ## Run Expo Doctor and show diagnostics
	$(MAKE) expo-doctor

debug: ## Open debug shell with all tools
	$(DOCKER_COMPOSE) exec app bash -c "echo '=== Node ===' && node --version && echo '=== NPM ===' && npm --version && echo '=== Expo ===' && npx expo --version && echo '=== Android SDK ===' && echo $$ANDROID_HOME && ls $$ANDROID_HOME/platforms 2>/dev/null || echo 'Not found'"
COMPOSE=docker compose
SERVICE=discopanel

BASE_DIR=/home/user/discopanel
DATA_DIR=$(BASE_DIR)/data
BACKUPS_DIR=$(BASE_DIR)/backups
TMP_DIR=$(BASE_DIR)/tmp
SERVERS_DIR=$(DATA_DIR)/servers

TAILSCALE_FLAG=/tmp/tailscale_installed

.PHONY: up down restart logs ps pull setup-dirs fix-perms \
        tailscale-check tailscale-up env

## Start all services
up: tailscale-check tailscale-up setup-dirs env
	$(COMPOSE) up -d

## Create or update .env with PORT and Tailscale IP
env:
	@echo "Generating .env file..."
	@./scripts/create_env.sh

## Create required directories if they don't exist
setup-dirs:
	@echo "Ensuring required directories exist..."
	@mkdir -p \
		$(DATA_DIR)/servers \
		$(BACKUPS_DIR) \
		$(TMP_DIR)

## Check and install Tailscale only once
tailscale-check:
	@if command -v tailscale >/dev/null 2>&1; then \
		echo "✔ Tailscale is already installed"; \
	elif [ -f $(TAILSCALE_FLAG) ]; then \
		echo "✔ Tailscale was already installed previously"; \
	else \
		echo "⏳ Installing Tailscale..."; \
		curl -fsSL https://tailscale.com/install.sh | sh && \
		touch $(TAILSCALE_FLAG); \
		echo "✅ Tailscale installed successfully"; \
	fi

## Ensure Tailscale is up and authenticated
tailscale-up:
	@tailscale status >/dev/null 2>&1 || tailscale up

## Stop all services
down:
	$(COMPOSE) down

## Restart the service
restart:
	$(COMPOSE) restart $(SERVICE)

## Follow service logs
logs:
	$(COMPOSE) logs -f $(SERVICE)

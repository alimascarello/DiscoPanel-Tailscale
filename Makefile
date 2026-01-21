COMPOSE=docker compose
SERVICE=discopanel

BASE_DIR=/home/user/discopanel
DATA_DIR=$(BASE_DIR)/data
BACKUPS_DIR=$(BASE_DIR)/backups
TMP_DIR=$(BASE_DIR)/tmp
SERVERS_DIR=$(DATA_DIR)/servers

TAILSCALE_FLAG=/tmp/tailscale_installed

.PHONY: up down restart logs ps pull setup-dirs fix-perms \
        tailscale-check tailscale-up config

config:
	@echo "Updating environment configuration..."
	@./scripts/create_config.sh

setup-dirs:
	@echo "Ensuring required directories exist..."
	@mkdir -p \
		$(SERVERS_DIR) \
		$(BACKUPS_DIR) \
		$(TMP_DIR)

tailscale-check:
	@if command -v tailscale >/dev/null 2>&1; then \
		echo "✔ Tailscale is already installed"; \
	elif [ -f $(TAILSCALE_FLAG) ]; then \
		echo "✔ Tailscale was previously installed"; \
	else \
		echo "⏳ Installing Tailscale..."; \
		curl -fsSL https://tailscale.com/install.sh | sh && \
		touch $(TAILSCALE_FLAG); \
		echo "✅ Tailscale installed successfully"; \
	fi

tailscale-up:
	@tailscale status >/dev/null 2>&1 || tailscale up

up: tailscale-check tailscale-up setup-dirs config
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

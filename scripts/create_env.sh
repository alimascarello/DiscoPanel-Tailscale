#!/usr/bin/env bash

CONFIG_PATH="public/config.json"
DEFAULT_PORT=25565

mkdir -p public

TAILSCALE_IP=$(tailscale ip -4)

if [ -z "$TAILSCALE_IP" ]; then
    echo "Error: Unable to retrieve Tailscale IPv4 address"
    exit 1
fi

if [ ! -f "$CONFIG_PATH" ]; then
    cat > "$CONFIG_PATH" <<EOF
{
  "PORT": $DEFAULT_PORT,
  "IP": "$TAILSCALE_IP",
  "SERVER_ID": "",
  "MODPACK_URL": ""
}
EOF
    echo "Created $CONFIG_PATH."
else
    TMP_FILE=$(mktemp)
    jq --arg ip "$TAILSCALE_IP" --argjson port $DEFAULT_PORT \
       '.IP = $ip | .PORT = $port' "$CONFIG_PATH" > "$TMP_FILE" && mv "$TMP_FILE" "$CONFIG_PATH"
    echo "Updated $CONFIG_PATH with IP: $TAILSCALE_IP and PORT: $DEFAULT_PORT"
fi

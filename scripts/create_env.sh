#!/usr/bin/env bash

ENV_FILE=".env"
PORT=25565

if [ -z "$1" ]; then
  echo "Usage: $0 <modpack-link>"
  exit 1
fi

LINK="$1"

if [[ ! "$LINK" =~ ^https?:// ]]; then
  echo "Error: invalid URL. Must start with http:// or https://"
  exit 1
fi

if [[ ! "$LINK" =~ (curseforge\.com/minecraft/modpacks|modrinth\.com/modpack/) ]]; then
  echo "Error: invalid link. Must be from CurseForge or Modrinth."
  exit 1
fi

if ! curl -s --head --fail "$LINK" >/dev/null; then
  echo "Error: URL does not exist or is unreachable"
  exit 1
fi

TAILSCALE_IP=$(tailscale ip -4)

if [ -z "$TAILSCALE_IP" ]; then
  echo "Error: could not retrieve Tailscale IPv4 address"
  exit 1
fi

touch "$ENV_FILE"

if ! grep -q '^PORT=' "$ENV_FILE"; then
  echo "PORT=$PORT" >> "$ENV_FILE"
fi

if grep -q '^IP=' "$ENV_FILE"; then
  sed -i "s/^IP=.*/IP=$TAILSCALE_IP/" "$ENV_FILE"
else
  echo "IP=$TAILSCALE_IP" >> "$ENV_FILE"
fi

if grep -q '^MODPACK_URL=' "$ENV_FILE"; then
  sed -i "s|^MODPACK_URL=.*|MODPACK_URL=$LINK|" "$ENV_FILE"
else
  echo "MODPACK_URL=$LINK" >> "$ENV_FILE"
fi

echo "Modpack URL saved: $LINK"

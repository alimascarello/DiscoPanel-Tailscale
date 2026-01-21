#!/usr/bin/env bash

ENV_FILE=".env"
PORT=25565

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

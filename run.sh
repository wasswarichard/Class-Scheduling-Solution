#!/usr/bin/env bash
set -euo pipefail

# Simple helper to build and start the whole stack
# Requires: docker and docker compose plugin

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "[run.sh] Building and starting containers..."
docker compose up --build

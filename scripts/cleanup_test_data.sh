#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

docker exec boxdrop-db-1 psql -U postgres -d boxdrop -f "$SCRIPT_DIR/cleanup_test_data.sql"

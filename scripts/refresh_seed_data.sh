#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
VENV_DIR="${ROOT_DIR}/.venv-seed"
PYTHON_BIN="${PYTHON_BIN:-python3}"
DB_CONTAINER="${DB_CONTAINER:-boxdrop-db-1}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command docker
require_command "$PYTHON_BIN"

if [ ! -d "${SCRIPT_DIR}/seed-images" ]; then
  echo "Missing ${SCRIPT_DIR}/seed-images. The seed image assets should be checked into the repository." >&2
  exit 1
fi

if [ ! -x "${VENV_DIR}/bin/python" ]; then
  echo "Creating local uploader virtualenv at ${VENV_DIR}"
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

if ! "${VENV_DIR}/bin/python" -c "import boto3" >/dev/null 2>&1; then
  echo "Installing boto3 into ${VENV_DIR}"
  "${VENV_DIR}/bin/pip" install boto3
fi

echo "Uploading seed images to MinIO"
"${VENV_DIR}/bin/python" "${SCRIPT_DIR}/upload_seed_images_to_minio.py"

echo "Resetting local database"
docker exec -i "$DB_CONTAINER" psql -U postgres -d boxdrop < "${SCRIPT_DIR}/reset_database.sql"

echo "Seeding local database"
docker exec -i "$DB_CONTAINER" psql -U postgres -d boxdrop < "${SCRIPT_DIR}/seed_test_sales.sql"

echo "Seed refresh complete"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

is_backend_running() {
  lsof -iTCP:8080 -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_backend() {
  local timeout_seconds="${1:-90}"
  local elapsed=0

  while [ "$elapsed" -lt "$timeout_seconds" ]; do
    if is_backend_running; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  return 1
}

BACKEND_PID=""

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "=== 1/5 Starting Docker infrastructure ==="
docker compose up -d
echo "Waiting for PostgreSQL..."
until docker exec boxdrop-db-1 pg_isready -U postgres -q 2>/dev/null; do sleep 1; done
echo "Docker services ready."

echo ""
echo "=== 2/5 Backend build + test ==="
(cd backend && ./gradlew clean build)

echo ""
echo "=== 3/5 Frontend install + unit tests ==="
(cd mobile-web && npm ci && npm test -- --ci)

echo ""
echo "=== 4/6 E2E tests (Playwright) ==="
if is_backend_running; then
  echo "Backend already running on port 8080."
else
  BACKEND_LOG="${TMPDIR:-/tmp}/boxdrop-build-backend.log"
  echo "Backend not running on port 8080. Starting backend..."
  (cd backend && ./gradlew run >"$BACKEND_LOG" 2>&1) &
  BACKEND_PID=$!
  echo "Waiting for backend on http://127.0.0.1:8080 ..."
  if ! wait_for_backend 90; then
    echo "Backend did not become ready within 90 seconds."
    echo "Start it manually with: cd backend && ./gradlew run"
    echo "Startup log: $BACKEND_LOG"
    exit 1
  fi
  echo "Backend is ready."
fi

EXISTING_WEB_PIDS="$(lsof -ti tcp:8081 2>/dev/null || true)"
if [ -n "$EXISTING_WEB_PIDS" ]; then
  echo "Stopping existing web server on port 8081..."
  kill $EXISTING_WEB_PIDS 2>/dev/null || true
  sleep 1
fi
(cd tests/e2e && npm ci && npx playwright install --with-deps chromium && npx playwright test)

echo ""
echo "=== 5/6 Cleanup test data ==="
./scripts/cleanup_test_data.sh

echo ""
echo "=== 6/6 All checks passed! ==="

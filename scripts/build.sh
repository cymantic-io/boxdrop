#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=== 1/5 Starting Docker infrastructure ==="
docker compose up -d
echo "Waiting for PostgreSQL..."
until docker exec garagesale-db-1 pg_isready -U postgres -q 2>/dev/null; do sleep 1; done
echo "Docker services ready."

echo ""
echo "=== 2/5 Backend build + test ==="
(cd backend && ./gradlew clean build)

echo ""
echo "=== 3/5 Frontend install + unit tests ==="
(cd mobile-web && npm ci && npm test -- --ci)

echo ""
echo "=== 4/5 E2E tests (Playwright) ==="
(cd tests/e2e && npm ci && npx playwright install --with-deps chromium && npx playwright test)

echo ""
echo "=== 5/5 All checks passed! ==="

#!/bin/bash

# BoxDrop Development Helper Script
# This script provides convenient commands for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${GREEN}=== $1 ===${NC}"
}

print_error() {
    echo -e "${RED}Error: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}Warning: $1${NC}"
}

get_node20_path() {
    local nvm_root="$HOME/.nvm/versions/node"

    if [ ! -d "$nvm_root" ]; then
        echo "$PATH"
        return
    fi

    local latest_node20_bin
    latest_node20_bin=$(find "$nvm_root" -maxdepth 3 -type f -path "*/v20.*/bin/node" 2>/dev/null | sort -V | tail -n 1 | xargs -I {} dirname "{}")

    if [ -n "$latest_node20_bin" ] && [ -x "$latest_node20_bin/node" ]; then
        echo "$latest_node20_bin:$PATH"
        return
    fi

    echo "$PATH"
}

require_node20() {
    local node20_path
    node20_path="$(get_node20_path)"
    local node_bin="${node20_path%%:*}/node"

    if [ ! -x "$node_bin" ]; then
        print_error "Node 20 is required for Expo tooling but was not found under ~/.nvm/versions/node."
        print_error "Install it with: nvm install 20"
        exit 1
    fi

    local node_version
    node_version="$("$node_bin" -v 2>/dev/null || true)"
    if [[ ! "$node_version" =~ ^v20\. ]]; then
        print_error "Node 20 is required for Expo tooling. Found: ${node_version:-unknown}"
        print_error "Activate it with: nvm use 20"
        exit 1
    fi
}

is_backend_running() {
    lsof -iTCP:8080 -sTCP:LISTEN &>/dev/null
}

wait_for_backend() {
    local timeout_seconds="${1:-60}"
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

ensure_backend_running() {
    if is_backend_running; then
        print_header "Backend already running on port 8080"
        BACKEND_PID=""
        return 0
    fi

    print_warning "Backend not running on port 8080, starting it..."
    local backend_log="${TMPDIR:-/tmp}/boxdrop-backend-e2e.log"
    cd backend
    ./gradlew run >"$backend_log" 2>&1 &
    BACKEND_PID=$!
    cd ..

    print_header "Backend start requested with PID: $BACKEND_PID"
    print_header "Waiting for backend on http://127.0.0.1:8080 ..."

    if wait_for_backend 90; then
        print_header "Backend is ready"
        return 0
    fi

    print_error "Backend did not become ready within 90 seconds."
    print_error "Start it manually with: cd backend && ./gradlew run"
    print_error "Startup log: $backend_log"

    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    return 1
}

# Helper functions
backend_build() {
    print_header "Building Backend"
    cd backend
    ./gradlew build
    cd ..
}

backend_start() {
    print_header "Running Backend"
    cd backend
    ./gradlew run
    cd ..
}

backend_test() {
    print_header "Testing Backend"
    cd backend
    ./gradlew test
    cd ..
}

backend_quality() {
    print_header "Running Code Quality Checks"
    cd backend
    ./gradlew detekt
    cd ..
}

backend_stop() {
    print_header "Stopping Backend Server"

    # Try to kill Gradle processes running the app
    if pkill -f "gradlew.*run" 2>/dev/null; then
        print_header "Killed Gradle run process"
    fi

    # Try killing by port 8080
    if lsof -i ":8080" &>/dev/null; then
        local pid=$(lsof -t -i ":8080")
        if [ -n "$pid" ]; then
            kill -9 "$pid" 2>/dev/null && {
                print_header "Killed process on port 8080 (PID: $pid)"
            }
        fi
    fi

    print_warning "Backend stopped"
    return 0
}

mobile_install() {
    print_header "Installing Mobile Dependencies"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm install
    cd ..
}

mobile_start() {
    print_header "Starting Expo Dev Server"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm start
    cd ..
}

mobile_android() {
    print_header "Running on Android Emulator"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm run android
    cd ..
}

mobile_ios() {
    print_header "Running on iOS Simulator"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm run ios
    cd ..
}

mobile_web() {
    print_header "Running on Web (Browser)"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm run web
    cd ..
}

mobile_test() {
    print_header "Running Mobile Tests"
    require_node20
    cd mobile-web
    PATH="$(get_node20_path)" npm test
    cd ..
}

mobile_stop() {
    print_header "Stopping Expo Dev Server"

    # Try to kill processes by name first
    if pkill -f "expo start" 2>/dev/null; then
        print_header "Killed Expo dev server process"
        return 0
    fi

    # If that didn't work, try killing node processes on common Expo ports
    local ports=(8081 19000 19001)
    local killed=false

    for port in "${ports[@]}"; do
        if lsof -i ":$port" &>/dev/null; then
            local pid=$(lsof -t -i ":$port")
            if [ -n "$pid" ]; then
                kill -9 "$pid" 2>/dev/null && {
                    print_header "Killed process running on port $port (PID: $pid)"
                    killed=true
                }
            fi
        fi
    done

    if [ "$killed" = true ]; then
        return 0
    else
        print_warning "No running Expo dev server found"
        return 0
    fi
}

e2e_test() {
    print_header "Running E2E Tests"
    ensure_backend_running || exit 1

    # Run E2E tests (Playwright will manage frontend startup via webServer config)
    cd tests/e2e
    npm ci
    npx playwright test 2>&1
    E2E_EXIT_CODE=$?
    cd ../..

    # Clean up backend if we started it
    if [ -n "$BACKEND_PID" ]; then
        print_header "Stopping backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [ $E2E_EXIT_CODE -eq 0 ]; then
        print_header "E2E tests passed!"
    else
        print_error "E2E tests failed with exit code: $E2E_EXIT_CODE"
        exit $E2E_EXIT_CODE
    fi
}

load_test() {
    print_header "Running Load Tests"
    ensure_backend_running || exit 1

    # Check if k6 is available
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install it first:"
        echo "  https://k6.io/docs/getting-started/installation/"
        exit 1
    fi

    # Run load tests
    print_header "Starting load test..."
    cd tests/load
    k6 run api_load_test.js --vus 50 --duration 5m
    LOAD_EXIT_CODE=$?
    cd ../..

    # Clean up backend if we started it
    if [ -n "$BACKEND_PID" ]; then
        print_header "Stopping backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null || true
    fi

    if [ $LOAD_EXIT_CODE -eq 0 ]; then
        print_header "Load tests completed!"
    else
        print_error "Load tests failed with exit code: $LOAD_EXIT_CODE"
        exit $LOAD_EXIT_CODE
    fi
}

docker_up() {
    print_header "Starting Docker Services"
    docker-compose up
}

docker_down() {
    print_header "Stopping Docker Services"
    docker-compose down
}

all_install() {
    print_header "Installing All Dependencies"
    backend_build
    mobile_install
}

# Main command handler
case "${1:-help}" in
    backend:build)
        backend_build
        ;;
    backend:start)
        backend_start
        ;;
    backend:stop)
        backend_stop
        ;;
    mobile:install)
        mobile_install
        ;;
    mobile:start)
        mobile_start
        ;;
    mobile:android)
        mobile_android
        ;;
    mobile:ios)
        mobile_ios
        ;;
    mobile:web)
        mobile_web
        ;;
    mobile:test)
        mobile_test
        ;;
    mobile:stop)
        mobile_stop
        ;;
    e2e:test)
        e2e_test
        ;;
    load:test)
        load_test
        ;;
    docker:up)
        docker_up
        ;;
    docker:down)
        docker_down
        ;;
    install:all)
        all_install
        ;;
    help)
        cat << 'EOF'
BoxDrop Development Helper

USAGE:
    ./dev.sh <command>

BACKEND COMMANDS:
    backend:build       Build the Kotlin backend
    backend:start       Start the backend server
    backend:stop        Stop the backend server
    backend:test        Run backend tests
    backend:quality     Run Detekt code quality checks

MOBILE COMMANDS:
    mobile:install      Install npm dependencies
    mobile:start        Start Expo dev server (interactive)
    mobile:stop         Stop Expo dev server
    mobile:android      Run on Android emulator
    mobile:ios          Run on iOS simulator
    mobile:web          Run on web browser
    mobile:test         Run Jest tests

TESTING COMMANDS:
    e2e:test            Run E2E tests (starts backend & frontend as needed)
    load:test           Run load tests with k6 (requires k6 installed)

DOCKER COMMANDS:
    docker:up           Start Docker containers
    docker:down         Stop Docker containers

INSTALLATION:
    install:all         Install all dependencies (backend & mobile)

OTHER:
    help                Show this help message
EOF
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run './dev.sh help' for available commands"
        exit 1
        ;;
esac

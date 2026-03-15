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

# Helper functions
backend_build() {
    print_header "Building Backend"
    cd backend
    ./gradlew build
    cd ..
}

backend_run() {
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

mobile_install() {
    print_header "Installing Mobile Dependencies"
    cd mobile-web
    npm install
    cd ..
}

mobile_start() {
    print_header "Starting Expo Dev Server"
    cd mobile-web
    npm start
    cd ..
}

mobile_android() {
    print_header "Running on Android Emulator"
    cd mobile-web
    npm run android
    cd ..
}

mobile_ios() {
    print_header "Running on iOS Simulator"
    cd mobile-web
    npm run ios
    cd ..
}

mobile_web() {
    print_header "Running on Web (Browser)"
    cd mobile-web
    npm run web
    cd ..
}

mobile_test() {
    print_header "Running Mobile Tests"
    cd mobile-web
    npm test
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

    # Check if backend is running on port 8080
    if ! lsof -i ":8080" &>/dev/null; then
        print_warning "Backend not running on port 8080, starting it..."
        cd backend
        ./gradlew run &
        BACKEND_PID=$!
        print_header "Backend started with PID: $BACKEND_PID"
        sleep 15  # Wait for backend to start
        cd ..
    else
        print_header "Backend already running on port 8080"
        BACKEND_PID=""
    fi

    # Check if Expo web server is running on port 8081
    if ! lsof -i ":8081" &>/dev/null; then
        print_warning "Frontend not running on port 8081, starting it..."
        cd mobile-web
        CI=1 npx expo start --web --port 8081 &
        EXPO_PID=$!
        print_header "Expo web started with PID: $EXPO_PID"
        sleep 10  # Wait for Expo to start
        cd ..
    else
        print_header "Frontend already running on port 8081"
        EXPO_PID=""
    fi

    # Run E2E tests
    cd tests/e2e
    npm ci
    npm run test 2>&1
    E2E_EXIT_CODE=$?
    cd ../..

    # Clean up services we started
    if [ -n "$EXPO_PID" ]; then
        print_header "Stopping Expo web server (PID: $EXPO_PID)"
        kill $EXPO_PID 2>/dev/null || true
    fi

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

    # Check if backend is running
    if ! lsof -i ":8080" &>/dev/null; then
        print_warning "Backend not running on port 8080, starting it..."
        cd backend
        ./gradlew run &
        BACKEND_PID=$!
        print_header "Backend started with PID: $BACKEND_PID"
        sleep 15  # Wait for backend to start
        cd ..
    else
        print_header "Backend already running on port 8080"
        BACKEND_PID=""
    fi

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
    backend:run)
        backend_run
        ;;
    backend:test)
        backend_test
        ;;
    backend:quality)
        backend_quality
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
    backend:run         Run the backend server (with debug on 5005)
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

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

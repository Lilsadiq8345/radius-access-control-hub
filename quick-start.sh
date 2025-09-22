#!/bin/bash

# RADIUS Central Management System - Quick Start Script
# This script automates the initial setup and deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied!"
}

# Function to setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from template"
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    else
        print_warning ".env file already exists. Skipping creation."
    fi
    
    print_status "Please edit .env file with your configuration before continuing."
    print_status "Required variables:"
    print_status "  - VITE_SUPABASE_URL"
    print_status "  - VITE_SUPABASE_ANON_KEY"
    print_status "  - RADIUS_SECRET"
    echo
}

# Function to build and start services
deploy_services() {
    print_status "Building and starting services..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    print_success "Services started successfully!"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 10
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "All services are running!"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
    
    # Check RADIUS API
    if curl -s http://localhost:3001/api/status >/dev/null 2>&1; then
        print_success "RADIUS API is accessible"
    else
        print_warning "RADIUS API is not accessible yet. It may take a moment to start."
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend is not accessible yet. It may take a moment to start."
    fi
}

# Function to display access information
show_access_info() {
    echo
    print_success "🎉 RADIUS Central Management System is now running!"
    echo
    echo "📱 Access Information:"
    echo "  Frontend:     http://localhost:3000"
    echo "  RADIUS API:   http://localhost:3001/api/status"
    echo "  RADIUS Auth:  localhost:1812"
    echo "  RADIUS Acct:  localhost:1813"
    echo
    echo "🔧 Management Commands:"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop:         docker-compose down"
    echo "  Restart:      docker-compose restart"
    echo "  Status:       docker-compose ps"
    echo
    echo "🧪 Testing:"
    echo "  Test page:    http://localhost:3000/test"
    echo "  API test:     curl http://localhost:3001/api/status"
    echo
    echo "📚 Documentation:"
    echo "  README:       README.md"
    echo "  Deployment:   DEPLOYMENT.md"
    echo
}

# Function to run tests
run_tests() {
    print_status "Running basic tests..."
    
    # Test RADIUS API
    if curl -s http://localhost:3001/api/status | grep -q "isRunning"; then
        print_success "RADIUS API test passed"
    else
        print_warning "RADIUS API test failed"
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 | grep -q "RADIUS"; then
        print_success "Frontend test passed"
    else
        print_warning "Frontend test failed"
    fi
}

# Function to show help
show_help() {
    echo "RADIUS Central Management System - Quick Start Script"
    echo
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  setup     - Setup environment and deploy services"
    echo "  deploy    - Deploy services only (assumes .env is configured)"
    echo "  test      - Run basic health checks"
    echo "  stop      - Stop all services"
    echo "  logs      - Show service logs"
    echo "  status    - Show service status"
    echo "  help      - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 setup    # Complete setup and deployment"
    echo "  $0 deploy   # Deploy services only"
    echo "  $0 test     # Run health checks"
    echo
}

# Main script logic
case "${1:-setup}" in
    "setup")
        echo "🚀 RADIUS Central Management System - Quick Setup"
        echo "=================================================="
        echo
        check_prerequisites
        setup_environment
        echo
        read -p "Press Enter to continue with deployment (or Ctrl+C to edit .env first)..."
        deploy_services
        check_health
        run_tests
        show_access_info
        ;;
    "deploy")
        print_status "Deploying services..."
        deploy_services
        check_health
        show_access_info
        ;;
    "test")
        run_tests
        ;;
    "stop")
        print_status "Stopping services..."
        docker-compose down
        print_success "Services stopped"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "status")
        docker-compose ps
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac

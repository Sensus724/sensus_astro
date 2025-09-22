#!/bin/bash

# Sensus Production Deployment Script
# This script handles the complete deployment process for Sensus

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sensus"
DOCKER_REGISTRY="your_registry.com"
DOCKER_IMAGE="$DOCKER_REGISTRY/$APP_NAME"
DOCKER_TAG="${1:-latest}"
ENVIRONMENT="${2:-production}"
DEPLOY_DIR="/opt/sensus"
BACKUP_DIR="/opt/sensus/backups"
LOG_FILE="/var/log/sensus-deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if user is in docker group
    if ! groups $USER | grep -q docker; then
        error "User $USER is not in the docker group"
    fi
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    if [ -d "$DEPLOY_DIR" ]; then
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup current deployment
        cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$BACKUP_NAME"
        
        # Keep only last 5 backups
        cd "$BACKUP_DIR"
        ls -t | tail -n +6 | xargs -r rm -rf
        
        success "Backup created: $BACKUP_NAME"
    else
        warning "No existing deployment found, skipping backup"
    fi
}

# Pull latest image
pull_image() {
    log "Pulling latest Docker image..."
    
    docker pull "$DOCKER_IMAGE:$DOCKER_TAG" || error "Failed to pull Docker image"
    success "Docker image pulled successfully"
}

# Build application
build_application() {
    log "Building application..."
    
    # Build Docker image
    docker build -t "$DOCKER_IMAGE:$DOCKER_TAG" . || error "Failed to build Docker image"
    
    # Tag as latest
    docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE:latest"
    
    success "Application built successfully"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Create deployment directory
    mkdir -p "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
    
    # Copy configuration files
    cp /path/to/source/docker-compose.prod.yml ./docker-compose.yml
    cp /path/to/source/production.env ./.env
    cp /path/to/source/nginx.conf ./nginx.conf
    cp /path/to/source/prometheus.yml ./prometheus.yml
    cp /path/to/source/redis.conf ./redis.conf
    
    # Update environment variables
    sed -i "s/DOCKER_TAG/$DOCKER_TAG/g" docker-compose.yml
    
    # Stop existing containers
    docker-compose down || warning "No existing containers to stop"
    
    # Start new containers
    docker-compose up -d || error "Failed to start containers"
    
    success "Application deployed successfully"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        error "Some containers are not running"
    fi
    
    # Check application health
    if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
        error "Application health check failed"
    fi
    
    # Check Nginx
    if ! curl -f http://localhost/health > /dev/null 2>&1; then
        error "Nginx health check failed"
    fi
    
    success "Health checks passed"
}

# Run tests
run_tests() {
    log "Running production tests..."
    
    # Run smoke tests
    docker-compose exec sensus-app npm run test:smoke || error "Smoke tests failed"
    
    success "Tests passed"
}

# Update monitoring
update_monitoring() {
    log "Updating monitoring configuration..."
    
    # Reload Prometheus configuration
    docker-compose exec monitoring promtool reload-config || warning "Failed to reload Prometheus config"
    
    # Restart Grafana
    docker-compose restart grafana || warning "Failed to restart Grafana"
    
    success "Monitoring updated"
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    
    # Remove unused images
    docker image prune -f || warning "Failed to prune images"
    
    # Remove unused volumes
    docker volume prune -f || warning "Failed to prune volumes"
    
    success "Cleanup completed"
}

# Send notifications
send_notifications() {
    log "Sending deployment notifications..."
    
    # Send Slack notification
    if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Sensus deployment completed successfully! Version: $DOCKER_TAG\"}" \
            "$SLACK_WEBHOOK_URL" || warning "Failed to send Slack notification"
    fi
    
    # Send Discord notification
    if [ ! -z "$DISCORD_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"content\":\"🚀 Sensus deployment completed successfully! Version: $DOCKER_TAG\"}" \
            "$DISCORD_WEBHOOK_URL" || warning "Failed to send Discord notification"
    fi
    
    success "Notifications sent"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current containers
    docker-compose down
    
    # Restore from backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    if [ ! -z "$LATEST_BACKUP" ]; then
        cp -r "$BACKUP_DIR/$LATEST_BACKUP"/* "$DEPLOY_DIR/"
        cd "$DEPLOY_DIR"
        docker-compose up -d
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment function
main() {
    log "Starting Sensus deployment..."
    log "Environment: $ENVIRONMENT"
    log "Docker tag: $DOCKER_TAG"
    
    # Check if rollback is requested
    if [ "$1" = "rollback" ]; then
        rollback
        exit 0
    fi
    
    # Run deployment steps
    check_root
    check_prerequisites
    create_backup
    pull_image
    build_application
    deploy_application
    health_check
    run_tests
    update_monitoring
    cleanup
    send_notifications
    
    success "Deployment completed successfully!"
    log "Application is available at: https://sensus.app"
    log "Monitoring dashboard: https://monitoring.sensus.app"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main "$@"
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "backup")
        create_backup
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|health|backup] [tag] [environment]"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  health   - Run health checks"
        echo "  backup   - Create backup"
        exit 1
        ;;
esac

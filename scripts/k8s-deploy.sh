#!/bin/bash

# Sensus Kubernetes Deployment Script
# This script handles the complete deployment process for Sensus on Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="sensus"
NAMESPACE="sensus"
DOCKER_REGISTRY="your_registry.com"
DOCKER_IMAGE="$DOCKER_REGISTRY/$APP_NAME"
DOCKER_TAG="${1:-latest}"
ENVIRONMENT="${2:-production}"
K8S_DIR="k8s"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not installed"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if kubectl is configured
    if ! kubectl cluster-info &> /dev/null; then
        error "kubectl is not configured or cluster is not accessible"
    fi
    
    success "Prerequisites check passed"
}

# Build and push image
build_and_push_image() {
    log "Building and pushing Docker image..."
    
    # Build image
    docker build -t "$DOCKER_IMAGE:$DOCKER_TAG" .
    docker tag "$DOCKER_IMAGE:$DOCKER_TAG" "$DOCKER_IMAGE:latest"
    
    # Push image
    docker push "$DOCKER_IMAGE:$DOCKER_TAG"
    docker push "$DOCKER_IMAGE:latest"
    
    success "Docker image built and pushed successfully"
}

# Create namespace
create_namespace() {
    log "Creating namespace..."
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f "$K8S_DIR/namespace.yaml"
        success "Namespace created successfully"
    fi
}

# Apply secrets
apply_secrets() {
    log "Applying secrets..."
    
    # Check if secrets exist
    if kubectl get secret sensus-secrets -n "$NAMESPACE" &> /dev/null; then
        warning "Secrets already exist, skipping..."
    else
        kubectl apply -f "$K8S_DIR/secret.yaml"
        success "Secrets applied successfully"
    fi
}

# Apply configmap
apply_configmap() {
    log "Applying configmap..."
    
    kubectl apply -f "$K8S_DIR/configmap.yaml"
    success "Configmap applied successfully"
}

# Deploy application
deploy_application() {
    log "Deploying application..."
    
    # Update image tag in deployment
    sed "s|your_registry.com/sensus:latest|$DOCKER_IMAGE:$DOCKER_TAG|g" "$K8S_DIR/deployment.yaml" | kubectl apply -f -
    
    # Apply other resources
    kubectl apply -f "$K8S_DIR/service.yaml"
    kubectl apply -f "$K8S_DIR/ingress.yaml"
    kubectl apply -f "$K8S_DIR/hpa.yaml"
    
    success "Application deployed successfully"
}

# Wait for deployment
wait_for_deployment() {
    log "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/sensus-app -n "$NAMESPACE"
    success "Deployment is ready"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    # Get pod names
    PODS=$(kubectl get pods -n "$NAMESPACE" -l app=sensus,component=app -o jsonpath='{.items[*].metadata.name}')
    
    for pod in $PODS; do
        # Check if pod is running
        if ! kubectl get pod "$pod" -n "$NAMESPACE" | grep -q "Running"; then
            error "Pod $pod is not running"
        fi
        
        # Check health endpoint
        kubectl exec "$pod" -n "$NAMESPACE" -- curl -f http://localhost:3000/health || error "Health check failed for pod $pod"
    done
    
    success "Health checks passed"
}

# Run tests
run_tests() {
    log "Running production tests..."
    
    # Get a pod name
    POD=$(kubectl get pods -n "$NAMESPACE" -l app=sensus,component=app -o jsonpath='{.items[0].metadata.name}')
    
    # Run smoke tests
    kubectl exec "$POD" -n "$NAMESPACE" -- npm run test:smoke || error "Smoke tests failed"
    
    success "Tests passed"
}

# Check ingress
check_ingress() {
    log "Checking ingress..."
    
    # Wait for ingress to be ready
    kubectl wait --for=condition=ready --timeout=300s ingress/sensus-ingress -n "$NAMESPACE"
    
    # Check if ingress has an IP
    INGRESS_IP=$(kubectl get ingress sensus-ingress -n "$NAMESPACE" -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -z "$INGRESS_IP" ]; then
        warning "Ingress IP not available yet"
    else
        success "Ingress is ready with IP: $INGRESS_IP"
    fi
}

# Show deployment status
show_status() {
    log "Deployment status:"
    
    echo "Pods:"
    kubectl get pods -n "$NAMESPACE" -l app=sensus
    
    echo "Services:"
    kubectl get services -n "$NAMESPACE"
    
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    
    echo "HPA:"
    kubectl get hpa -n "$NAMESPACE"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Get previous deployment
    PREVIOUS_DEPLOYMENT=$(kubectl rollout history deployment/sensus-app -n "$NAMESPACE" --no-headers | tail -n 1 | awk '{print $1}')
    
    if [ -z "$PREVIOUS_DEPLOYMENT" ]; then
        error "No previous deployment found"
    fi
    
    # Rollback to previous deployment
    kubectl rollout undo deployment/sensus-app -n "$NAMESPACE"
    
    # Wait for rollback to complete
    kubectl rollout status deployment/sensus-app -n "$NAMESPACE"
    
    success "Rollback completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up..."
    
    # Remove all resources
    kubectl delete -f "$K8S_DIR/ingress.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/hpa.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/service.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/deployment.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/configmap.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/secret.yaml" --ignore-not-found=true
    kubectl delete -f "$K8S_DIR/namespace.yaml" --ignore-not-found=true
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting Sensus Kubernetes deployment..."
    log "Environment: $ENVIRONMENT"
    log "Docker tag: $DOCKER_TAG"
    log "Namespace: $NAMESPACE"
    
    # Run deployment steps
    check_prerequisites
    build_and_push_image
    create_namespace
    apply_secrets
    apply_configmap
    deploy_application
    wait_for_deployment
    health_check
    run_tests
    check_ingress
    show_status
    
    success "Kubernetes deployment completed successfully!"
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
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 [deploy|rollback|status|cleanup] [tag] [environment]"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous version"
        echo "  status   - Show deployment status"
        echo "  cleanup  - Remove all resources"
        exit 1
        ;;
esac

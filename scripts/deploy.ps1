# Sensus Production Deployment Script (PowerShell)
# This script handles the complete deployment process for Sensus

param(
    [string]$Tag = "latest",
    [string]$Environment = "production",
    [string]$Action = "deploy"
)

# Configuration
$AppName = "sensus"
$DockerRegistry = "your_registry.com"
$DockerImage = "$DockerRegistry/$AppName"
$DockerTag = $Tag
$DeployDir = "C:\opt\sensus"
$BackupDir = "C:\opt\sensus\backups"
$LogFile = "C:\var\log\sensus-deploy.log"

# Functions
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
    Write-Log $Message "SUCCESS"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
    Write-Log $Message "WARNING"
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    Write-Log $Message "ERROR"
    exit 1
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check Docker
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed"
    }
    
    # Check Docker Compose
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed"
    }
    
    Write-Success "Prerequisites check passed"
}

# Create backup
function New-Backup {
    Write-Log "Creating backup..."
    
    if (Test-Path $DeployDir) {
        $BackupName = "backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        $BackupPath = Join-Path $BackupDir $BackupName
        
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Copy-Item -Path $DeployDir -Destination $BackupPath -Recurse
        
        # Keep only last 5 backups
        Get-ChildItem -Path $BackupDir | Sort-Object CreationTime -Descending | Select-Object -Skip 5 | Remove-Item -Recurse -Force
        
        Write-Success "Backup created: $BackupName"
    } else {
        Write-Warning "No existing deployment found, skipping backup"
    }
}

# Pull latest image
function Invoke-PullImage {
    Write-Log "Pulling latest Docker image..."
    
    try {
        docker pull "$DockerImage`:$DockerTag"
        Write-Success "Docker image pulled successfully"
    } catch {
        Write-Error "Failed to pull Docker image"
    }
}

# Build application
function Invoke-BuildApplication {
    Write-Log "Building application..."
    
    try {
        # Build Docker image
        docker build -t "$DockerImage`:$DockerTag" .
        
        # Tag as latest
        docker tag "$DockerImage`:$DockerTag" "$DockerImage`:latest"
        
        Write-Success "Application built successfully"
    } catch {
        Write-Error "Failed to build Docker image"
    }
}

# Deploy application
function Invoke-DeployApplication {
    Write-Log "Deploying application..."
    
    try {
        # Create deployment directory
        New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null
        Set-Location $DeployDir
        
        # Copy configuration files
        Copy-Item "docker-compose.prod.yml" "docker-compose.yml"
        Copy-Item "production.env" ".env"
        Copy-Item "nginx.conf" "nginx.conf"
        Copy-Item "prometheus.yml" "prometheus.yml"
        Copy-Item "redis.conf" "redis.conf"
        
        # Update environment variables
        (Get-Content "docker-compose.yml") -replace "DOCKER_TAG", $DockerTag | Set-Content "docker-compose.yml"
        
        # Stop existing containers
        try {
            docker-compose down
        } catch {
            Write-Warning "No existing containers to stop"
        }
        
        # Start new containers
        docker-compose up -d
        
        Write-Success "Application deployed successfully"
    } catch {
        Write-Error "Failed to deploy application"
    }
}

# Run health checks
function Test-HealthCheck {
    Write-Log "Running health checks..."
    
    # Wait for services to start
    Start-Sleep -Seconds 30
    
    try {
        # Check if containers are running
        $RunningContainers = docker-compose ps --services --filter "status=running"
        if (-not $RunningContainers) {
            Write-Error "Some containers are not running"
        }
        
        # Check application health
        $HealthCheck = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
        if ($HealthCheck.StatusCode -ne 200) {
            Write-Error "Application health check failed"
        }
        
        # Check Nginx
        $NginxCheck = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing
        if ($NginxCheck.StatusCode -ne 200) {
            Write-Error "Nginx health check failed"
        }
        
        Write-Success "Health checks passed"
    } catch {
        Write-Error "Health checks failed"
    }
}

# Run tests
function Invoke-Tests {
    Write-Log "Running production tests..."
    
    try {
        # Run smoke tests
        docker-compose exec sensus-app npm run test:smoke
        Write-Success "Tests passed"
    } catch {
        Write-Error "Smoke tests failed"
    }
}

# Update monitoring
function Update-Monitoring {
    Write-Log "Updating monitoring configuration..."
    
    try {
        # Reload Prometheus configuration
        docker-compose exec monitoring promtool reload-config
        
        # Restart Grafana
        docker-compose restart grafana
        
        Write-Success "Monitoring updated"
    } catch {
        Write-Warning "Failed to update monitoring"
    }
}

# Cleanup
function Invoke-Cleanup {
    Write-Log "Cleaning up..."
    
    try {
        # Remove unused images
        docker image prune -f
        
        # Remove unused volumes
        docker volume prune -f
        
        Write-Success "Cleanup completed"
    } catch {
        Write-Warning "Failed to cleanup"
    }
}

# Send notifications
function Send-Notifications {
    Write-Log "Sending deployment notifications..."
    
    $Message = "🚀 Sensus deployment completed successfully! Version: $DockerTag"
    
    # Send Slack notification
    if ($env:SLACK_WEBHOOK_URL) {
        try {
            $SlackBody = @{
                text = $Message
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $env:SLACK_WEBHOOK_URL -Method Post -Body $SlackBody -ContentType "application/json"
        } catch {
            Write-Warning "Failed to send Slack notification"
        }
    }
    
    # Send Discord notification
    if ($env:DISCORD_WEBHOOK_URL) {
        try {
            $DiscordBody = @{
                content = $Message
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri $env:DISCORD_WEBHOOK_URL -Method Post -Body $DiscordBody -ContentType "application/json"
        } catch {
            Write-Warning "Failed to send Discord notification"
        }
    }
    
    Write-Success "Notifications sent"
}

# Rollback function
function Invoke-Rollback {
    Write-Log "Rolling back deployment..."
    
    try {
        # Stop current containers
        docker-compose down
        
        # Restore from backup
        $LatestBackup = Get-ChildItem -Path $BackupDir | Sort-Object CreationTime -Descending | Select-Object -First 1
        if ($LatestBackup) {
            Copy-Item -Path $LatestBackup.FullName -Destination $DeployDir -Recurse -Force
            Set-Location $DeployDir
            docker-compose up -d
            Write-Success "Rollback completed"
        } else {
            Write-Error "No backup found for rollback"
        }
    } catch {
        Write-Error "Rollback failed"
    }
}

# Main deployment function
function Start-Deployment {
    Write-Log "Starting Sensus deployment..."
    Write-Log "Environment: $Environment"
    Write-Log "Docker tag: $DockerTag"
    
    # Run deployment steps
    Test-Prerequisites
    New-Backup
    Invoke-PullImage
    Invoke-BuildApplication
    Invoke-DeployApplication
    Test-HealthCheck
    Invoke-Tests
    Update-Monitoring
    Invoke-Cleanup
    Send-Notifications
    
    Write-Success "Deployment completed successfully!"
    Write-Log "Application is available at: https://sensus.app"
    Write-Log "Monitoring dashboard: https://monitoring.sensus.app"
}

# Handle script actions
switch ($Action.ToLower()) {
    "deploy" {
        Start-Deployment
    }
    "rollback" {
        Invoke-Rollback
    }
    "health" {
        Test-HealthCheck
    }
    "backup" {
        New-Backup
    }
    default {
        Write-Host "Usage: .\deploy.ps1 [-Action <deploy|rollback|health|backup>] [-Tag <tag>] [-Environment <environment>]"
        Write-Host "  deploy   - Deploy the application (default)"
        Write-Host "  rollback - Rollback to previous version"
        Write-Host "  health   - Run health checks"
        Write-Host "  backup   - Create backup"
        exit 1
    }
}

#!/bin/bash

# Sensus Backup Script
# Script completo de backup y recovery

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="/app/backups"
LOG_DIR="/app/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="sensus_backup_${TIMESTAMP}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Función para enviar notificaciones
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "Sensus Backup $status" "$NOTIFICATION_EMAIL"
    fi
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Función para crear directorio de backup
create_backup_dir() {
    local backup_path="$1"
    mkdir -p "$backup_path"
    log "Created backup directory: $backup_path"
}

# Función para backup de base de datos
backup_database() {
    local backup_path="$1"
    local db_backup_dir="$backup_path/database"
    
    log "Starting database backup..."
    create_backup_dir "$db_backup_dir"
    
    # Backup PostgreSQL
    if command -v pg_dump &> /dev/null; then
        log "Backing up PostgreSQL database..."
        pg_dump -h "${DB_HOST:-localhost}" \
                -p "${DB_PORT:-5432}" \
                -U "${DB_USERNAME}" \
                -d "${DB_NAME:-sensus}" \
                --verbose \
                --no-password \
                --format=custom \
                --compress=9 \
                --file="$db_backup_dir/sensus_main_${TIMESTAMP}.dump"
        
        if [[ $? -eq 0 ]]; then
            log_success "PostgreSQL backup completed successfully"
        else
            log_error "PostgreSQL backup failed"
            return 1
        fi
    else
        log_warning "pg_dump not found, skipping PostgreSQL backup"
    fi
    
    # Backup Redis
    if command -v redis-cli &> /dev/null; then
        log "Backing up Redis database..."
        redis-cli --rdb "$db_backup_dir/redis_${TIMESTAMP}.rdb"
        
        if [[ $? -eq 0 ]]; then
            log_success "Redis backup completed successfully"
        else
            log_warning "Redis backup failed"
        fi
    else
        log_warning "redis-cli not found, skipping Redis backup"
    fi
}

# Función para backup de archivos
backup_files() {
    local backup_path="$1"
    local files_backup_dir="$backup_path/files"
    
    log "Starting files backup..."
    create_backup_dir "$files_backup_dir"
    
    # Backup uploads
    if [[ -d "/app/uploads" ]]; then
        log "Backing up uploads directory..."
        tar -czf "$files_backup_dir/uploads_${TIMESTAMP}.tar.gz" -C /app uploads
        log_success "Uploads backup completed"
    fi
    
    # Backup logs
    if [[ -d "/app/logs" ]]; then
        log "Backing up logs directory..."
        tar -czf "$files_backup_dir/logs_${TIMESTAMP}.tar.gz" -C /app logs
        log_success "Logs backup completed"
    fi
    
    # Backup configuration
    if [[ -d "/app/config" ]]; then
        log "Backing up configuration directory..."
        tar -czf "$files_backup_dir/config_${TIMESTAMP}.tar.gz" -C /app config
        log_success "Configuration backup completed"
    fi
}

# Función para backup de configuración
backup_configuration() {
    local backup_path="$1"
    local config_backup_dir="$backup_path/configuration"
    
    log "Starting configuration backup..."
    create_backup_dir "$config_backup_dir"
    
    # Backup environment files
    if [[ -f "/app/.env" ]]; then
        cp /app/.env "$config_backup_dir/.env"
        log_success "Environment file backed up"
    fi
    
    # Backup package files
    if [[ -f "/app/package.json" ]]; then
        cp /app/package.json "$config_backup_dir/package.json"
        log_success "Package.json backed up"
    fi
    
    if [[ -f "/app/package-lock.json" ]]; then
        cp /app/package-lock.json "$config_backup_dir/package-lock.json"
        log_success "Package-lock.json backed up"
    fi
    
    # Backup Docker files
    if [[ -f "/app/docker-compose.yml" ]]; then
        cp /app/docker-compose.yml "$config_backup_dir/docker-compose.yml"
        log_success "Docker-compose.yml backed up"
    fi
    
    # Backup Kubernetes manifests
    if [[ -d "/app/config/k8s" ]]; then
        cp -r /app/config/k8s "$config_backup_dir/"
        log_success "Kubernetes manifests backed up"
    fi
}

# Función para comprimir backup
compress_backup() {
    local backup_path="$1"
    local compressed_file="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    
    log "Compressing backup..."
    tar -czf "$compressed_file" -C "$(dirname "$backup_path")" "$(basename "$backup_path")"
    
    if [[ $? -eq 0 ]]; then
        log_success "Backup compressed: $compressed_file"
        echo "$compressed_file"
    else
        log_error "Backup compression failed"
        return 1
    fi
}

# Función para encriptar backup
encrypt_backup() {
    local backup_file="$1"
    local encrypted_file="${backup_file}.enc"
    
    if [[ -n "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
        log "Encrypting backup..."
        openssl enc -aes-256-cbc -salt -in "$backup_file" -out "$encrypted_file" -pass pass:"$BACKUP_ENCRYPTION_KEY"
        
        if [[ $? -eq 0 ]]; then
            log_success "Backup encrypted: $encrypted_file"
            rm "$backup_file"  # Remove unencrypted file
            echo "$encrypted_file"
        else
            log_error "Backup encryption failed"
            return 1
        fi
    else
        log_warning "No encryption key provided, backup not encrypted"
        echo "$backup_file"
    fi
}

# Función para subir backup a S3
upload_to_s3() {
    local backup_file="$1"
    local s3_path="s3://${S3_BUCKET:-sensus-backups}/$(date +%Y/%m/%d)/"
    
    if command -v aws &> /dev/null && [[ -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
        log "Uploading backup to S3..."
        aws s3 cp "$backup_file" "$s3_path$(basename "$backup_file")" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256
        
        if [[ $? -eq 0 ]]; then
            log_success "Backup uploaded to S3: $s3_path$(basename "$backup_file")"
        else
            log_error "S3 upload failed"
            return 1
        fi
    else
        log_warning "AWS CLI not configured, skipping S3 upload"
    fi
}

# Función para limpiar backups antiguos
cleanup_old_backups() {
    local retention_days="${BACKUP_RETENTION_DAYS:-30}"
    
    log "Cleaning up old backups (older than $retention_days days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "sensus_backup_*.tar.gz*" -mtime +$retention_days -delete
    find "$BACKUP_DIR" -name "sensus_backup_*.tar.gz.enc" -mtime +$retention_days -delete
    
    # S3 cleanup
    if command -v aws &> /dev/null && [[ -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
        aws s3 ls s3://${S3_BUCKET:-sensus-backups}/ --recursive | \
        awk '$1 < "'$(date -d "$retention_days days ago" +%Y-%m-%d)'" {print $4}' | \
        xargs -I {} aws s3 rm s3://${S3_BUCKET:-sensus-backups}/{}
    fi
    
    log_success "Old backups cleaned up"
}

# Función para verificar backup
verify_backup() {
    local backup_file="$1"
    
    log "Verifying backup integrity..."
    
    if [[ "$backup_file" == *.enc ]]; then
        # Verify encrypted backup
        if [[ -n "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
            openssl enc -aes-256-cbc -d -in "$backup_file" -pass pass:"$BACKUP_ENCRYPTION_KEY" | tar -tz > /dev/null
        else
            log_error "Cannot verify encrypted backup without key"
            return 1
        fi
    else
        # Verify regular backup
        tar -tzf "$backup_file" > /dev/null
    fi
    
    if [[ $? -eq 0 ]]; then
        log_success "Backup verification successful"
    else
        log_error "Backup verification failed"
        return 1
    fi
}

# Función para restaurar backup
restore_backup() {
    local backup_file="$1"
    local restore_path="$2"
    
    log "Starting backup restore from: $backup_file"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Create restore directory
    mkdir -p "$restore_path"
    
    if [[ "$backup_file" == *.enc ]]; then
        # Restore encrypted backup
        if [[ -n "${BACKUP_ENCRYPTION_KEY:-}" ]]; then
            openssl enc -aes-256-cbc -d -in "$backup_file" -pass pass:"$BACKUP_ENCRYPTION_KEY" | tar -xzf - -C "$restore_path"
        else
            log_error "Cannot restore encrypted backup without key"
            return 1
        fi
    else
        # Restore regular backup
        tar -xzf "$backup_file" -C "$restore_path"
    fi
    
    if [[ $? -eq 0 ]]; then
        log_success "Backup restored successfully to: $restore_path"
    else
        log_error "Backup restore failed"
        return 1
    fi
}

# Función principal de backup
main_backup() {
    local backup_path="$BACKUP_DIR/$BACKUP_NAME"
    local start_time=$(date +%s)
    
    log "Starting Sensus backup process..."
    log "Backup name: $BACKUP_NAME"
    log "Backup path: $backup_path"
    
    # Create backup directory
    create_backup_dir "$backup_path"
    
    # Perform backups
    backup_database "$backup_path" || log_warning "Database backup failed"
    backup_files "$backup_path" || log_warning "Files backup failed"
    backup_configuration "$backup_path" || log_warning "Configuration backup failed"
    
    # Compress backup
    local compressed_file=$(compress_backup "$backup_path")
    if [[ $? -eq 0 ]]; then
        # Encrypt backup
        local encrypted_file=$(encrypt_backup "$compressed_file")
        if [[ $? -eq 0 ]]; then
            # Upload to S3
            upload_to_s3 "$encrypted_file" || log_warning "S3 upload failed"
            
            # Verify backup
            verify_backup "$encrypted_file" || log_warning "Backup verification failed"
            
            # Cleanup old backups
            cleanup_old_backups
            
            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            
            log_success "Backup completed successfully in ${duration}s"
            send_notification "SUCCESS" "Sensus backup completed successfully in ${duration}s"
            
            # Cleanup temporary files
            rm -rf "$backup_path"
        else
            log_error "Backup encryption failed"
            send_notification "FAILURE" "Sensus backup encryption failed"
            exit 1
        fi
    else
        log_error "Backup compression failed"
        send_notification "FAILURE" "Sensus backup compression failed"
        exit 1
    fi
}

# Función para listar backups
list_backups() {
    log "Available backups:"
    
    # Local backups
    if [[ -d "$BACKUP_DIR" ]]; then
        log "Local backups:"
        ls -la "$BACKUP_DIR" | grep "sensus_backup_"
    fi
    
    # S3 backups
    if command -v aws &> /dev/null && [[ -n "${AWS_ACCESS_KEY_ID:-}" ]]; then
        log "S3 backups:"
        aws s3 ls s3://${S3_BUCKET:-sensus-backups}/ --recursive | grep "sensus_backup_"
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Sensus Backup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  backup              Perform full backup"
    echo "  restore <file>      Restore from backup file"
    echo "  list                List available backups"
    echo "  cleanup             Clean up old backups"
    echo "  verify <file>       Verify backup file"
    echo "  help                Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DB_HOST             Database host (default: localhost)"
    echo "  DB_PORT             Database port (default: 5432)"
    echo "  DB_USERNAME         Database username"
    echo "  DB_PASSWORD         Database password"
    echo "  DB_NAME             Database name (default: sensus)"
    echo "  BACKUP_ENCRYPTION_KEY  Encryption key for backups"
    echo "  S3_BUCKET           S3 bucket for backup storage"
    echo "  AWS_ACCESS_KEY_ID   AWS access key"
    echo "  AWS_SECRET_ACCESS_KEY AWS secret key"
    echo "  SLACK_WEBHOOK       Slack webhook URL"
    echo "  NOTIFICATION_EMAIL  Email for notifications"
    echo "  BACKUP_RETENTION_DAYS Retention days (default: 30)"
}

# Main script logic
case "${1:-backup}" in
    "backup")
        main_backup
        ;;
    "restore")
        if [[ -z "${2:-}" ]]; then
            log_error "Backup file required for restore"
            exit 1
        fi
        restore_backup "$2" "/tmp/restore_$(date +%Y%m%d_%H%M%S)"
        ;;
    "list")
        list_backups
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "verify")
        if [[ -z "${2:-}" ]]; then
            log_error "Backup file required for verification"
            exit 1
        fi
        verify_backup "$2"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

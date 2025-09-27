#!/usr/bin/env node

/**
 * Script para generar configuración de seguridad
 * Uso: node scripts/generate-security.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityGenerator {
  static generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  static generateEncryptionKey() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateSessionSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateRefreshTokenSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateAPIKey() {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  static generateSecurePassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 30)];
    
    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static generateSecurityConfig() {
    return {
      JWT_SECRET: this.generateJWTSecret(),
      ENCRYPTION_KEY: this.generateEncryptionKey(),
      SESSION_SECRET: this.generateSessionSecret(),
      REFRESH_TOKEN_SECRET: this.generateRefreshTokenSecret(),
      API_KEY: this.generateAPIKey()
    };
  }

  static validateSecretStrength(secret) {
    const feedback = [];
    let score = 0;

    // Longitud
    if (secret.length >= 64) score += 3;
    else if (secret.length >= 32) score += 2;
    else if (secret.length >= 16) score += 1;
    else feedback.push('El secret debe tener al menos 16 caracteres');

    // Complejidad
    if (/[a-z]/.test(secret)) score += 1;
    if (/[A-Z]/.test(secret)) score += 1;
    if (/\d/.test(secret)) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(secret)) score += 1;

    // Entropía
    const uniqueChars = new Set(secret).size;
    if (uniqueChars >= 20) score += 2;
    else if (uniqueChars >= 10) score += 1;

    return {
      isValid: score >= 6,
      score: Math.max(0, Math.min(10, score)),
      feedback
    };
  }
}

function displaySecurityConfig() {
  console.log('\n🔒 CONFIGURACIÓN DE SEGURIDAD GENERADA\n');
  console.log('='.repeat(50));
  
  const config = SecurityGenerator.generateSecurityConfig();
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log('⚠️  IMPORTANTE:');
  console.log('1. Guarda estos valores en un lugar seguro');
  console.log('2. NUNCA los compartas públicamente');
  console.log('3. Úsalos en tu archivo .env');
  console.log('4. Rota estos secrets regularmente');
  console.log('='.repeat(50) + '\n');
}

function generateEnvFile() {
  const config = SecurityGenerator.generateSecurityConfig();
  const envContent = `# ===========================================
# SENSUS - SECURITY CONFIGURATION
# ===========================================
# Configuración de seguridad profesional
# Generado automáticamente el ${new Date().toISOString()}

# ===========================================
# SECURITY CONFIGURATION - NIVEL EMPRESARIAL
# ===========================================
JWT_SECRET=${config.JWT_SECRET}
ENCRYPTION_KEY=${config.ENCRYPTION_KEY}
SESSION_SECRET=${config.SESSION_SECRET}
REFRESH_TOKEN_SECRET=${config.REFRESH_TOKEN_SECRET}
API_KEY=${config.API_KEY}

# ===========================================
# AUTHENTICATION & AUTHORIZATION
# ===========================================
JWT_EXPIRES_IN=7d
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
SESSION_TIMEOUT=3600000

# ===========================================
# RATE LIMITING - CONFIGURACIÓN AVANZADA
# ===========================================
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN=5
RATE_LIMIT_REGISTER=3
RATE_LIMIT_PASSWORD_RESET=3

# ===========================================
# REDIS CONFIGURATION
# ===========================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=sensus:

# ===========================================
# SECURITY HEADERS
# ===========================================
SECURITY_HEADERS_ENABLED=true
CSP_ENABLED=true
HSTS_ENABLED=true
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff

# ===========================================
# SECURITY MONITORING
# ===========================================
SECURITY_MONITORING_ENABLED=true
INTRUSION_DETECTION_ENABLED=true
SUSPICIOUS_ACTIVITY_ALERTS=true
FAILED_LOGIN_ALERTS=true
RATE_LIMIT_ALERTS=true
SECURITY_WEBHOOK_URL=

# ===========================================
# COMPLIANCE & PRIVACY
# ===========================================
GDPR_COMPLIANCE=true
DATA_RETENTION_DAYS=365
PRIVACY_MODE=true
ANONYMIZATION_ENABLED=true
`;

  const envPath = path.join(__dirname, '..', '..', 'config', 'security.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log(`✅ Archivo de configuración generado: ${envPath}`);
  console.log('📝 Copia estos valores a tu archivo .env principal\n');
}

function validateExistingConfig() {
  console.log('\n🔍 VALIDACIÓN DE CONFIGURACIÓN DE SEGURIDAD\n');
  console.log('='.repeat(50));
  
  // Leer configuración existente si existe
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const secrets = {};
    lines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key.includes('SECRET') || key.includes('KEY')) {
          secrets[key.trim()] = value.trim();
        }
      }
    });
    
    Object.entries(secrets).forEach(([key, value]) => {
      const validation = SecurityGenerator.validateSecretStrength(value);
      const status = validation.isValid ? '✅' : '❌';
      const score = `${validation.score}/10`;
      
      console.log(`${status} ${key}: ${score}`);
      
      if (!validation.isValid) {
        validation.feedback.forEach(feedback => {
          console.log(`   ⚠️  ${feedback}`);
        });
      }
    });
  } else {
    console.log('❌ No se encontró archivo .env');
    console.log('💡 Ejecuta este script para generar uno nuevo');
  }
  
  console.log('='.repeat(50) + '\n');
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    validateExistingConfig();
  } else if (args.includes('--generate-file')) {
    generateEnvFile();
  } else {
    displaySecurityConfig();
    console.log('💡 Opciones disponibles:');
    console.log('  --validate      Validar configuración existente');
    console.log('  --generate-file Generar archivo de configuración');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = SecurityGenerator;

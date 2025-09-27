#!/usr/bin/env node

/**
 * Script de configuración de seguridad para Sensus
 * Configura y valida la seguridad del sistema
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SecuritySetup {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.backendRoot = path.join(__dirname, '..');
  }

  /**
   * Configurar seguridad inicial
   */
  async setupSecurity() {
    console.log('🔒 Configurando seguridad para Sensus...\n');

    try {
      // 1. Verificar archivos de configuración
      await this.checkConfigurationFiles();
      
      // 2. Generar secrets si no existen
      await this.generateSecretsIfNeeded();
      
      // 3. Validar configuración de seguridad
      await this.validateSecurityConfig();
      
      // 4. Crear directorios necesarios
      await this.createRequiredDirectories();
      
      // 5. Configurar logging de seguridad
      await this.setupSecurityLogging();
      
      // 6. Verificar dependencias de seguridad
      await this.checkSecurityDependencies();
      
      console.log('✅ Configuración de seguridad completada exitosamente!\n');
      
    } catch (error) {
      console.error('❌ Error configurando seguridad:', error.message);
      process.exit(1);
    }
  }

  /**
   * Verificar archivos de configuración
   */
  async checkConfigurationFiles() {
    console.log('📋 Verificando archivos de configuración...');
    
    const requiredFiles = [
      'config/security.env',
      'config/production.env',
      'config/env.example'
    ];

    const missingFiles = [];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(this.projectRoot, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    });

    if (missingFiles.length > 0) {
      console.log('⚠️  Archivos faltantes:', missingFiles.join(', '));
      console.log('💡 Algunos archivos de configuración no existen, se crearán automáticamente');
    } else {
      console.log('✅ Todos los archivos de configuración existen');
    }
  }

  /**
   * Generar secrets si no existen
   */
  async generateSecretsIfNeeded() {
    console.log('🔑 Verificando secrets de seguridad...');
    
    const securityEnvPath = path.join(this.projectRoot, 'config', 'security.env');
    
    if (!fs.existsSync(securityEnvPath)) {
      console.log('📝 Generando archivo de configuración de seguridad...');
      
      const config = this.generateSecurityConfig();
      const envContent = this.createSecurityEnvContent(config);
      
      fs.writeFileSync(securityEnvPath, envContent);
      console.log('✅ Archivo de configuración de seguridad generado');
    } else {
      console.log('✅ Archivo de configuración de seguridad ya existe');
    }
  }

  /**
   * Validar configuración de seguridad
   */
  async validateSecurityConfig() {
    console.log('🔍 Validando configuración de seguridad...');
    
    const securityEnvPath = path.join(this.projectRoot, 'config', 'security.env');
    
    if (fs.existsSync(securityEnvPath)) {
      const envContent = fs.readFileSync(securityEnvPath, 'utf8');
      const secrets = this.extractSecrets(envContent);
      
      let allValid = true;
      
      Object.entries(secrets).forEach(([key, value]) => {
        const validation = this.validateSecretStrength(value);
        const status = validation.isValid ? '✅' : '❌';
        const score = `${validation.score}/10`;
        
        console.log(`   ${status} ${key}: ${score}`);
        
        if (!validation.isValid) {
          allValid = false;
          validation.feedback.forEach(feedback => {
            console.log(`      ⚠️  ${feedback}`);
          });
        }
      });
      
      if (allValid) {
        console.log('✅ Configuración de seguridad válida');
      } else {
        console.log('⚠️  Algunos secrets no cumplen con los requisitos de seguridad');
      }
    }
  }

  /**
   * Crear directorios necesarios
   */
  async createRequiredDirectories() {
    console.log('📁 Creando directorios necesarios...');
    
    const directories = [
      'logs',
      'logs/security',
      'logs/audit',
      'backups',
      'temp'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.backendRoot, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`   ✅ Creado: ${dir}`);
      } else {
        console.log(`   ✅ Existe: ${dir}`);
      }
    });
  }

  /**
   * Configurar logging de seguridad
   */
  async setupSecurityLogging() {
    console.log('📊 Configurando logging de seguridad...');
    
    const logConfig = {
      level: 'info',
      maxSize: '10m',
      maxFiles: 5,
      datePattern: 'YYYY-MM-DD',
      auditLog: true,
      securityLog: true
    };

    const logConfigPath = path.join(this.backendRoot, 'config', 'logging.json');
    fs.writeFileSync(logConfigPath, JSON.stringify(logConfig, null, 2));
    
    console.log('✅ Configuración de logging creada');
  }

  /**
   * Verificar dependencias de seguridad
   */
  async checkSecurityDependencies() {
    console.log('📦 Verificando dependencias de seguridad...');
    
    const packageJsonPath = path.join(this.backendRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const securityDependencies = [
      'helmet',
      'express-rate-limit',
      'bcryptjs',
      'jsonwebtoken',
      'ioredis',
      'express-validator',
      'winston'
    ];

    const missingDeps = [];
    
    securityDependencies.forEach(dep => {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        missingDeps.push(dep);
      }
    });

    if (missingDeps.length > 0) {
      console.log('⚠️  Dependencias de seguridad faltantes:', missingDeps.join(', '));
      console.log('💡 Ejecuta: npm install ' + missingDeps.join(' '));
    } else {
      console.log('✅ Todas las dependencias de seguridad están instaladas');
    }
  }

  /**
   * Generar configuración de seguridad
   */
  generateSecurityConfig() {
    return {
      JWT_SECRET: crypto.randomBytes(64).toString('hex'),
      ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
      SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
      REFRESH_TOKEN_SECRET: crypto.randomBytes(32).toString('hex'),
      API_KEY: `sk_${crypto.randomBytes(32).toString('hex')}`
    };
  }

  /**
   * Crear contenido del archivo de configuración de seguridad
   */
  createSecurityEnvContent(config) {
    return `# ===========================================
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
  }

  /**
   * Extraer secrets del contenido del archivo
   */
  extractSecrets(content) {
    const secrets = {};
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('=') && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key.includes('SECRET') || key.includes('KEY')) {
          secrets[key.trim()] = value.trim();
        }
      }
    });
    
    return secrets;
  }

  /**
   * Validar fortaleza de secret
   */
  validateSecretStrength(secret) {
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

// Ejecutar configuración si es llamado directamente
if (require.main === module) {
  const setup = new SecuritySetup();
  setup.setupSecurity().then(() => {
    console.log('\n🎉 ¡Configuración de seguridad completada!');
    console.log('📝 Próximos pasos:');
    console.log('   1. Copia los valores de config/security.env a tu archivo .env');
    console.log('   2. Configura Redis si planeas usar rate limiting');
    console.log('   3. Ejecuta npm run dev para probar la configuración');
    console.log('   4. Revisa los logs de seguridad en logs/security/');
  }).catch(error => {
    console.error('❌ Error en configuración:', error);
    process.exit(1);
  });
}

module.exports = SecuritySetup;

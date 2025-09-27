/**
 * Generador de Secrets Seguros para Sensus
 * Utilidad para generar claves y tokens seguros
 */

import crypto from 'crypto';

class SecurityGenerator {
  /**
   * Generar JWT Secret seguro
   */
  static generateJWTSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generar clave de encriptación
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar secret de sesión
   */
  static generateSessionSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar refresh token secret
   */
  static generateRefreshTokenSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar contraseña segura
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
    password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 30)]; // Especial
    
    // Completar con caracteres aleatorios
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mezclar la contraseña
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generar API Key
   */
  static generateAPIKey(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * Generar UUID v4
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generar token de verificación
   */
  static generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generar salt para bcrypt
   */
  static generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generar configuración completa de seguridad
   */
  static generateSecurityConfig(): {
    JWT_SECRET: string;
    ENCRYPTION_KEY: string;
    SESSION_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    API_KEY: string;
  } {
    return {
      JWT_SECRET: this.generateJWTSecret(),
      ENCRYPTION_KEY: this.generateEncryptionKey(),
      SESSION_SECRET: this.generateSessionSecret(),
      REFRESH_TOKEN_SECRET: this.generateRefreshTokenSecret(),
      API_KEY: this.generateAPIKey()
    };
  }

  /**
   * Validar fortaleza de secret
   */
  static validateSecretStrength(secret: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
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

  /**
   * Generar hash seguro
   */
  static generateSecureHash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generar HMAC
   */
  static generateHMAC(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }
}

// Función para mostrar configuración de seguridad
export function displaySecurityConfig(): void {
  console.log('\n🔒 CONFIGURACIÓN DE SEGURIDAD GENERADA\n');
  console.log('=' .repeat(50));
  
  const config = SecurityGenerator.generateSecurityConfig();
  
  Object.entries(config).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log('⚠️  IMPORTANTE:');
  console.log('1. Guarda estos valores en un lugar seguro');
  console.log('2. NUNCA los compartas públicamente');
  console.log('3. Úsalos en tu archivo .env');
  console.log('4. Rota estos secrets regularmente');
  console.log('=' .repeat(50) + '\n');
}

// Función para validar configuración existente
export function validateExistingConfig(secrets: Record<string, string>): void {
  console.log('\n🔍 VALIDACIÓN DE CONFIGURACIÓN DE SEGURIDAD\n');
  console.log('=' .repeat(50));
  
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
  
  console.log('=' .repeat(50) + '\n');
}

export default SecurityGenerator;

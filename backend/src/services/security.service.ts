/**
 * Servicio de Seguridad Profesional - Nivel Empresarial
 * Implementa medidas de seguridad avanzadas para Sensus
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.util';
import Redis from 'ioredis';

interface SecurityConfig {
  jwtSecret: string;
  encryptionKey: string;
  redisUrl: string;
  rateLimitWindow: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
}

interface LoginAttempt {
  ip: string;
  email: string;
  timestamp: Date;
  success: boolean;
  userAgent: string;
}

interface SecurityEvent {
  type: 'LOGIN_ATTEMPT' | 'SUSPICIOUS_ACTIVITY' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_TOKEN' | 'ACCOUNT_LOCKED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ip: string;
  userAgent: string;
  details: any;
  timestamp: Date;
}

class SecurityService {
  private redis: Redis;
  private config: SecurityConfig;
  private encryptionAlgorithm = 'aes-256-gcm';
  private jwtAlgorithm = 'HS256';

  constructor() {
    this.config = {
      jwtSecret: process.env.JWT_SECRET || this.generateSecureSecret(),
      encryptionKey: process.env.ENCRYPTION_KEY || this.generateSecureSecret(),
      redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
      maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
      lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutos
      sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600000') // 1 hora
    };

    this.redis = new Redis(this.config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.initializeSecurity();
  }

  private async initializeSecurity(): Promise<void> {
    try {
      await this.redis.connect();
      logger.info('🔒 Servicio de seguridad inicializado correctamente');
    } catch (error) {
      logger.error('❌ Error inicializando servicio de seguridad:', error);
      throw error;
    }
  }

  /**
   * Generar secret seguro
   */
  private generateSecureSecret(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Encriptar datos sensibles
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.config.encryptionKey);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: crypto.createHash('sha256').update(encrypted).digest('hex')
    };
  }

  /**
   * Desencriptar datos
   */
  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.config.encryptionKey);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generar JWT token seguro con información adicional
   */
  generateSecureToken(payload: any): string {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días
      jti: crypto.randomUUID(), // JWT ID único
      iss: 'sensus-app', // Issuer
      aud: 'sensus-users' // Audience
    };

    return jwt.sign(tokenPayload, this.config.jwtSecret, {
      expiresIn: '7d'
    });
  }

  /**
   * Verificar JWT token con validaciones adicionales
   */
  verifySecureToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as any;

      // Verificar que el token no esté en la blacklist
      return this.checkTokenBlacklist(decoded.jti).then(isBlacklisted => {
        if (isBlacklisted) {
          throw new Error('Token revocado');
        }
        return decoded;
      });

    } catch (error) {
      this.logSecurityEvent({
        type: 'INVALID_TOKEN',
        severity: 'MEDIUM',
        ip: 'unknown',
        userAgent: 'unknown',
        details: { error: (error as Error).message },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Verificar si el token está en la blacklist
   */
  private async checkTokenBlacklist(jti: string): Promise<boolean> {
    try {
      const result = await this.redis.get(`blacklist:${jti}`);
      return result !== null;
    } catch (error) {
      logger.error('Error verificando blacklist:', error);
      return false;
    }
  }

  /**
   * Revocar token (añadir a blacklist)
   */
  async revokeToken(jti: string, expirationTime: number): Promise<void> {
    try {
      const ttl = Math.floor((expirationTime - Date.now()) / 1000);
      if (ttl > 0) {
        await this.redis.setex(`blacklist:${jti}`, ttl, 'revoked');
      }
    } catch (error) {
      logger.error('Error revocando token:', error);
    }
  }

  /**
   * Verificar intentos de login y aplicar rate limiting
   */
  async checkLoginAttempts(ip: string, email: string): Promise<{ allowed: boolean; remainingAttempts: number; lockoutTime?: number }> {
    try {
      const key = `login_attempts:${ip}:${email}`;
      const attempts = await this.redis.get(key);
      const attemptCount = attempts ? parseInt(attempts) : 0;

      if (attemptCount >= this.config.maxLoginAttempts) {
        const lockoutKey = `lockout:${ip}:${email}`;
        const lockoutTime = await this.redis.ttl(lockoutKey);
        
        if (lockoutTime > 0) {
          this.logSecurityEvent({
            type: 'ACCOUNT_LOCKED',
            severity: 'HIGH',
            ip,
            userAgent: 'unknown',
            details: { email, attemptCount },
            timestamp: new Date()
          });

          return {
            allowed: false,
            remainingAttempts: 0,
            lockoutTime: lockoutTime * 1000
          };
        } else {
          // Reset attempts if lockout expired
          await this.redis.del(key);
        }
      }

      return {
        allowed: true,
        remainingAttempts: this.config.maxLoginAttempts - attemptCount
      };

    } catch (error) {
      logger.error('Error verificando intentos de login:', error);
      return { allowed: true, remainingAttempts: this.config.maxLoginAttempts };
    }
  }

  /**
   * Registrar intento de login
   */
  async recordLoginAttempt(ip: string, email: string, success: boolean, userAgent: string): Promise<void> {
    try {
      const key = `login_attempts:${ip}:${email}`;
      
      if (success) {
        // Reset attempts on successful login
        await this.redis.del(key);
        await this.redis.del(`lockout:${ip}:${email}`);
      } else {
        // Increment failed attempts
        const attempts = await this.redis.incr(key);
        await this.redis.expire(key, this.config.rateLimitWindow / 1000);

        if (attempts >= this.config.maxLoginAttempts) {
          // Lock account
          const lockoutKey = `lockout:${ip}:${email}`;
          await this.redis.setex(lockoutKey, this.config.lockoutDuration / 1000, 'locked');

          this.logSecurityEvent({
            type: 'ACCOUNT_LOCKED',
            severity: 'HIGH',
            ip,
            userAgent,
            details: { email, attempts },
            timestamp: new Date()
          });
        }
      }

      // Log the attempt
      this.logSecurityEvent({
        type: 'LOGIN_ATTEMPT',
        severity: success ? 'LOW' : 'MEDIUM',
        ip,
        userAgent,
        details: { email, success, attempts: success ? 0 : await this.redis.get(key) },
        timestamp: new Date()
      });

    } catch (error) {
      logger.error('Error registrando intento de login:', error);
    }
  }

  /**
   * Verificar rate limiting por IP
   */
  async checkRateLimit(ip: string, endpoint: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `rate_limit:${ip}:${endpoint}`;
      const current = await this.redis.incr(key);
      
      if (current === 1) {
        await this.redis.expire(key, this.config.rateLimitWindow / 1000);
      }

      const ttl = await this.redis.ttl(key);
      const maxRequests = this.getMaxRequestsForEndpoint(endpoint);

      if (current > maxRequests) {
        this.logSecurityEvent({
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'MEDIUM',
          ip,
          userAgent: 'unknown',
          details: { endpoint, current, maxRequests },
          timestamp: new Date()
        });

        return {
          allowed: false,
          remaining: 0,
          resetTime: Date.now() + (ttl * 1000)
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, maxRequests - current),
        resetTime: Date.now() + (ttl * 1000)
      };

    } catch (error) {
      logger.error('Error verificando rate limit:', error);
      return { allowed: true, remaining: 100, resetTime: Date.now() + this.config.rateLimitWindow };
    }
  }

  /**
   * Obtener límite máximo de requests por endpoint
   */
  private getMaxRequestsForEndpoint(endpoint: string): number {
    const limits: Record<string, number> = {
      '/api/v1/users/login': 5,
      '/api/v1/users/register': 3,
      '/api/v1/users/forgot-password': 3,
      '/api/v1/diary': 50,
      '/api/v1/evaluations': 20,
      'default': 100
    };

    return limits[endpoint] || limits.default;
  }

  /**
   * Detectar actividad sospechosa
   */
  async detectSuspiciousActivity(ip: string, userAgent: string, activity: any): Promise<boolean> {
    try {
      const suspiciousPatterns = [
        // Patrones de bots
        /bot|crawler|spider|scraper/i,
        // Patrones de ataques
        /union.*select|drop.*table|insert.*into|delete.*from/i,
        // Patrones de inyección
        /<script|javascript:|on\w+\s*=/i,
        // Patrones de herramientas de hacking
        /sqlmap|nmap|nikto|burp/i
      ];

      const activityString = JSON.stringify(activity);
      const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(activityString) || pattern.test(userAgent)
      );

      if (isSuspicious) {
        this.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          severity: 'HIGH',
          ip,
          userAgent,
          details: { activity, patterns: suspiciousPatterns },
          timestamp: new Date()
        });

        // Bloquear IP temporalmente
        await this.redis.setex(`blocked:${ip}`, 3600, 'suspicious'); // 1 hora
      }

      return isSuspicious;

    } catch (error) {
      logger.error('Error detectando actividad sospechosa:', error);
      return false;
    }
  }

  /**
   * Verificar si IP está bloqueada
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const result = await this.redis.get(`blocked:${ip}`);
      return result !== null;
    } catch (error) {
      logger.error('Error verificando IP bloqueada:', error);
      return false;
    }
  }

  /**
   * Log de eventos de seguridad
   */
  private logSecurityEvent(event: SecurityEvent): void {
    const logData = {
      ...event,
      service: 'security-service',
      environment: process.env.NODE_ENV || 'development'
    };

    // Log según severidad
    switch (event.severity) {
      case 'CRITICAL':
        logger.error('🚨 CRITICAL SECURITY EVENT:', logData);
        break;
      case 'HIGH':
        logger.warn('⚠️ HIGH SECURITY EVENT:', logData);
        break;
      case 'MEDIUM':
        logger.warn('🔶 MEDIUM SECURITY EVENT:', logData);
        break;
      case 'LOW':
        logger.info('ℹ️ LOW SECURITY EVENT:', logData);
        break;
    }

    // Enviar a sistema de monitoreo externo si está configurado
    this.sendToExternalMonitoring(logData);
  }

  /**
   * Enviar eventos críticos a monitoreo externo
   */
  private async sendToExternalMonitoring(event: any): Promise<void> {
    if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
      try {
        // Aquí podrías integrar con servicios como Sentry, DataDog, etc.
        if (process.env.SECURITY_WEBHOOK_URL) {
          // Enviar webhook de seguridad
          // await fetch(process.env.SECURITY_WEBHOOK_URL, { ... });
        }
      } catch (error) {
        logger.error('Error enviando evento a monitoreo externo:', error);
      }
    }
  }

  /**
   * Generar hash seguro para contraseñas
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 14; // Más seguro que el default
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verificar contraseña
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validar fortaleza de contraseña
   */
  validatePasswordStrength(password: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Longitud
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    else feedback.push('La contraseña debe tener al menos 8 caracteres');

    // Complejidad
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Incluye letras minúsculas');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Incluye letras mayúsculas');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Incluye números');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('Incluye caracteres especiales');

    // Patrones comunes
    const commonPatterns = [
      /(.)\1{2,}/, // Caracteres repetidos
      /123|abc|qwe/i, // Secuencias comunes
      /password|admin|user/i // Palabras comunes
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 2;
      feedback.push('Evita patrones comunes y palabras obvias');
    }

    return {
      isValid: score >= 4,
      score: Math.max(0, Math.min(5, score)),
      feedback
    };
  }

  /**
   * Limpiar datos expirados
   */
  async cleanupExpiredData(): Promise<void> {
    try {
      // Limpiar intentos de login expirados
      const keys = await this.redis.keys('login_attempts:*');
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) { // Sin expiración
          await this.redis.expire(key, this.config.rateLimitWindow / 1000);
        }
      }

      logger.info('🧹 Limpieza de datos de seguridad completada');
    } catch (error) {
      logger.error('Error en limpieza de datos:', error);
    }
  }

  /**
   * Obtener estadísticas de seguridad
   */
  async getSecurityStats(): Promise<any> {
    try {
      const stats = {
        blockedIPs: await this.redis.keys('blocked:*').then(keys => keys.length),
        activeLockouts: await this.redis.keys('lockout:*').then(keys => keys.length),
        activeRateLimits: await this.redis.keys('rate_limit:*').then(keys => keys.length),
        blacklistedTokens: await this.redis.keys('blacklist:*').then(keys => keys.length),
        timestamp: new Date().toISOString()
      };

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas de seguridad:', error);
      return {};
    }
  }
}

// Exportar instancia singleton
export default new SecurityService();

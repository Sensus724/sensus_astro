/**
 * Middleware de Seguridad Avanzada - Nivel Empresarial
 * Implementa medidas de seguridad profesionales para Sensus
 */

import { Request, Response, NextFunction } from 'express';
import SecurityService from '../services/security.service';
import { logger } from '../utils/logger.util';

interface SecureRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
    permissions?: string[];
    sessionId?: string;
    lastActivity?: Date;
  };
  securityContext?: {
    ip: string;
    userAgent: string;
    isBlocked: boolean;
    rateLimitInfo: any;
    suspiciousActivity: boolean;
  };
}

class AdvancedSecurityMiddleware {
  private securityService: typeof SecurityService;

  constructor() {
    this.securityService = SecurityService;
  }

  /**
   * Middleware principal de seguridad
   */
  async securityCheck(req: SecureRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || 'unknown';

      // Verificar si la IP está bloqueada
      const isBlocked = await this.securityService.isIPBlocked(ip);
      if (isBlocked) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'Tu IP ha sido bloqueada por actividad sospechosa'
        });
        return;
      }

      // Verificar rate limiting
      const rateLimitInfo = await this.securityService.checkRateLimit(ip, req.path);
      if (!rateLimitInfo.allowed) {
        res.status(429).json({
          success: false,
          error: 'Demasiadas solicitudes',
          message: 'Has excedido el límite de solicitudes. Intenta más tarde.',
          retryAfter: rateLimitInfo.resetTime
        });
        return;
      }

      // Detectar actividad sospechosa
      const suspiciousActivity = await this.securityService.detectSuspiciousActivity(
        ip,
        userAgent,
        {
          method: req.method,
          path: req.path,
          body: req.body,
          query: req.query,
          headers: req.headers
        }
      );

      if (suspiciousActivity) {
        res.status(403).json({
          success: false,
          error: 'Actividad sospechosa detectada',
          message: 'Tu solicitud ha sido bloqueada por seguridad'
        });
        return;
      }

      // Añadir contexto de seguridad a la request
      req.securityContext = {
        ip,
        userAgent,
        isBlocked,
        rateLimitInfo,
        suspiciousActivity
      };

      // Añadir headers de seguridad
      this.addSecurityHeaders(res);

      next();

    } catch (error) {
      logger.error('Error en middleware de seguridad:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno de seguridad',
        message: 'Ha ocurrido un error procesando tu solicitud'
      });
    }
  }

  /**
   * Middleware de autenticación avanzada
   */
  async advancedAuth(req: SecureRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'Token requerido',
          message: 'Debe proporcionar un token de autenticación válido'
        });
        return;
      }

      const token = authHeader.substring(7);
      const ip = req.securityContext?.ip || this.getClientIP(req);
      const userAgent = req.securityContext?.userAgent || req.get('User-Agent') || 'unknown';

      // Verificar token con servicio de seguridad
      const decoded = await this.securityService.verifySecureToken(token);
      
      if (!decoded.userId || !decoded.email) {
        res.status(401).json({
          success: false,
          error: 'Token inválido',
          message: 'El token no contiene la información necesaria'
        });
        return;
      }

      // Verificar sesión activa
      const sessionKey = `session:${decoded.userId}:${decoded.jti}`;
      const sessionData = await this.getSessionData(sessionKey);
      
      if (!sessionData) {
        res.status(401).json({
          success: false,
          error: 'Sesión expirada',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente'
        });
        return;
      }

      // Verificar IP de la sesión (opcional, para mayor seguridad)
      if (sessionData.ip !== ip) {
        logger.warn(`🚨 Cambio de IP detectado para usuario ${decoded.userId}: ${sessionData.ip} -> ${ip}`);
        
        // Opcional: invalidar sesión por cambio de IP
        // await this.invalidateSession(sessionKey);
      }

      // Actualizar última actividad
      await this.updateSessionActivity(sessionKey, {
        lastActivity: new Date(),
        ip,
        userAgent
      });

      // Añadir información del usuario a la request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role || 'user',
        permissions: decoded.permissions || [],
        sessionId: decoded.jti,
        lastActivity: new Date()
      };

      next();

    } catch (error) {
      if ((error as Error).message === 'Token revocado') {
        res.status(401).json({
          success: false,
          error: 'Token revocado',
          message: 'Tu sesión ha sido revocada. Por favor, inicia sesión nuevamente'
        });
        return;
      }

      logger.error('Error en autenticación avanzada:', error);
      res.status(401).json({
        success: false,
        error: 'Error de autenticación',
        message: 'No se pudo verificar tu identidad'
      });
    }
  }

  /**
   * Middleware de autorización basada en roles
   */
  requireRole(requiredRoles: string[]) {
    return (req: SecureRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
        return;
      }

      const userRole = req.user.role || 'user';
      
      if (!requiredRoles.includes(userRole)) {
        logger.warn(`🚫 Acceso denegado: Usuario ${req.user.userId} (${userRole}) intentó acceder a recurso que requiere roles: ${requiredRoles.join(', ')}`);
        
        res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          message: 'No tienes permisos para acceder a este recurso'
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware de autorización basada en permisos
   */
  requirePermission(requiredPermissions: string[]) {
    return (req: SecureRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'No autenticado',
          message: 'Debes estar autenticado para acceder a este recurso'
        });
        return;
      }

      const userPermissions = req.user.permissions || [];
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        logger.warn(`🚫 Permisos insuficientes: Usuario ${req.user.userId} intentó acceder a recurso que requiere permisos: ${requiredPermissions.join(', ')}`);
        
        res.status(403).json({
          success: false,
          error: 'Permisos insuficientes',
          message: 'No tienes los permisos necesarios para acceder a este recurso'
        });
        return;
      }

      next();
    };
  }

  /**
   * Middleware para endpoints sensibles
   */
  async sensitiveEndpoint(req: SecureRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ip = req.securityContext?.ip || this.getClientIP(req);
      const userAgent = req.securityContext?.userAgent || req.get('User-Agent') || 'unknown';

      // Log de acceso a endpoint sensible
      logger.info(`🔐 Acceso a endpoint sensible: ${req.method} ${req.path} - IP: ${ip} - User: ${req.user?.userId || 'anonymous'}`);

      // Verificaciones adicionales para endpoints sensibles
      if (req.user) {
        // Verificar que el usuario no esté en modo de solo lectura
        const userStatus = await this.getUserStatus(req.user.userId);
        if (userStatus === 'readonly') {
          res.status(403).json({
            success: false,
            error: 'Cuenta en modo de solo lectura',
            message: 'Tu cuenta está temporalmente en modo de solo lectura'
          });
          return;
        }
      }

      next();

    } catch (error) {
      logger.error('Error en middleware de endpoint sensible:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno',
        message: 'Ha ocurrido un error procesando tu solicitud'
      });
    }
  }

  /**
   * Middleware de auditoría
   */
  async auditLog(req: SecureRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data) {
      const duration = Date.now() - startTime;
      
      // Log de auditoría
      logger.info('📊 Auditoría de acceso:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.securityContext?.ip || 'unknown',
        userAgent: req.securityContext?.userAgent || 'unknown',
        userId: req.user?.userId || 'anonymous',
        userRole: req.user?.role || 'anonymous',
        requestSize: JSON.stringify(req.body).length,
        responseSize: data ? data.length : 0
      });

      return originalSend.call(this, data);
    };

    next();
  }

  /**
   * Obtener IP real del cliente
   */
  private getClientIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Añadir headers de seguridad
   */
  private addSecurityHeaders(res: Response): void {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevenir MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Habilitar XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.sensus.app; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    );
    
    // Strict Transport Security
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  /**
   * Obtener datos de sesión
   */
  private async getSessionData(sessionKey: string): Promise<any> {
    try {
      // Implementar lógica para obtener datos de sesión desde Redis
      // Por ahora retornamos datos mock
      return {
        userId: 'mock-user-id',
        ip: '127.0.0.1',
        createdAt: new Date(),
        lastActivity: new Date()
      };
    } catch (error) {
      logger.error('Error obteniendo datos de sesión:', error);
      return null;
    }
  }

  /**
   * Actualizar actividad de sesión
   */
  private async updateSessionActivity(sessionKey: string, activity: any): Promise<void> {
    try {
      // Implementar lógica para actualizar actividad de sesión
      logger.debug(`Actualizando actividad de sesión: ${sessionKey}`, activity);
    } catch (error) {
      logger.error('Error actualizando actividad de sesión:', error);
    }
  }

  /**
   * Obtener estado del usuario
   */
  private async getUserStatus(userId: string): Promise<string> {
    try {
      // Implementar lógica para obtener estado del usuario
      return 'active';
    } catch (error) {
      logger.error('Error obteniendo estado del usuario:', error);
      return 'active';
    }
  }
}

export default new AdvancedSecurityMiddleware();

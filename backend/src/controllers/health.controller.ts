/**
 * Controlador de Salud del Sistema
 * Proporciona información detallada sobre el estado del sistema
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import FirebaseService from '../services/firebase.service';
import SecurityService from '../services/security.service';

class HealthController {
  /**
   * Endpoint de salud básico
   */
  async basicHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        pid: process.pid
      };

      res.status(200).json({
        success: true,
        data: health
      });

    } catch (error) {
      logger.error('Error en health check básico:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: 'Error verificando estado del sistema'
      });
    }
  }

  /**
   * Endpoint de salud detallado (solo para administradores)
   */
  async detailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Verificar conexión a Firebase
      const firebaseStatus = await this.checkFirebaseConnection();
      
      // Verificar Redis
      const redisStatus = await this.checkRedisConnection();
      
      // Obtener estadísticas de seguridad
      const securityStats = await SecurityService.getSecurityStats();
      
      // Verificar espacio en disco
      const diskStatus = await this.checkDiskSpace();
      
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        
        // Información del sistema
        system: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          pid: process.pid,
          cpuUsage: process.cpuUsage(),
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            external: Math.round(process.memoryUsage().external / 1024 / 1024),
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
          }
        },
        
        // Estado de servicios
        services: {
          firebase: firebaseStatus,
          redis: redisStatus,
          disk: diskStatus
        },
        
        // Estadísticas de seguridad
        security: {
          ...securityStats,
          monitoringEnabled: process.env.SECURITY_MONITORING_ENABLED === 'true',
          intrusionDetection: process.env.INTRUSION_DETECTION_ENABLED === 'true'
        },
        
        // Configuración
        config: {
          rateLimitEnabled: process.env.RATE_LIMIT_ENABLED === 'true',
          corsEnabled: process.env.CORS_ENABLED === 'true',
          compressionEnabled: process.env.COMPRESSION_ENABLED === 'true',
          pwaEnabled: process.env.PWA_ENABLED === 'true'
        },
        
        // Tiempo de respuesta
        responseTime: Date.now() - startTime
      };

      // Determinar estado general
      const allServicesHealthy = Object.values(health.services).every(service => 
        service.status === 'healthy'
      );
      
      health.status = allServicesHealthy ? 'healthy' : 'degraded';

      res.status(200).json({
        success: true,
        data: health
      });

    } catch (error) {
      logger.error('Error en health check detallado:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        message: 'Error verificando estado detallado del sistema'
      });
    }
  }

  /**
   * Endpoint de métricas (para Prometheus)
   */
  async metrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        // Métricas del sistema
        system_uptime_seconds: process.uptime(),
        system_memory_used_bytes: process.memoryUsage().heapUsed,
        system_memory_total_bytes: process.memoryUsage().heapTotal,
        system_cpu_user_seconds: process.cpuUsage().user / 1000000,
        system_cpu_system_seconds: process.cpuUsage().system / 1000000,
        
        // Métricas de la aplicación
        app_version: process.env.APP_VERSION || '1.0.0',
        app_environment: process.env.NODE_ENV || 'development',
        
        // Métricas de seguridad
        security_blocked_ips: await this.getSecurityMetric('blockedIPs'),
        security_active_lockouts: await this.getSecurityMetric('activeLockouts'),
        security_rate_limits: await this.getSecurityMetric('activeRateLimits'),
        
        // Timestamp
        timestamp: Date.now()
      };

      // Formato Prometheus
      const prometheusFormat = Object.entries(metrics)
        .map(([key, value]) => `${key} ${value}`)
        .join('\n');

      res.setHeader('Content-Type', 'text/plain');
      res.status(200).send(prometheusFormat);

    } catch (error) {
      logger.error('Error generando métricas:', error);
      res.status(500).send('# Error generando métricas\n');
    }
  }

  /**
   * Verificar conexión a Firebase
   */
  private async checkFirebaseConnection(): Promise<any> {
    try {
      const isConnected = await FirebaseService.testConnection();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        message: isConnected ? 'Connected' : 'Connection failed',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verificar conexión a Redis
   */
  private async checkRedisConnection(): Promise<any> {
    try {
      // Implementar verificación de Redis
      // Por ahora retornamos mock
      return {
        status: 'healthy',
        message: 'Connected',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verificar espacio en disco
   */
  private async checkDiskSpace(): Promise<any> {
    try {
      // Implementar verificación de espacio en disco
      // Por ahora retornamos mock
      return {
        status: 'healthy',
        message: 'Sufficient space available',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Obtener métrica de seguridad
   */
  private async getSecurityMetric(metric: string): Promise<number> {
    try {
      const stats = await SecurityService.getSecurityStats();
      return stats[metric] || 0;
    } catch (error) {
      return 0;
    }
  }
}

export default new HealthController();

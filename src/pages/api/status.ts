/**
 * API endpoint para status
 * Proporciona información de estado general de la aplicación
 */

import type { APIRoute } from 'astro';
import { healthCheck } from '../../utils/healthCheck';
import { logger } from '../../utils/logging';
import { metrics } from '../../utils/metrics';
import { alerting } from '../../utils/alerting';

export const GET: APIRoute = async () => {
  try {
    // Obtener información de health check
    const healthResult = await healthCheck.runChecks();
    
    // Obtener estadísticas de logging
    const logStats = logger.getStats();
    
    // Obtener métricas
    const metricsData = metrics.getMetrics();
    
    // Obtener alertas
    const alerts = alerting.getAlerts({ limit: 10 });
    const alertStats = alerting.getStats();
    
    // Información del sistema
    const systemInfo = {
      uptime: healthCheck.getUptime(),
      memory: healthCheck.getMemoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.VERSION || '1.0.0',
    };

    const status = {
      status: healthResult.status,
      timestamp: new Date().toISOString(),
      system: systemInfo,
      health: healthResult,
      logging: logStats,
      metrics: {
        total: metricsData.length,
        sample: metricsData.slice(-10), // Últimas 10 métricas
      },
      alerts: {
        stats: alertStats,
        recent: alerts,
      },
    };

    // Determinar el código de estado HTTP
    let statusCode = 200;
    if (healthResult.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    } else if (healthResult.status === 'degraded') {
      statusCode = 200; // OK pero con advertencias
    }

    return new Response(JSON.stringify(status), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'error',
      error: 'Failed to get status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

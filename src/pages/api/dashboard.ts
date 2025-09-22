/**
 * API endpoint para dashboard
 * Proporciona datos agregados para el dashboard de monitoreo
 */

import type { APIRoute } from 'astro';
import { logger } from '../../utils/logging';
import { metrics } from '../../utils/metrics';
import { alerting } from '../../utils/alerting';
import { healthCheck } from '../../utils/healthCheck';

export const GET: APIRoute = async ({ url }) => {
  try {
    const timeRange = url.searchParams.get('timeRange') || '1h';
    const refresh = url.searchParams.get('refresh') === 'true';

    // Calcular timestamps
    const now = new Date();
    const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange)).toISOString();

    // Obtener datos de logging
    const logStats = logger.getStats();
    const recentLogs = logger.getLogs({ 
      startTime,
      limit: 100 
    });

    // Obtener métricas
    const metricsData = metrics.query({ 
      startTime,
      limit: 1000 
    });
    const aggregatedMetrics = metrics.aggregate({ 
      startTime,
      groupBy: ['name'] 
    });

    // Obtener alertas
    const alerts = alerting.getAlerts({ 
      startTime,
      limit: 50 
    });
    const alertStats = alerting.getStats();

    // Obtener health check
    const healthResult = await healthCheck.runChecks();

    // Calcular métricas en tiempo real
    const realTimeMetrics = {
      errorCount: recentLogs.filter(log => log.level === 'error').length,
      warnCount: recentLogs.filter(log => log.level === 'warn').length,
      activeSessions: Math.floor(Math.random() * 100) + 50, // Simulado
      responseTime: calculateAverageResponseTime(metricsData),
    };

    // Core Web Vitals
    const coreWebVitals = {
      lcp: getMetricValue(metricsData, 'webvitals.lcp'),
      fid: getMetricValue(metricsData, 'webvitals.fid'),
      cls: getMetricValue(metricsData, 'webvitals.cls'),
      fcp: getMetricValue(metricsData, 'webvitals.fcp'),
    };

    // Gráficos de logs
    const logsChart = {
      error: recentLogs.filter(log => log.level === 'error').length,
      warn: recentLogs.filter(log => log.level === 'warn').length,
      info: recentLogs.filter(log => log.level === 'info').length,
      debug: recentLogs.filter(log => log.level === 'debug').length,
    };

    // Gráficos de métricas
    const metricsChart = {
      responseTime: getMetricValues(metricsData, 'network.request.duration'),
      memoryUsage: getMetricValues(metricsData, 'memory.used'),
      cpuUsage: getMetricValues(metricsData, 'cpu.usage'),
    };

    // Alertas recientes
    const recentAlerts = alerts.slice(0, 10).map(alert => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt,
      source: alert.source,
    }));

    const dashboard = {
      timestamp: new Date().toISOString(),
      timeRange,
      refresh,
      realTimeMetrics,
      coreWebVitals,
      logsChart,
      metricsChart,
      recentAlerts,
      health: healthResult,
      stats: {
        logging: logStats,
        alerts: alertStats,
        metrics: {
          total: metricsData.length,
          aggregated: aggregatedMetrics.length,
        },
      },
    };

    return new Response(JSON.stringify(dashboard), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to get dashboard data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

function getTimeRangeMs(timeRange: string): number {
  switch (timeRange) {
    case '5m':
      return 5 * 60 * 1000;
    case '15m':
      return 15 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '4h':
      return 4 * 60 * 60 * 1000;
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000; // 1 hora por defecto
  }
}

function calculateAverageResponseTime(metrics: any[]): number {
  const responseTimeMetrics = metrics.filter(m => m.name === 'network.request.duration');
  if (responseTimeMetrics.length === 0) return 0;
  
  const sum = responseTimeMetrics.reduce((acc, metric) => acc + metric.value, 0);
  return Math.round(sum / responseTimeMetrics.length);
}

function getMetricValue(metrics: any[], name: string): number {
  const metric = metrics.find(m => m.name === name);
  return metric ? metric.value : 0;
}

function getMetricValues(metrics: any[], name: string): number[] {
  return metrics
    .filter(m => m.name === name)
    .map(m => m.value)
    .slice(-20); // Últimos 20 valores
}

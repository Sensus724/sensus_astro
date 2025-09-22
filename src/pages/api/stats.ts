/**
 * API endpoint para estadísticas
 * Proporciona estadísticas agregadas de monitoreo
 */

import type { APIRoute } from 'astro';
import { logger } from '../../utils/logging';
import { metrics } from '../../utils/metrics';
import { alerting } from '../../utils/alerting';
import { healthCheck } from '../../utils/healthCheck';

export const GET: APIRoute = async ({ url }) => {
  try {
    const timeRange = url.searchParams.get('timeRange') || '24h';
    const granularity = url.searchParams.get('granularity') || '1h';

    // Calcular timestamps
    const now = new Date();
    const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange)).toISOString();

    // Obtener estadísticas de logging
    const logStats = logger.getStats();
    const recentLogs = logger.getLogs({ 
      startTime,
      limit: 1000 
    });

    // Obtener métricas
    const metricsData = metrics.query({ 
      startTime,
      limit: 10000 
    });
    const aggregatedMetrics = metrics.aggregate({ 
      startTime,
      groupBy: ['name'] 
    });

    // Obtener alertas
    const alerts = alerting.getAlerts({ 
      startTime,
      limit: 1000 
    });
    const alertStats = alerting.getStats();

    // Obtener health check
    const healthResult = await healthCheck.runChecks();

    // Calcular estadísticas por tiempo
    const timeStats = calculateTimeStats(recentLogs, metricsData, alerts, granularity);

    // Calcular estadísticas por componente
    const componentStats = calculateComponentStats(recentLogs, metricsData, alerts);

    // Calcular estadísticas por usuario
    const userStats = calculateUserStats(recentLogs, metricsData, alerts);

    // Calcular tendencias
    const trends = calculateTrends(recentLogs, metricsData, alerts, timeRange);

    const stats = {
      timestamp: new Date().toISOString(),
      timeRange,
      granularity,
      summary: {
        logging: logStats,
        metrics: {
          total: metricsData.length,
          aggregated: aggregatedMetrics.length,
        },
        alerts: alertStats,
        health: healthResult.summary,
      },
      timeStats,
      componentStats,
      userStats,
      trends,
      health: healthResult,
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to get statistics',
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
    case '1h':
      return 60 * 60 * 1000;
    case '4h':
      return 4 * 60 * 60 * 1000;
    case '24h':
      return 24 * 60 * 60 * 1000;
    case '7d':
      return 7 * 24 * 60 * 60 * 1000;
    case '30d':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000; // 24 horas por defecto
  }
}

function calculateTimeStats(logs: any[], metrics: any[], alerts: any[], granularity: string): any {
  const intervalMs = getGranularityMs(granularity);
  const now = new Date();
  const startTime = new Date(now.getTime() - getTimeRangeMs('24h'));
  
  const intervals: any[] = [];
  let currentTime = startTime;

  while (currentTime < now) {
    const intervalEnd = new Date(currentTime.getTime() + intervalMs);
    
    const intervalLogs = logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= currentTime && logTime < intervalEnd;
    });

    const intervalMetrics = metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp);
      return metricTime >= currentTime && metricTime < intervalEnd;
    });

    const intervalAlerts = alerts.filter(alert => {
      const alertTime = new Date(alert.createdAt);
      return alertTime >= currentTime && alertTime < intervalEnd;
    });

    intervals.push({
      timestamp: currentTime.toISOString(),
      logs: {
        total: intervalLogs.length,
        error: intervalLogs.filter(log => log.level === 'error').length,
        warn: intervalLogs.filter(log => log.level === 'warn').length,
        info: intervalLogs.filter(log => log.level === 'info').length,
        debug: intervalLogs.filter(log => log.level === 'debug').length,
      },
      metrics: {
        total: intervalMetrics.length,
        avgResponseTime: calculateAverageResponseTime(intervalMetrics),
        avgMemoryUsage: calculateAverageMemoryUsage(intervalMetrics),
      },
      alerts: {
        total: intervalAlerts.length,
        critical: intervalAlerts.filter(alert => alert.severity === 'critical').length,
        high: intervalAlerts.filter(alert => alert.severity === 'high').length,
        medium: intervalAlerts.filter(alert => alert.severity === 'medium').length,
        low: intervalAlerts.filter(alert => alert.severity === 'low').length,
      },
    });

    currentTime = intervalEnd;
  }

  return intervals;
}

function calculateComponentStats(logs: any[], metrics: any[], alerts: any[]): any {
  const components = new Set<string>();

  // Recopilar componentes de logs
  logs.forEach(log => {
    if (log.context.component) {
      components.add(log.context.component);
    }
  });

  // Recopilar componentes de métricas
  metrics.forEach(metric => {
    if (metric.tags.component) {
      components.add(metric.tags.component);
    }
  });

  // Recopilar componentes de alertas
  alerts.forEach(alert => {
    if (alert.tags.component) {
      components.add(alert.tags.component);
    }
  });

  const componentStats: any = {};

  components.forEach(component => {
    const componentLogs = logs.filter(log => log.context.component === component);
    const componentMetrics = metrics.filter(metric => metric.tags.component === component);
    const componentAlerts = alerts.filter(alert => alert.tags.component === component);

    componentStats[component] = {
      logs: {
        total: componentLogs.length,
        error: componentLogs.filter(log => log.level === 'error').length,
        warn: componentLogs.filter(log => log.level === 'warn').length,
      },
      metrics: {
        total: componentMetrics.length,
        avgResponseTime: calculateAverageResponseTime(componentMetrics),
        avgMemoryUsage: calculateAverageMemoryUsage(componentMetrics),
      },
      alerts: {
        total: componentAlerts.length,
        critical: componentAlerts.filter(alert => alert.severity === 'critical').length,
        high: componentAlerts.filter(alert => alert.severity === 'high').length,
      },
    };
  });

  return componentStats;
}

function calculateUserStats(logs: any[], metrics: any[], alerts: any[]): any {
  const users = new Set<string>();

  // Recopilar usuarios de logs
  logs.forEach(log => {
    if (log.context.userId) {
      users.add(log.context.userId);
    }
  });

  const userStats: any = {};

  users.forEach(userId => {
    const userLogs = logs.filter(log => log.context.userId === userId);
    const userMetrics = metrics.filter(metric => metric.tags.userId === userId);
    const userAlerts = alerts.filter(alert => alert.tags.userId === userId);

    userStats[userId] = {
      logs: {
        total: userLogs.length,
        error: userLogs.filter(log => log.level === 'error').length,
        warn: userLogs.filter(log => log.level === 'warn').length,
      },
      metrics: {
        total: userMetrics.length,
        avgResponseTime: calculateAverageResponseTime(userMetrics),
      },
      alerts: {
        total: userAlerts.length,
        critical: userAlerts.filter(alert => alert.severity === 'critical').length,
      },
    };
  });

  return userStats;
}

function calculateTrends(logs: any[], metrics: any[], alerts: any[], timeRange: string): any {
  const now = new Date();
  const startTime = new Date(now.getTime() - getTimeRangeMs(timeRange));
  const midTime = new Date(startTime.getTime() + (now.getTime() - startTime.getTime()) / 2);

  // Dividir en dos períodos
  const firstPeriodLogs = logs.filter(log => new Date(log.timestamp) < midTime);
  const secondPeriodLogs = logs.filter(log => new Date(log.timestamp) >= midTime);

  const firstPeriodMetrics = metrics.filter(metric => new Date(metric.timestamp) < midTime);
  const secondPeriodMetrics = metrics.filter(metric => new Date(metric.timestamp) >= midTime);

  const firstPeriodAlerts = alerts.filter(alert => new Date(alert.createdAt) < midTime);
  const secondPeriodAlerts = alerts.filter(alert => new Date(alert.createdAt) >= midTime);

  return {
    logs: {
      trend: calculateTrend(firstPeriodLogs.length, secondPeriodLogs.length),
      errorTrend: calculateTrend(
        firstPeriodLogs.filter(log => log.level === 'error').length,
        secondPeriodLogs.filter(log => log.level === 'error').length
      ),
    },
    metrics: {
      trend: calculateTrend(firstPeriodMetrics.length, secondPeriodMetrics.length),
      responseTimeTrend: calculateTrend(
        calculateAverageResponseTime(firstPeriodMetrics),
        calculateAverageResponseTime(secondPeriodMetrics)
      ),
    },
    alerts: {
      trend: calculateTrend(firstPeriodAlerts.length, secondPeriodAlerts.length),
      criticalTrend: calculateTrend(
        firstPeriodAlerts.filter(alert => alert.severity === 'critical').length,
        secondPeriodAlerts.filter(alert => alert.severity === 'critical').length
      ),
    },
  };
}

function getGranularityMs(granularity: string): number {
  switch (granularity) {
    case '1m':
      return 60 * 1000;
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

function calculateAverageMemoryUsage(metrics: any[]): number {
  const memoryMetrics = metrics.filter(m => m.name === 'memory.used');
  if (memoryMetrics.length === 0) return 0;
  
  const sum = memoryMetrics.reduce((acc, metric) => acc + metric.value, 0);
  return Math.round(sum / memoryMetrics.length);
}

function calculateTrend(first: number, second: number): 'up' | 'down' | 'stable' {
  if (first === 0 && second === 0) return 'stable';
  if (first === 0) return 'up';
  if (second === 0) return 'down';
  
  const change = ((second - first) / first) * 100;
  
  if (change > 10) return 'up';
  if (change < -10) return 'down';
  return 'stable';
}

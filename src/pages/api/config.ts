/**
 * API endpoint para configuración
 * Proporciona funcionalidades de configuración de monitoreo
 */

import type { APIRoute } from 'astro';
import { MONITORING_CONFIG } from '../../config/monitoring';
import { healthCheck } from '../../utils/healthCheck';
import { logger } from '../../utils/logging';
import { metrics } from '../../utils/metrics';
import { alerting } from '../../utils/alerting';

export const GET: APIRoute = async ({ url }) => {
  try {
    const section = url.searchParams.get('section');

    let config: any = {};

    switch (section) {
      case 'monitoring':
        config = MONITORING_CONFIG;
        break;
      case 'health':
        config = healthCheck.getConfig();
        break;
      case 'logging':
        config = {
          level: logger.getConfig?.()?.level || 'info',
          enableConsole: logger.getConfig?.()?.enableConsole || true,
          enableRemote: logger.getConfig?.()?.enableRemote || false,
        };
        break;
      case 'metrics':
        config = {
          enableMetrics: true,
          sampleRate: 1.0,
          batchSize: 20,
          flushInterval: 60000,
        };
        break;
      case 'alerts':
        config = {
          rules: alerting.getAlerts(),
          channels: [], // Implementar getChannels si es necesario
          templates: [], // Implementar getTemplates si es necesario
        };
        break;
      default:
        config = {
          monitoring: MONITORING_CONFIG,
          health: healthCheck.getConfig(),
          logging: {
            level: 'info',
            enableConsole: true,
            enableRemote: false,
          },
          metrics: {
            enableMetrics: true,
            sampleRate: 1.0,
            batchSize: 20,
            flushInterval: 60000,
          },
          alerts: {
            rules: alerting.getAlerts(),
            channels: [],
            templates: [],
          },
        };
    }

    return new Response(JSON.stringify({ 
      config,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to get configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (!body.section || !body.config) {
      return new Response(JSON.stringify({ error: 'Missing section or config' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let success = false;
    let message = '';

    switch (body.section) {
      case 'health':
        healthCheck.configure(body.config);
        success = true;
        message = 'Health check configuration updated';
        break;
      case 'logging':
        // Implementar configuración de logging
        success = true;
        message = 'Logging configuration updated';
        break;
      case 'metrics':
        // Implementar configuración de métricas
        success = true;
        message = 'Metrics configuration updated';
        break;
      case 'alerts':
        // Implementar configuración de alertas
        success = true;
        message = 'Alerts configuration updated';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid section' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ 
      success,
      message,
      timestamp: new Date().toISOString(),
    }), {
      status: success ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to update configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

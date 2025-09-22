/**
 * API endpoint para alertas
 * Proporciona funcionalidades de alertas y gestión de alertas
 */

import type { APIRoute } from 'astro';
import { alerting } from '../../utils/alerting';

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = {
      status: url.searchParams.get('status'),
      severity: url.searchParams.get('severity'),
      source: url.searchParams.get('source'),
      startTime: url.searchParams.get('startTime'),
      endTime: url.searchParams.get('endTime'),
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined,
    };

    // Filtrar parámetros undefined
    const filter = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    );

    const alerts = alerting.getAlerts(filter);
    const stats = alerting.getStats();

    return new Response(JSON.stringify({ 
      alerts,
      stats,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve alerts',
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
    
    if (!body.title || !body.description || !body.severity) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const alert = alerting.createAlert({
      title: body.title,
      description: body.description,
      severity: body.severity,
      status: 'active',
      source: body.source || 'api',
      tags: body.tags || {},
      channels: body.channels || ['console'],
      metadata: body.metadata || {},
    });

    return new Response(JSON.stringify({ 
      success: true,
      alert,
      timestamp: new Date().toISOString(),
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to create alert',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, url }) => {
  try {
    const alertId = url.searchParams.get('id');
    if (!alertId) {
      return new Response(JSON.stringify({ error: 'Alert ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const action = body.action;

    let success = false;
    let message = '';

    switch (action) {
      case 'acknowledge':
        success = alerting.acknowledgeAlert(alertId, body.acknowledgedBy || 'api');
        message = success ? 'Alert acknowledged' : 'Failed to acknowledge alert';
        break;
      case 'resolve':
        success = alerting.resolveAlert(alertId, body.resolvedBy || 'api');
        message = success ? 'Alert resolved' : 'Failed to resolve alert';
        break;
      case 'suppress':
        success = alerting.suppressAlert(
          alertId, 
          body.reason || 'Suppressed via API', 
          body.suppressedBy || 'api',
          body.duration || 60
        );
        message = success ? 'Alert suppressed' : 'Failed to suppress alert';
        break;
      case 'unsuppress':
        success = alerting.unsuppressAlert(alertId);
        message = success ? 'Alert unsuppressed' : 'Failed to unsuppress alert';
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
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
      error: 'Failed to update alert',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

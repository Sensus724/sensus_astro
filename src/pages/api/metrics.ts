/**
 * API endpoint para métricas
 * Proporciona funcionalidades de métricas y consulta de métricas
 */

import type { APIRoute } from 'astro';
import { metrics } from '../../utils/metrics';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (!body.metrics || !Array.isArray(body.metrics)) {
      return new Response(JSON.stringify({ error: 'Invalid metrics format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Procesar métricas
    body.metrics.forEach((metric: any) => {
      if (metric.name && metric.value !== undefined && metric.type) {
        switch (metric.type) {
          case 'counter':
            metrics.counter(metric.name, metric.value, metric.tags);
            break;
          case 'gauge':
            metrics.gauge(metric.name, metric.value, metric.tags);
            break;
          case 'histogram':
            metrics.histogram(metric.name, metric.value, metric.tags);
            break;
          case 'summary':
            metrics.summary(metric.name, metric.value, metric.tags);
            break;
        }
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      processed: body.metrics.length,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to process metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ url }) => {
  try {
    const params = {
      name: url.searchParams.get('name'),
      tags: url.searchParams.get('tags') ? JSON.parse(url.searchParams.get('tags')!) : undefined,
      startTime: url.searchParams.get('startTime'),
      endTime: url.searchParams.get('endTime'),
      aggregation: url.searchParams.get('aggregation') as 'sum' | 'avg' | 'min' | 'max' | 'count' | undefined,
      groupBy: url.searchParams.get('groupBy') ? url.searchParams.get('groupBy')!.split(',') : undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined,
    };

    // Filtrar parámetros undefined
    const query = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    );

    const metricsData = metrics.query(query);
    const aggregated = metrics.aggregate(query);
    const alerts = metrics.getAlerts();

    return new Response(JSON.stringify({ 
      metrics: metricsData,
      aggregated,
      alerts,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * API endpoint para logging
 * Proporciona funcionalidades de logging y consulta de logs
 */

import type { APIRoute } from 'astro';
import { logger } from '../../utils/logging';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    if (!body.logs || !Array.isArray(body.logs)) {
      return new Response(JSON.stringify({ error: 'Invalid logs format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Procesar logs
    body.logs.forEach((log: any) => {
      if (log.level && log.message) {
        logger.log(log.level, log.message, log.context);
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      processed: body.logs.length,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to process logs',
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
      level: url.searchParams.get('level'),
      component: url.searchParams.get('component'),
      userId: url.searchParams.get('userId'),
      sessionId: url.searchParams.get('sessionId'),
      startTime: url.searchParams.get('startTime'),
      endTime: url.searchParams.get('endTime'),
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined,
    };

    // Filtrar parámetros undefined
    const filter = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== null && value !== undefined)
    );

    const logs = logger.getLogs(filter);
    const stats = logger.getStats();

    return new Response(JSON.stringify({ 
      logs,
      stats,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to retrieve logs',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

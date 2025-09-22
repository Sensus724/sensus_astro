/**
 * API endpoint para health check
 * Proporciona información de salud de la aplicación
 */

import type { APIRoute } from 'astro';
import { healthCheck } from '../../utils/healthCheck';

export const GET: APIRoute = async ({ request, url }) => {
  try {
    // Verificar si se solicita un check específico
    const checkId = url.searchParams.get('check');
    
    if (checkId) {
      // Retornar un check específico
      const check = healthCheck.getCheck(checkId);
      if (!check) {
        return new Response(JSON.stringify({ error: 'Check not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(check), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ejecutar todos los checks
    const result = await healthCheck.runChecks();
    
    // Determinar el código de estado HTTP
    let statusCode = 200;
    if (result.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    } else if (result.status === 'degraded') {
      statusCode = 200; // OK pero con advertencias
    }

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Health check failed',
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
    
    // Configurar health check
    if (body.config) {
      healthCheck.configure(body.config);
    }
    
    // Agregar nuevo check
    if (body.check) {
      healthCheck.addCheck(body.check);
    }
    
    // Ejecutar checks
    const result = await healthCheck.runChecks();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Health check configuration failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

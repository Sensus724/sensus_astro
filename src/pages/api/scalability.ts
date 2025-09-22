import type { APIRoute } from 'astro';
import { scalability } from '../../utils/scalability';
import { hasPermission } from '../../utils/security';

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const userId = authHeader?.split('Bearer ')[1]; // Simplified: In real app, verify token

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'getMetrics') {
      const metrics = scalability.getPerformanceMetrics();
      const resources = scalability.getResourceUsage();
      return new Response(JSON.stringify({ 
        metrics: metrics.slice(-limit), 
        resources: resources.slice(-limit) 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getScalingRules') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const rules = scalability.getScalingRules();
      return new Response(JSON.stringify({ rules }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getScalingEvents') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const events = scalability.getScalingEvents();
      return new Response(JSON.stringify({ events: events.slice(-limit) }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getCacheStrategies') {
      const strategies = scalability.getCacheStrategies();
      return new Response(JSON.stringify({ strategies }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getLoadBalancers') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const loadBalancers = scalability.getLoadBalancers();
      return new Response(JSON.stringify({ loadBalancers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getOptimizations') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const dbOptimizations = scalability.getDatabaseOptimizations();
      const perfOptimizations = scalability.getPerformanceOptimizations();
      return new Response(JSON.stringify({ 
        database: dbOptimizations, 
        performance: perfOptimizations 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getConfig') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const config = scalability.getConfig();
      return new Response(JSON.stringify({ config }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Scalability API GET error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const userId = authHeader?.split('Bearer ')[1]; // Simplified: In real app, verify token

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { action, ...data } = body;

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'createScalingRule') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const rule = await scalability.createScalingRule(data);
      return new Response(JSON.stringify({ success: true, rule }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createCacheStrategy') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const strategy = await scalability.createCacheStrategy(data);
      return new Response(JSON.stringify({ success: true, strategy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'optimizeCache') {
      await scalability.optimizeCache();
      return new Response(JSON.stringify({ success: true, message: 'Cache optimized' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'applyDatabaseOptimization') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await scalability.applyDatabaseOptimization(data.optimizationId);
      return new Response(JSON.stringify({ success, message: success ? 'Optimization applied' : 'Optimization failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'applyPerformanceOptimization') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await scalability.applyPerformanceOptimization(data.optimizationId);
      return new Response(JSON.stringify({ success, message: success ? 'Optimization applied' : 'Optimization failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateConfig') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      scalability.updateConfig(data.config);
      return new Response(JSON.stringify({ success: true, message: 'Configuration updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generateOptimizations') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const dbOptimizations = await scalability.optimizeDatabase();
      const perfOptimizations = await scalability.optimizePerformance();
      return new Response(JSON.stringify({ 
        success: true, 
        database: dbOptimizations, 
        performance: perfOptimizations 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Scalability API POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const userId = authHeader?.split('Bearer ')[1]; // Simplified: In real app, verify token

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json();
  const { action, ...data } = body;

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (!isAdmin && !isDevOps) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateScalingRule') {
      // En una implementación real, actualizarías la regla en la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Scaling rule updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateCacheStrategy') {
      // En una implementación real, actualizarías la estrategia en la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Cache strategy updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'updateLoadBalancer') {
      // En una implementación real, actualizarías el load balancer en la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Load balancer updated' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Scalability API PUT error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const userId = authHeader?.split('Bearer ')[1]; // Simplified: In real app, verify token

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const id = url.searchParams.get('id');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (!isAdmin && !isDevOps) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'deleteScalingRule' && id) {
      // En una implementación real, eliminarías la regla de la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Scaling rule deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'deleteCacheStrategy' && id) {
      // En una implementación real, eliminarías la estrategia de la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Cache strategy deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'deleteLoadBalancer' && id) {
      // En una implementación real, eliminarías el load balancer de la base de datos
      return new Response(JSON.stringify({ success: true, message: 'Load balancer deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or missing ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Scalability API DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

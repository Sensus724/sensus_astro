import type { APIRoute } from 'astro';
import { caching } from '../../utils/caching';
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
  const strategyId = url.searchParams.get('strategyId');
  const key = url.searchParams.get('key');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'get') {
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const value = await caching.get(key, strategyId || 'memory-cache');
      return new Response(JSON.stringify({ key, value }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getStrategies') {
      const strategies = caching.getStrategies();
      return new Response(JSON.stringify({ strategies }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getStrategy') {
      if (!strategyId) {
        return new Response(JSON.stringify({ error: 'StrategyId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const strategy = caching.getStrategy(strategyId);
      if (!strategy) {
        return new Response(JSON.stringify({ error: 'Strategy not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ strategy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getStats') {
      if (!strategyId) {
        return new Response(JSON.stringify({ error: 'StrategyId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const stats = caching.getStats(strategyId);
      if (!stats) {
        return new Response(JSON.stringify({ error: 'Stats not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getAllStats') {
      const allStats = caching.getAllStats();
      const statsObject = Object.fromEntries(allStats);
      return new Response(JSON.stringify({ stats: statsObject }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getInvalidationRules') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const rules = caching.getInvalidationRules();
      return new Response(JSON.stringify({ rules }), {
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
      const optimizations = caching.getOptimizations();
      return new Response(JSON.stringify({ optimizations }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getMemoryCacheEntries') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const entries = caching.getMemoryCacheEntries();
      return new Response(JSON.stringify({ entries }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Caching API GET error:', error);
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

    if (action === 'set') {
      const { key, value, strategyId, options } = data;
      if (!key || value === undefined) {
        return new Response(JSON.stringify({ error: 'Key and value required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await caching.set(key, value, strategyId || 'memory-cache', options);
      return new Response(JSON.stringify({ success, message: success ? 'Value cached' : 'Failed to cache' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createStrategy') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const strategy = await caching.createStrategy(data);
      return new Response(JSON.stringify({ success: true, strategy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'invalidate') {
      const { pattern, strategyId } = data;
      if (!pattern) {
        return new Response(JSON.stringify({ error: 'Pattern required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const count = await caching.invalidate(pattern, strategyId || 'memory-cache');
      return new Response(JSON.stringify({ success: true, count, message: `${count} entries invalidated` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'invalidateByTags') {
      const { tags, strategyId } = data;
      if (!tags || !Array.isArray(tags)) {
        return new Response(JSON.stringify({ error: 'Tags array required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const count = await caching.invalidateByTags(tags, strategyId || 'memory-cache');
      return new Response(JSON.stringify({ success: true, count, message: `${count} entries invalidated` }), {
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
      const optimizations = await caching.generateOptimizations();
      return new Response(JSON.stringify({ success: true, optimizations }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Caching API POST error:', error);
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

    if (action === 'updateStrategy') {
      const { strategyId, updates } = data;
      if (!strategyId) {
        return new Response(JSON.stringify({ error: 'StrategyId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await caching.updateStrategy(strategyId, updates);
      return new Response(JSON.stringify({ success, message: success ? 'Strategy updated' : 'Strategy not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Caching API PUT error:', error);
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
  const key = url.searchParams.get('key');
  const strategyId = url.searchParams.get('strategyId');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'delete') {
      if (!key) {
        return new Response(JSON.stringify({ error: 'Key parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await caching.delete(key, strategyId || 'memory-cache');
      return new Response(JSON.stringify({ success, message: success ? 'Entry deleted' : 'Entry not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'applyOptimization') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const optimizationId = url.searchParams.get('optimizationId');
      if (!optimizationId) {
        return new Response(JSON.stringify({ error: 'OptimizationId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await caching.applyOptimization(optimizationId);
      return new Response(JSON.stringify({ success, message: success ? 'Optimization applied' : 'Optimization failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Caching API DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

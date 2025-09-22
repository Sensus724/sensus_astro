import type { APIRoute } from 'astro';
import { loadBalancing } from '../../utils/loadBalancing';
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
  const loadBalancerId = url.searchParams.get('loadBalancerId');
  const clientIp = request.headers.get('X-Forwarded-For') || request.headers.get('X-Real-IP') || '127.0.0.1';

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'selectTarget') {
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const target = await loadBalancing.selectTarget(loadBalancerId, clientIp);
      if (!target) {
        return new Response(JSON.stringify({ error: 'No healthy targets available' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ target }), {
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
      const loadBalancers = loadBalancing.getLoadBalancers();
      return new Response(JSON.stringify({ loadBalancers }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getLoadBalancer') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const loadBalancer = loadBalancing.getLoadBalancer(loadBalancerId);
      if (!loadBalancer) {
        return new Response(JSON.stringify({ error: 'Load balancer not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ loadBalancer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getStats') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const stats = loadBalancing.getStats(loadBalancerId);
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
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const allStats = loadBalancing.getAllStats();
      const statsObject = Object.fromEntries(allStats);
      return new Response(JSON.stringify({ stats: statsObject }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getHealthyTargets') {
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const targets = loadBalancing.getHealthyTargets(loadBalancerId);
      return new Response(JSON.stringify({ targets }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getUnhealthyTargets') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const targets = loadBalancing.getUnhealthyTargets(loadBalancerId);
      return new Response(JSON.stringify({ targets }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Load Balancing API GET error:', error);
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

    if (!isAdmin && !isDevOps) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createLoadBalancer') {
      const loadBalancer = await loadBalancing.createLoadBalancer(data);
      return new Response(JSON.stringify({ success: true, loadBalancer }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'addTarget') {
      const { loadBalancerId, target } = data;
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const newTarget = await loadBalancing.addTarget(loadBalancerId, target);
      return new Response(JSON.stringify({ success: true, target: newTarget }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'recordRequest') {
      const { loadBalancerId, targetId, success, responseTime } = data;
      if (!loadBalancerId || !targetId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId and TargetId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      await loadBalancing.recordRequest(loadBalancerId, targetId, success, responseTime);
      return new Response(JSON.stringify({ success: true, message: 'Request recorded' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Load Balancing API POST error:', error);
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

    if (action === 'updateTarget') {
      const { loadBalancerId, targetId, updates } = data;
      if (!loadBalancerId || !targetId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId and TargetId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await loadBalancing.updateTarget(loadBalancerId, targetId, updates);
      return new Response(JSON.stringify({ success, message: success ? 'Target updated' : 'Target not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'enableLoadBalancer') {
      const { loadBalancerId } = data;
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await loadBalancing.enableLoadBalancer(loadBalancerId);
      return new Response(JSON.stringify({ success, message: success ? 'Load balancer enabled' : 'Load balancer not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'disableLoadBalancer') {
      const { loadBalancerId } = data;
      if (!loadBalancerId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await loadBalancing.disableLoadBalancer(loadBalancerId);
      return new Response(JSON.stringify({ success, message: success ? 'Load balancer disabled' : 'Load balancer not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Load Balancing API PUT error:', error);
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
  const loadBalancerId = url.searchParams.get('loadBalancerId');
  const targetId = url.searchParams.get('targetId');

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

    if (action === 'removeTarget') {
      if (!loadBalancerId || !targetId) {
        return new Response(JSON.stringify({ error: 'LoadBalancerId and TargetId parameters required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await loadBalancing.removeTarget(loadBalancerId, targetId);
      return new Response(JSON.stringify({ success, message: success ? 'Target removed' : 'Target not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Load Balancing API DELETE error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

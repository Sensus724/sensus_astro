import type { APIRoute } from 'astro';
import { databaseOptimization } from '../../utils/databaseOptimization';
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
  const connectionId = url.searchParams.get('connectionId');
  const strategyId = url.searchParams.get('strategyId');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'getConnections') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const connections = databaseOptimization.getConnections();
      return new Response(JSON.stringify({ connections }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getConnection') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!connectionId) {
        return new Response(JSON.stringify({ error: 'ConnectionId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const connection = databaseOptimization.getConnection(connectionId);
      if (!connection) {
        return new Response(JSON.stringify({ error: 'Connection not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ connection }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getQueryAnalyses') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const analyses = databaseOptimization.getQueryAnalyses();
      return new Response(JSON.stringify({ analyses }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getSlowQueries') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const slowQueries = databaseOptimization.getSlowQueries();
      return new Response(JSON.stringify({ slowQueries }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getIndexRecommendations') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const recommendations = databaseOptimization.getIndexRecommendations();
      return new Response(JSON.stringify({ recommendations }), {
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
      const optimizations = databaseOptimization.getOptimizations();
      return new Response(JSON.stringify({ optimizations }), {
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
      const stats = databaseOptimization.getStats();
      return new Response(JSON.stringify({ stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getPartitionStrategies') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const strategies = databaseOptimization.getPartitionStrategies();
      return new Response(JSON.stringify({ strategies }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getPartitionStrategy') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!strategyId) {
        return new Response(JSON.stringify({ error: 'StrategyId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const strategy = databaseOptimization.getPartitionStrategy(strategyId);
      if (!strategy) {
        return new Response(JSON.stringify({ error: 'Partition strategy not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ strategy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Database Optimization API GET error:', error);
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

    if (action === 'applyIndexRecommendation') {
      const { recommendationId } = data;
      if (!recommendationId) {
        return new Response(JSON.stringify({ error: 'RecommendationId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await databaseOptimization.applyIndexRecommendation(recommendationId);
      return new Response(JSON.stringify({ success, message: success ? 'Index recommendation applied' : 'Index recommendation failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'applyOptimization') {
      const { optimizationId } = data;
      if (!optimizationId) {
        return new Response(JSON.stringify({ error: 'OptimizationId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await databaseOptimization.applyOptimization(optimizationId);
      return new Response(JSON.stringify({ success, message: success ? 'Optimization applied' : 'Optimization failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createPartitionStrategy') {
      const strategy = await databaseOptimization.createPartitionStrategy(data);
      return new Response(JSON.stringify({ success: true, strategy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'optimizeConnectionPool') {
      const { connectionId, newMaxConnections } = data;
      if (!connectionId || !newMaxConnections) {
        return new Response(JSON.stringify({ error: 'ConnectionId and newMaxConnections required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await databaseOptimization.optimizeConnectionPool(connectionId, newMaxConnections);
      return new Response(JSON.stringify({ success, message: success ? 'Connection pool optimized' : 'Connection pool optimization failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'runMaintenanceTask') {
      const { taskType } = data;
      if (!taskType || !['vacuum', 'analyze', 'reindex'].includes(taskType)) {
        return new Response(JSON.stringify({ error: 'Valid taskType required (vacuum, analyze, reindex)' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await databaseOptimization.runMaintenanceTask(taskType);
      return new Response(JSON.stringify({ success, message: success ? `${taskType} task completed` : `${taskType} task failed` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Database Optimization API POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

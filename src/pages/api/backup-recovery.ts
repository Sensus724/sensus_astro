import type { APIRoute } from 'astro';
import { backupRecovery } from '../../utils/backupRecovery';
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
  const jobId = url.searchParams.get('jobId');
  const recoveryId = url.searchParams.get('recoveryId');

  try {
    // Verificar permisos para operaciones administrativas
    const isAdmin = await hasPermission(userId, 'admin');
    const isDevOps = await hasPermission(userId, 'devops');

    if (action === 'getBackupJobs') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const jobs = backupRecovery.getBackupJobs();
      return new Response(JSON.stringify({ jobs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getBackupJob') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'JobId parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const job = backupRecovery.getBackupJob(jobId);
      if (!job) {
        return new Response(JSON.stringify({ error: 'Backup job not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ job }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getBackupExecutions') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const executions = backupRecovery.getBackupExecutions();
      return new Response(JSON.stringify({ executions }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getRecoveryJobs') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const recoveryJobs = backupRecovery.getRecoveryJobs();
      return new Response(JSON.stringify({ recoveryJobs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getStorageLocations') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const storageLocations = backupRecovery.getStorageLocations();
      return new Response(JSON.stringify({ storageLocations }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getBackupPolicies') {
      if (!isAdmin && !isDevOps) {
        return new Response(JSON.stringify({ error: 'Forbidden: Admin or DevOps access required' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const policies = backupRecovery.getBackupPolicies();
      return new Response(JSON.stringify({ policies }), {
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
      const stats = backupRecovery.getStats();
      return new Response(JSON.stringify({ stats }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Backup Recovery API GET error:', error);
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

    if (action === 'createBackupJob') {
      const job = await backupRecovery.createBackupJob(data);
      return new Response(JSON.stringify({ success: true, job }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'runBackupJob') {
      const { jobId } = data;
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'JobId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await backupRecovery.runBackupJob(jobId);
      return new Response(JSON.stringify({ success, message: success ? 'Backup job started' : 'Backup job failed to start' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'pauseBackupJob') {
      const { jobId } = data;
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'JobId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await backupRecovery.pauseBackupJob(jobId);
      return new Response(JSON.stringify({ success, message: success ? 'Backup job paused' : 'Backup job not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'resumeBackupJob') {
      const { jobId } = data;
      if (!jobId) {
        return new Response(JSON.stringify({ error: 'JobId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await backupRecovery.resumeBackupJob(jobId);
      return new Response(JSON.stringify({ success, message: success ? 'Backup job resumed' : 'Backup job not found' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createRecoveryJob') {
      const recovery = await backupRecovery.createRecoveryJob(data);
      return new Response(JSON.stringify({ success: true, recovery }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'executeRecoveryJob') {
      const { recoveryId } = data;
      if (!recoveryId) {
        return new Response(JSON.stringify({ error: 'RecoveryId required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const success = await backupRecovery.executeRecoveryJob(recoveryId);
      return new Response(JSON.stringify({ success, message: success ? 'Recovery job completed' : 'Recovery job failed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createStorageLocation') {
      const storage = await backupRecovery.createStorageLocation(data);
      return new Response(JSON.stringify({ success: true, storage }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'createBackupPolicy') {
      const policy = await backupRecovery.createBackupPolicy(data);
      return new Response(JSON.stringify({ success: true, policy }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Backup Recovery API POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

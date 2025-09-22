/**
 * API endpoint para seguridad
 * Proporciona funcionalidades de autenticación, autorización y seguridad
 */

import type { APIRoute } from 'astro';
import { security } from '../../utils/security';
import { dataProtection } from '../../utils/dataProtection';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'authenticate':
        return await handleAuthentication(body, request);
      case 'logout':
        return await handleLogout(body, request);
      case 'refresh':
        return await handleRefresh(body, request);
      case 'authorize':
        return await handleAuthorization(body, request);
      case 'createUser':
        return await handleCreateUser(body, request);
      case 'updateUser':
        return await handleUpdateUser(body, request);
      case 'deleteUser':
        return await handleDeleteUser(body, request);
      case 'validatePassword':
        return await handleValidatePassword(body, request);
      case 'enable2FA':
        return await handleEnable2FA(body, request);
      case 'verify2FA':
        return await handleVerify2FA(body, request);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Security operation failed',
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
    const action = url.searchParams.get('action');

    switch (action) {
      case 'users':
        return await getUsers();
      case 'sessions':
        return await getSessions();
      case 'securityEvents':
        return await getSecurityEvents();
      case 'config':
        return await getSecurityConfig();
      case 'validateSession':
        return await validateSession(url);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Security query failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function handleAuthentication(body: any, request: Request): Promise<Response> {
  const { email, password } = body;
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  const result = await security.authenticate(email, password, ipAddress, userAgent);
  
  if (result.success) {
    return new Response(JSON.stringify({ 
      success: true,
      user: result.user,
      session: result.session,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    return new Response(JSON.stringify({ 
      success: false,
      error: result.error,
      timestamp: new Date().toISOString(),
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleLogout(body: any, request: Request): Promise<Response> {
  const { sessionId } = body;
  
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Session ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  const success = await security.logout(sessionId, ipAddress, userAgent);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleRefresh(body: any, request: Request): Promise<Response> {
  const { sessionId, refreshToken } = body;
  
  if (!sessionId || !refreshToken) {
    return new Response(JSON.stringify({ error: 'Session ID and refresh token are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await security.refreshToken(sessionId, refreshToken);
  
  return new Response(JSON.stringify({ 
    success: result.success,
    session: result.session,
    error: result.error,
    timestamp: new Date().toISOString(),
  }), {
    status: result.success ? 200 : 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleAuthorization(body: any, request: Request): Promise<Response> {
  const { userId, resource, action, context } = body;
  
  if (!userId || !resource || !action) {
    return new Response(JSON.stringify({ error: 'User ID, resource, and action are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const authorized = await security.authorize(userId, resource, action, context);
  
  return new Response(JSON.stringify({ 
    authorized,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleCreateUser(body: any, request: Request): Promise<Response> {
  const { email, name, role, permissions } = body;
  
  if (!email || !name) {
    return new Response(JSON.stringify({ error: 'Email and name are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const user = await security.createUser({
      email,
      name,
      role: role || 'user',
      permissions: permissions || ['content:read', 'profile:read', 'profile:update'],
      isActive: true,
      isVerified: false,
      metadata: {},
    });

    return new Response(JSON.stringify({ 
      success: true,
      user,
      timestamp: new Date().toISOString(),
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleUpdateUser(body: any, request: Request): Promise<Response> {
  const { userId, updates } = body;
  
  if (!userId || !updates) {
    return new Response(JSON.stringify({ error: 'User ID and updates are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await security.updateUser(userId, updates);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleDeleteUser(body: any, request: Request): Promise<Response> {
  const { userId } = body;
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await security.deleteUser(userId);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleValidatePassword(body: any, request: Request): Promise<Response> {
  const { password } = body;
  
  if (!password) {
    return new Response(JSON.stringify({ error: 'Password is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = await security.validatePassword(password);
  
  return new Response(JSON.stringify({ 
    valid: validation.valid,
    errors: validation.errors,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleEnable2FA(body: any, request: Request): Promise<Response> {
  const { userId } = body;
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await security.enableTwoFactor(userId);
  
  return new Response(JSON.stringify({ 
    success: true,
    secret: result.secret,
    qrCode: result.qrCode,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleVerify2FA(body: any, request: Request): Promise<Response> {
  const { userId, token } = body;
  
  if (!userId || !token) {
    return new Response(JSON.stringify({ error: 'User ID and token are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isValid = await security.verifyTwoFactor(userId, token);
  
  return new Response(JSON.stringify({ 
    valid: isValid,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getUsers(): Promise<Response> {
  const users = security.getUsers();
  
  return new Response(JSON.stringify({ 
    users,
    count: users.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getSessions(): Promise<Response> {
  const sessions = security.getSessions();
  
  return new Response(JSON.stringify({ 
    sessions,
    count: sessions.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getSecurityEvents(): Promise<Response> {
  const events = security.getSecurityEvents();
  
  return new Response(JSON.stringify({ 
    events,
    count: events.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getSecurityConfig(): Promise<Response> {
  const config = security.getConfig();
  
  return new Response(JSON.stringify({ 
    config,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function validateSession(url: URL): Promise<Response> {
  const sessionId = url.searchParams.get('sessionId');
  const token = url.searchParams.get('token');
  
  if (!sessionId || !token) {
    return new Response(JSON.stringify({ error: 'Session ID and token are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = await security.validateSession(sessionId, token);
  
  return new Response(JSON.stringify({ 
    valid: validation.valid,
    user: validation.user,
    session: validation.session,
    timestamp: new Date().toISOString(),
  }), {
    status: validation.valid ? 200 : 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getClientIP(request: Request): string {
  // En un entorno real, esto obtendría la IP real del cliente
  return '127.0.0.1';
}

/**
 * API endpoint para privacidad y protección de datos
 * Proporciona funcionalidades de GDPR, consentimiento y derechos de datos
 */

import type { APIRoute } from 'astro';
import { dataProtection } from '../../utils/dataProtection';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'createDataSubject':
        return await handleCreateDataSubject(body, request);
      case 'updateDataSubject':
        return await handleUpdateDataSubject(body, request);
      case 'deleteDataSubject':
        return await handleDeleteDataSubject(body, request);
      case 'grantConsent':
        return await handleGrantConsent(body, request);
      case 'withdrawConsent':
        return await handleWithdrawConsent(body, request);
      case 'exerciseRight':
        return await handleExerciseRight(body, request);
      case 'reportBreach':
        return await handleReportBreach(body, request);
      case 'exportData':
        return await handleExportData(body, request);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Privacy operation failed',
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
      case 'dataSubjects':
        return await getDataSubjects();
      case 'processingActivities':
        return await getProcessingActivities();
      case 'dataBreaches':
        return await getDataBreaches();
      case 'privacyPolicies':
        return await getPrivacyPolicies();
      case 'consentStatus':
        return await getConsentStatus(url);
      case 'compliance':
        return await getCompliance();
      case 'dataSubject':
        return await getDataSubject(url);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Privacy query failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function handleCreateDataSubject(body: any, request: Request): Promise<Response> {
  const { email, name, data } = body;
  
  if (!email || !name) {
    return new Response(JSON.stringify({ error: 'Email and name are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const dataSubject = await dataProtection.createDataSubject({
      email,
      name,
      data: data || {},
    });

    return new Response(JSON.stringify({ 
      success: true,
      dataSubject,
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

async function handleUpdateDataSubject(body: any, request: Request): Promise<Response> {
  const { dataSubjectId, updates } = body;
  
  if (!dataSubjectId || !updates) {
    return new Response(JSON.stringify({ error: 'Data subject ID and updates are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await dataProtection.updateDataSubject(dataSubjectId, updates);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleDeleteDataSubject(body: any, request: Request): Promise<Response> {
  const { dataSubjectId } = body;
  
  if (!dataSubjectId) {
    return new Response(JSON.stringify({ error: 'Data subject ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const success = await dataProtection.deleteDataSubject(dataSubjectId);
    
    return new Response(JSON.stringify({ 
      success,
      timestamp: new Date().toISOString(),
    }), {
      status: success ? 200 : 400,
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

async function handleGrantConsent(body: any, request: Request): Promise<Response> {
  const { dataSubjectId, purpose, legalBasis } = body;
  
  if (!dataSubjectId || !purpose || !legalBasis) {
    return new Response(JSON.stringify({ error: 'Data subject ID, purpose, and legal basis are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const consent = await dataProtection.grantConsent(dataSubjectId, purpose, legalBasis);
    
    return new Response(JSON.stringify({ 
      success: true,
      consent,
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

async function handleWithdrawConsent(body: any, request: Request): Promise<Response> {
  const { dataSubjectId, consentId } = body;
  
  if (!dataSubjectId || !consentId) {
    return new Response(JSON.stringify({ error: 'Data subject ID and consent ID are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await dataProtection.withdrawConsent(dataSubjectId, consentId);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleExerciseRight(body: any, request: Request): Promise<Response> {
  const { dataSubjectId, right } = body;
  
  if (!dataSubjectId || !right) {
    return new Response(JSON.stringify({ error: 'Data subject ID and right are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await dataProtection.exerciseDataRight(dataSubjectId, right);
  
  return new Response(JSON.stringify({ 
    success: result.success,
    data: result.data,
    error: result.error,
    timestamp: new Date().toISOString(),
  }), {
    status: result.success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleReportBreach(body: any, request: Request): Promise<Response> {
  const { description, dataCategories, affectedSubjects, severity, measures } = body;
  
  if (!description || !dataCategories || !affectedSubjects || !severity) {
    return new Response(JSON.stringify({ error: 'Description, data categories, affected subjects, and severity are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const breach = await dataProtection.reportDataBreach({
      description,
      dataCategories,
      affectedSubjects,
      severity,
      measures: measures || [],
      metadata: {},
    });

    return new Response(JSON.stringify({ 
      success: true,
      breach,
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

async function handleExportData(body: any, request: Request): Promise<Response> {
  const { dataSubjectId } = body;
  
  if (!dataSubjectId) {
    return new Response(JSON.stringify({ error: 'Data subject ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const exportData = await dataProtection.exportData(dataSubjectId);
    
    return new Response(exportData, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="data-export-${dataSubjectId}.json"`,
      },
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

async function getDataSubjects(): Promise<Response> {
  const dataSubjects = dataProtection.getDataSubjects();
  
  return new Response(JSON.stringify({ 
    dataSubjects,
    count: dataSubjects.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getProcessingActivities(): Promise<Response> {
  const activities = dataProtection.getProcessingActivities();
  
  return new Response(JSON.stringify({ 
    activities,
    count: activities.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDataBreaches(): Promise<Response> {
  const breaches = dataProtection.getDataBreaches();
  
  return new Response(JSON.stringify({ 
    breaches,
    count: breaches.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getPrivacyPolicies(): Promise<Response> {
  const policies = dataProtection.getPrivacyPolicies();
  
  return new Response(JSON.stringify({ 
    policies,
    count: policies.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getConsentStatus(url: URL): Promise<Response> {
  const dataSubjectId = url.searchParams.get('dataSubjectId');
  const purpose = url.searchParams.get('purpose');
  
  if (!dataSubjectId || !purpose) {
    return new Response(JSON.stringify({ error: 'Data subject ID and purpose are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const hasConsent = await dataProtection.getConsentStatus(dataSubjectId, purpose);
  
  return new Response(JSON.stringify({ 
    hasConsent,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getCompliance(): Promise<Response> {
  const compliance = await dataProtection.checkCompliance();
  
  return new Response(JSON.stringify({ 
    compliance,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDataSubject(url: URL): Promise<Response> {
  const dataSubjectId = url.searchParams.get('id');
  
  if (!dataSubjectId) {
    return new Response(JSON.stringify({ error: 'Data subject ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dataSubject = await dataProtection.getDataSubject(dataSubjectId);
  
  if (!dataSubject) {
    return new Response(JSON.stringify({ error: 'Data subject not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ 
    dataSubject,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

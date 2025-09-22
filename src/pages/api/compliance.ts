/**
 * API endpoint para cumplimiento y regulaciones
 * Proporciona funcionalidades de GDPR, CCPA, LGPD y otras regulaciones
 */

import type { APIRoute } from 'astro';
import { compliance } from '../../utils/compliance';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'runAssessment':
        return await handleRunAssessment(body, request);
      case 'createDataProcessingRecord':
        return await handleCreateDataProcessingRecord(body, request);
      case 'updateDataProcessingRecord':
        return await handleUpdateDataProcessingRecord(body, request);
      case 'recordConsent':
        return await handleRecordConsent(body, request);
      case 'withdrawConsent':
        return await handleWithdrawConsent(body, request);
      case 'recordDataBreach':
        return await handleRecordDataBreach(body, request);
      case 'generateReport':
        return await handleGenerateReport(body, request);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Compliance operation failed',
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
      case 'regulations':
        return await getRegulations();
      case 'assessments':
        return await getAssessments();
      case 'dataProcessingRecords':
        return await getDataProcessingRecords();
      case 'consentRecords':
        return await getConsentRecords();
      case 'dataBreachRecords':
        return await getDataBreachRecords();
      case 'complianceStatus':
        return await getComplianceStatus();
      case 'regulation':
        return await getRegulation(url);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Compliance query failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function handleRunAssessment(body: any, request: Request): Promise<Response> {
  const { regulationId, scope } = body;
  
  if (!regulationId) {
    return new Response(JSON.stringify({ error: 'Regulation ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const assessment = await compliance.runComplianceAssessment(regulationId, scope || ['all']);
    
    return new Response(JSON.stringify({ 
      success: true,
      assessment,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
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

async function handleCreateDataProcessingRecord(body: any, request: Request): Promise<Response> {
  const { name, description, purpose, legalBasis, dataCategories, dataSubjects, recipients, retentionPeriod, securityMeasures, crossBorderTransfer, automatedDecision, dpoRequired, dpiaRequired } = body;
  
  if (!name || !description || !purpose || !legalBasis) {
    return new Response(JSON.stringify({ error: 'Name, description, purpose, and legal basis are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const record = await compliance.createDataProcessingRecord({
      name,
      description,
      purpose,
      legalBasis,
      dataCategories: dataCategories || [],
      dataSubjects: dataSubjects || [],
      recipients: recipients || [],
      retentionPeriod: retentionPeriod || 2555,
      securityMeasures: securityMeasures || [],
      crossBorderTransfer: crossBorderTransfer || false,
      automatedDecision: automatedDecision || false,
      dpoRequired: dpoRequired || false,
      dpiaRequired: dpiaRequired || false,
    });

    return new Response(JSON.stringify({ 
      success: true,
      record,
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

async function handleUpdateDataProcessingRecord(body: any, request: Request): Promise<Response> {
  const { recordId, updates } = body;
  
  if (!recordId || !updates) {
    return new Response(JSON.stringify({ error: 'Record ID and updates are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await compliance.updateDataProcessingRecord(recordId, updates);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleRecordConsent(body: any, request: Request): Promise<Response> {
  const { dataSubjectId, purpose, legalBasis, version, language, method, evidence, metadata } = body;
  
  if (!dataSubjectId || !purpose || !legalBasis) {
    return new Response(JSON.stringify({ error: 'Data subject ID, purpose, and legal basis are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const consent = await compliance.recordConsent({
      dataSubjectId,
      purpose,
      legalBasis,
      granted: true,
      grantedAt: new Date().toISOString(),
      version: version || '1.0',
      language: language || 'es',
      method: method || 'explicit',
      evidence: evidence || [],
      metadata: metadata || {},
    });

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
  const { consentId } = body;
  
  if (!consentId) {
    return new Response(JSON.stringify({ error: 'Consent ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const success = await compliance.withdrawConsent(consentId);
  
  return new Response(JSON.stringify({ 
    success,
    timestamp: new Date().toISOString(),
  }), {
    status: success ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleRecordDataBreach(body: any, request: Request): Promise<Response> {
  const { description, dataCategories, affectedSubjects, severity, measures, rootCause, prevention, metadata } = body;
  
  if (!description || !dataCategories || !affectedSubjects || !severity) {
    return new Response(JSON.stringify({ error: 'Description, data categories, affected subjects, and severity are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const breach = await compliance.recordDataBreach({
      description,
      dataCategories,
      affectedSubjects,
      severity,
      discoveredAt: new Date().toISOString(),
      status: 'discovered',
      measures: measures || [],
      rootCause,
      prevention: prevention || [],
      metadata: metadata || {},
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

async function handleGenerateReport(body: any, request: Request): Promise<Response> {
  const { regulationId, period } = body;
  
  if (!regulationId || !period) {
    return new Response(JSON.stringify({ error: 'Regulation ID and period are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const report = await compliance.generateComplianceReport(regulationId, period);
    
    return new Response(JSON.stringify({ 
      success: true,
      report,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
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

async function getRegulations(): Promise<Response> {
  const regulations = compliance.getRegulations();
  
  return new Response(JSON.stringify({ 
    regulations,
    count: regulations.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getAssessments(): Promise<Response> {
  const assessments = compliance.getAssessments();
  
  return new Response(JSON.stringify({ 
    assessments,
    count: assessments.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDataProcessingRecords(): Promise<Response> {
  const records = compliance.getDataProcessingRecords();
  
  return new Response(JSON.stringify({ 
    records,
    count: records.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getConsentRecords(): Promise<Response> {
  const consents = compliance.getConsentRecords();
  
  return new Response(JSON.stringify({ 
    consents,
    count: consents.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getDataBreachRecords(): Promise<Response> {
  const breaches = compliance.getDataBreachRecords();
  
  return new Response(JSON.stringify({ 
    breaches,
    count: breaches.length,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getComplianceStatus(): Promise<Response> {
  const regulations = compliance.getRegulations();
  const assessments = compliance.getAssessments();
  
  const status = regulations.map(regulation => {
    const regulationAssessments = assessments.filter(assessment => assessment.regulation === regulation.id);
    const latestAssessment = regulationAssessments.sort((a, b) => 
      new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
    )[0];

    return {
      regulation: regulation.name,
      status: latestAssessment?.status || 'not_assessed',
      score: latestAssessment?.overallScore || 0,
      lastAssessment: latestAssessment?.assessmentDate || null,
      nextAssessment: latestAssessment?.nextAssessment || null,
    };
  });
  
  return new Response(JSON.stringify({ 
    status,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function getRegulation(url: URL): Promise<Response> {
  const regulationId = url.searchParams.get('id');
  
  if (!regulationId) {
    return new Response(JSON.stringify({ error: 'Regulation ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const regulation = compliance.getRegulation(regulationId);
  
  if (!regulation) {
    return new Response(JSON.stringify({ error: 'Regulation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ 
    regulation,
    timestamp: new Date().toISOString(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

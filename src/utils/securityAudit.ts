/**
 * Sistema de auditoría de seguridad para Sensus
 * Proporciona funcionalidades de auditoría, logging de seguridad y cumplimiento
 */

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  eventType: 'authentication' | 'authorization' | 'data_access' | 'data_modification' | 'configuration_change' | 'security_incident' | 'compliance_check';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'warning';
  message: string;
  metadata: Record<string, any>;
  complianceFlags: string[];
  riskScore: number;
  tags: string[];
}

export interface AuditTrail {
  id: string;
  entityType: 'user' | 'data' | 'system' | 'configuration';
  entityId: string;
  events: SecurityAuditEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  regulation: 'GDPR' | 'CCPA' | 'LGPD' | 'HIPAA' | 'SOX' | 'PCI-DSS';
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  lastChecked: string;
  nextCheck: string;
  findings: ComplianceFinding[];
  remediation: string[];
  evidence: string[];
}

export interface ComplianceFinding {
  id: string;
  type: 'violation' | 'gap' | 'recommendation' | 'observation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
  category: 'data_breach' | 'unauthorized_access' | 'malware' | 'phishing' | 'insider_threat' | 'system_compromise' | 'other';
  discoveredAt: string;
  reportedAt?: string;
  resolvedAt?: string;
  affectedSystems: string[];
  affectedUsers: string[];
  impact: string;
  rootCause?: string;
  remediation: string[];
  lessonsLearned: string[];
  assignedTo?: string;
  metadata: Record<string, any>;
}

export interface AuditReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: string;
    end: string;
  };
  scope: string[];
  findings: ComplianceFinding[];
  summary: {
    totalEvents: number;
    criticalEvents: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  recommendations: string[];
  generatedAt: string;
  generatedBy: string;
}

export interface SecurityAuditConfig {
  logging: {
    enableAuditLogging: boolean;
    logLevel: 'low' | 'medium' | 'high' | 'critical';
    retentionPeriod: number; // días
    enableRealTimeAlerts: boolean;
    alertThresholds: {
      failedLogins: number;
      privilegeEscalation: number;
      dataAccess: number;
      configurationChanges: number;
    };
  };
  compliance: {
    enableComplianceMonitoring: boolean;
    regulations: string[];
    checkInterval: number; // días
    enableAutomatedChecks: boolean;
    requireEvidence: boolean;
  };
  incident: {
    enableIncidentTracking: boolean;
    autoClassification: boolean;
    escalationRules: string[];
    notificationChannels: string[];
  };
  reporting: {
    enableAutomatedReports: boolean;
    reportSchedule: string;
    reportRecipients: string[];
    includeEvidence: boolean;
  };
}

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private auditEvents: SecurityAuditEvent[] = [];
  private auditTrails: Map<string, AuditTrail> = new Map();
  private complianceChecks: Map<string, ComplianceCheck> = new Map();
  private securityIncidents: SecurityIncident[] = [];
  private config: SecurityAuditConfig;
  private alertThresholds: Map<string, number> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultComplianceChecks();
    this.startAuditMonitoring();
  }

  public static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  private getDefaultConfig(): SecurityAuditConfig {
    return {
      logging: {
        enableAuditLogging: true,
        logLevel: 'medium',
        retentionPeriod: 2555, // 7 años
        enableRealTimeAlerts: true,
        alertThresholds: {
          failedLogins: 5,
          privilegeEscalation: 1,
          dataAccess: 100,
          configurationChanges: 10,
        },
      },
      compliance: {
        enableComplianceMonitoring: true,
        regulations: ['GDPR', 'CCPA'],
        checkInterval: 30,
        enableAutomatedChecks: true,
        requireEvidence: true,
      },
      incident: {
        enableIncidentTracking: true,
        autoClassification: true,
        escalationRules: ['severity:critical', 'data_breach'],
        notificationChannels: ['email', 'slack'],
      },
      reporting: {
        enableAutomatedReports: true,
        reportSchedule: 'monthly',
        reportRecipients: ['security@sensus.com'],
        includeEvidence: true,
      },
    };
  }

  private setupDefaultComplianceChecks(): void {
    const checks: ComplianceCheck[] = [
      {
        id: 'gdpr-data-protection',
        name: 'GDPR Data Protection',
        description: 'Verificar cumplimiento de protección de datos según GDPR',
        regulation: 'GDPR',
        requirement: 'Artículo 32 - Seguridad del procesamiento',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        findings: [],
        remediation: [],
        evidence: [],
      },
      {
        id: 'gdpr-consent-management',
        name: 'GDPR Consent Management',
        description: 'Verificar gestión de consentimientos según GDPR',
        regulation: 'GDPR',
        requirement: 'Artículo 7 - Condiciones para el consentimiento',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        findings: [],
        remediation: [],
        evidence: [],
      },
      {
        id: 'ccpa-privacy-rights',
        name: 'CCPA Privacy Rights',
        description: 'Verificar derechos de privacidad según CCPA',
        regulation: 'CCPA',
        requirement: 'Sección 1798.105 - Derecho a la eliminación',
        status: 'compliant',
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        findings: [],
        remediation: [],
        evidence: [],
      },
    ];

    checks.forEach(check => this.complianceChecks.set(check.id, check));
  }

  private startAuditMonitoring(): void {
    // Monitorear eventos de auditoría
    setInterval(() => {
      this.processAuditEvents();
    }, 60000); // Cada minuto

    // Ejecutar verificaciones de cumplimiento
    setInterval(() => {
      this.runComplianceChecks();
    }, this.config.compliance.checkInterval * 24 * 60 * 60 * 1000); // Según configuración

    // Limpiar eventos antiguos
    setInterval(() => {
      this.cleanupOldEvents();
    }, 24 * 60 * 60 * 1000); // Diariamente
  }

  // Métodos de auditoría
  public async logSecurityEvent(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'riskScore' | 'complianceFlags' | 'tags'>): Promise<SecurityAuditEvent> {
    const auditEvent: SecurityAuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString(),
      riskScore: this.calculateRiskScore(event),
      complianceFlags: this.getComplianceFlags(event),
      tags: this.generateTags(event),
    };

    this.auditEvents.push(auditEvent);

    // Agregar a trail de auditoría
    this.addToAuditTrail(auditEvent);

    // Verificar alertas en tiempo real
    if (this.config.logging.enableRealTimeAlerts) {
      await this.checkRealTimeAlerts(auditEvent);
    }

    // Verificar cumplimiento
    if (this.config.compliance.enableComplianceMonitoring) {
      await this.checkCompliance(auditEvent);
    }

    // Clasificar incidente si es necesario
    if (this.config.incident.enableIncidentTracking) {
      await this.classifyIncident(auditEvent);
    }

    return auditEvent;
  }

  public async createAuditTrail(entityType: AuditTrail['entityType'], entityId: string): Promise<AuditTrail> {
    const trail: AuditTrail = {
      id: this.generateTrailId(),
      entityType,
      entityId,
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.auditTrails.set(trail.id, trail);
    return trail;
  }

  public async getAuditTrail(entityType: string, entityId: string): Promise<SecurityAuditEvent[]> {
    const trails = Array.from(this.auditTrails.values())
      .filter(trail => trail.entityType === entityType && trail.entityId === entityId);

    const events: SecurityAuditEvent[] = [];
    trails.forEach(trail => {
      events.push(...trail.events);
    });

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Métodos de cumplimiento
  public async runComplianceCheck(checkId: string): Promise<ComplianceCheck> {
    const check = this.complianceChecks.get(checkId);
    if (!check) throw new Error('Compliance check not found');

    // Simular verificación de cumplimiento
    const findings = await this.performComplianceCheck(check);
    check.findings = findings;
    check.status = this.determineComplianceStatus(findings);
    check.lastChecked = new Date().toISOString();
    check.nextCheck = new Date(Date.now() + this.config.compliance.checkInterval * 24 * 60 * 60 * 1000).toISOString();

    this.complianceChecks.set(checkId, check);
    return check;
  }

  public async runAllComplianceChecks(): Promise<ComplianceCheck[]> {
    const checks = Array.from(this.complianceChecks.values());
    const results: ComplianceCheck[] = [];

    for (const check of checks) {
      const result = await this.runComplianceCheck(check.id);
      results.push(result);
    }

    return results;
  }

  // Métodos de incidentes
  public async createSecurityIncident(incident: Omit<SecurityIncident, 'id' | 'discoveredAt' | 'status'>): Promise<SecurityIncident> {
    const securityIncident: SecurityIncident = {
      ...incident,
      id: this.generateIncidentId(),
      discoveredAt: new Date().toISOString(),
      status: 'open',
    };

    this.securityIncidents.push(securityIncident);

    // Notificar sobre el incidente
    await this.notifyIncident(securityIncident);

    return securityIncident;
  }

  public async updateIncidentStatus(incidentId: string, status: SecurityIncident['status'], updates?: Partial<SecurityIncident>): Promise<boolean> {
    const incident = this.securityIncidents.find(i => i.id === incidentId);
    if (!incident) return false;

    incident.status = status;
    incident.updatedAt = new Date().toISOString();

    if (updates) {
      Object.assign(incident, updates);
    }

    if (status === 'resolved') {
      incident.resolvedAt = new Date().toISOString();
    }

    return true;
  }

  // Métodos de reportes
  public async generateAuditReport(period: { start: string; end: string }, scope: string[]): Promise<AuditReport> {
    const events = this.auditEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= new Date(period.start) && eventDate <= new Date(period.end);
    });

    const findings = this.extractFindings(events);
    const summary = this.calculateSummary(events, findings);

    const report: AuditReport = {
      id: this.generateReportId(),
      title: `Audit Report - ${period.start} to ${period.end}`,
      description: 'Security audit report covering the specified period',
      period,
      scope,
      findings,
      summary,
      recommendations: this.generateRecommendations(findings),
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
    };

    return report;
  }

  // Métodos de análisis
  public async analyzeSecurityTrends(period: { start: string; end: string }): Promise<{
    trends: Array<{ date: string; events: number; severity: string }>;
    topThreats: Array<{ threat: string; count: number }>;
    riskAreas: Array<{ area: string; riskScore: number }>;
  }> {
    const events = this.auditEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= new Date(period.start) && eventDate <= new Date(period.end);
    });

    // Análisis de tendencias
    const trends = this.calculateTrends(events);

    // Principales amenazas
    const topThreats = this.identifyTopThreats(events);

    // Áreas de riesgo
    const riskAreas = this.identifyRiskAreas(events);

    return { trends, topThreats, riskAreas };
  }

  // Métodos de utilidad
  private addToAuditTrail(event: SecurityAuditEvent): void {
    const trailKey = `${event.resource}:${event.action}`;
    let trail = this.auditTrails.get(trailKey);

    if (!trail) {
      trail = {
        id: trailKey,
        entityType: 'system',
        entityId: trailKey,
        events: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.auditTrails.set(trailKey, trail);
    }

    trail.events.push(event);
    trail.updatedAt = new Date().toISOString();
  }

  private calculateRiskScore(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'riskScore' | 'complianceFlags' | 'tags'>): number {
    let score = 0;

    // Puntuación por severidad
    switch (event.severity) {
      case 'low': score += 1; break;
      case 'medium': score += 3; break;
      case 'high': score += 7; break;
      case 'critical': score += 10; break;
    }

    // Puntuación por resultado
    if (event.result === 'failure') score += 2;
    if (event.result === 'warning') score += 1;

    // Puntuación por tipo de evento
    switch (event.eventType) {
      case 'authentication': score += 1; break;
      case 'authorization': score += 2; break;
      case 'data_access': score += 3; break;
      case 'data_modification': score += 4; break;
      case 'configuration_change': score += 5; break;
      case 'security_incident': score += 8; break;
      case 'compliance_check': score += 1; break;
    }

    return Math.min(score, 10); // Máximo 10
  }

  private getComplianceFlags(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'riskScore' | 'complianceFlags' | 'tags'>): string[] {
    const flags: string[] = [];

    if (event.eventType === 'data_access' || event.eventType === 'data_modification') {
      flags.push('GDPR_DATA_PROCESSING');
    }

    if (event.eventType === 'authentication' && event.result === 'failure') {
      flags.push('GDPR_SECURITY');
    }

    if (event.severity === 'critical') {
      flags.push('INCIDENT_REQUIRED');
    }

    return flags;
  }

  private generateTags(event: Omit<SecurityAuditEvent, 'id' | 'timestamp' | 'riskScore' | 'complianceFlags' | 'tags'>): string[] {
    const tags: string[] = [];

    tags.push(event.eventType);
    tags.push(event.severity);
    tags.push(event.result);
    tags.push(event.resource);
    tags.push(event.action);

    if (event.userId) tags.push(`user:${event.userId}`);
    if (event.sessionId) tags.push(`session:${event.sessionId}`);

    return tags;
  }

  private async checkRealTimeAlerts(event: SecurityAuditEvent): Promise<void> {
    const thresholds = this.config.logging.alertThresholds;

    // Verificar umbrales
    if (event.eventType === 'authentication' && event.result === 'failure') {
      const count = this.auditEvents.filter(e => 
        e.eventType === 'authentication' && 
        e.result === 'failure' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Última hora
      ).length;

      if (count >= thresholds.failedLogins) {
        await this.triggerAlert('Failed login threshold exceeded', event);
      }
    }

    if (event.eventType === 'data_access') {
      const count = this.auditEvents.filter(e => 
        e.eventType === 'data_access' && 
        e.userId === event.userId &&
        new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Último día
      ).length;

      if (count >= thresholds.dataAccess) {
        await this.triggerAlert('Data access threshold exceeded', event);
      }
    }
  }

  private async checkCompliance(event: SecurityAuditEvent): Promise<void> {
    // Verificar cumplimiento basado en el evento
    if (event.complianceFlags.includes('GDPR_DATA_PROCESSING')) {
      // Verificar si el procesamiento de datos cumple con GDPR
      console.log('GDPR compliance check triggered');
    }

    if (event.complianceFlags.includes('INCIDENT_REQUIRED')) {
      // Crear incidente de seguridad
      await this.createSecurityIncident({
        title: `Security Incident: ${event.message}`,
        description: event.message,
        severity: event.severity,
        category: 'other',
        affectedSystems: [event.resource],
        affectedUsers: event.userId ? [event.userId] : [],
        impact: 'Security event detected',
        remediation: ['Investigate incident', 'Implement corrective measures'],
        lessonsLearned: [],
        metadata: event.metadata,
      });
    }
  }

  private async classifyIncident(event: SecurityAuditEvent): Promise<void> {
    if (event.severity === 'critical' || event.severity === 'high') {
      // Clasificar como incidente de seguridad
      const category = this.classifyIncidentCategory(event);
      
      await this.createSecurityIncident({
        title: `Security Incident: ${event.message}`,
        description: event.message,
        severity: event.severity,
        category,
        affectedSystems: [event.resource],
        affectedUsers: event.userId ? [event.userId] : [],
        impact: 'Security event detected',
        remediation: ['Investigate incident', 'Implement corrective measures'],
        lessonsLearned: [],
        metadata: event.metadata,
      });
    }
  }

  private classifyIncidentCategory(event: SecurityAuditEvent): SecurityIncident['category'] {
    if (event.eventType === 'authentication' && event.result === 'failure') {
      return 'unauthorized_access';
    }
    if (event.eventType === 'data_access' || event.eventType === 'data_modification') {
      return 'data_breach';
    }
    if (event.eventType === 'configuration_change') {
      return 'system_compromise';
    }
    return 'other';
  }

  private async triggerAlert(message: string, event: SecurityAuditEvent): Promise<void> {
    console.log(`Security Alert: ${message}`, event);
    // Implementar notificación de alerta
  }

  private async notifyIncident(incident: SecurityIncident): Promise<void> {
    console.log(`Security Incident Created: ${incident.title}`, incident);
    // Implementar notificación de incidente
  }

  private async performComplianceCheck(check: ComplianceCheck): Promise<ComplianceFinding[]> {
    // Simular verificación de cumplimiento
    const findings: ComplianceFinding[] = [];

    // Verificar eventos relacionados
    const relatedEvents = this.auditEvents.filter(event => 
      event.complianceFlags.some(flag => flag.includes(check.regulation))
    );

    if (relatedEvents.length === 0) {
      findings.push({
        id: this.generateFindingId(),
        type: 'gap',
        severity: 'medium',
        description: `No audit events found for ${check.regulation}`,
        impact: 'Compliance monitoring gap',
        recommendation: 'Implement audit logging for this regulation',
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return findings;
  }

  private determineComplianceStatus(findings: ComplianceFinding[]): ComplianceCheck['status'] {
    const criticalFindings = findings.filter(f => f.severity === 'critical');
    const highFindings = findings.filter(f => f.severity === 'high');

    if (criticalFindings.length > 0) return 'non-compliant';
    if (highFindings.length > 0) return 'partial';
    if (findings.length === 0) return 'compliant';
    return 'partial';
  }

  private extractFindings(events: SecurityAuditEvent[]): ComplianceFinding[] {
    const findings: ComplianceFinding[] = [];

    // Extraer hallazgos de eventos críticos
    const criticalEvents = events.filter(e => e.severity === 'critical');
    criticalEvents.forEach(event => {
      findings.push({
        id: this.generateFindingId(),
        type: 'violation',
        severity: 'critical',
        description: `Critical security event: ${event.message}`,
        impact: 'High risk to security and compliance',
        recommendation: 'Immediate investigation and remediation required',
        status: 'open',
        createdAt: event.timestamp,
        updatedAt: event.timestamp,
      });
    });

    return findings;
  }

  private calculateSummary(events: SecurityAuditEvent[], findings: ComplianceFinding[]): AuditReport['summary'] {
    const totalEvents = events.length;
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const complianceScore = this.calculateComplianceScore(findings);
    const riskLevel = this.calculateRiskLevel(events);

    return {
      totalEvents,
      criticalEvents,
      complianceScore,
      riskLevel,
    };
  }

  private calculateComplianceScore(findings: ComplianceFinding[]): number {
    if (findings.length === 0) return 100;

    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;

    const score = 100 - (criticalFindings * 20) - (highFindings * 10) - (mediumFindings * 5);
    return Math.max(score, 0);
  }

  private calculateRiskLevel(events: SecurityAuditEvent[]): AuditReport['summary']['riskLevel'] {
    const criticalEvents = events.filter(e => e.severity === 'critical').length;
    const highEvents = events.filter(e => e.severity === 'high').length;

    if (criticalEvents > 5) return 'critical';
    if (criticalEvents > 0 || highEvents > 10) return 'high';
    if (highEvents > 5) return 'medium';
    return 'low';
  }

  private generateRecommendations(findings: ComplianceFinding[]): string[] {
    const recommendations: string[] = [];

    findings.forEach(finding => {
      if (finding.recommendation && !recommendations.includes(finding.recommendation)) {
        recommendations.push(finding.recommendation);
      }
    });

    return recommendations;
  }

  private calculateTrends(events: SecurityAuditEvent[]): Array<{ date: string; events: number; severity: string }> {
    // Agrupar eventos por fecha y severidad
    const trends: Array<{ date: string; events: number; severity: string }> = [];
    const grouped = new Map<string, Map<string, number>>();

    events.forEach(event => {
      const date = event.timestamp.split('T')[0];
      if (!grouped.has(date)) {
        grouped.set(date, new Map());
      }
      const dayGroup = grouped.get(date)!;
      dayGroup.set(event.severity, (dayGroup.get(event.severity) || 0) + 1);
    });

    grouped.forEach((dayGroup, date) => {
      dayGroup.forEach((count, severity) => {
        trends.push({ date, events: count, severity });
      });
    });

    return trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private identifyTopThreats(events: SecurityAuditEvent[]): Array<{ threat: string; count: number }> {
    const threats = new Map<string, number>();

    events.forEach(event => {
      const threat = `${event.eventType}:${event.action}`;
      threats.set(threat, (threats.get(threat) || 0) + 1);
    });

    return Array.from(threats.entries())
      .map(([threat, count]) => ({ threat, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private identifyRiskAreas(events: SecurityAuditEvent[]): Array<{ area: string; riskScore: number }> {
    const areas = new Map<string, number>();

    events.forEach(event => {
      const area = event.resource;
      areas.set(area, (areas.get(area) || 0) + event.riskScore);
    });

    return Array.from(areas.entries())
      .map(([area, riskScore]) => ({ area, riskScore }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
  }

  private processAuditEvents(): void {
    // Procesar eventos de auditoría pendientes
    console.log(`Processing ${this.auditEvents.length} audit events`);
  }

  private runComplianceChecks(): void {
    // Ejecutar verificaciones de cumplimiento automáticas
    console.log('Running automated compliance checks');
  }

  private cleanupOldEvents(): void {
    const cutoffDate = new Date(Date.now() - this.config.logging.retentionPeriod * 24 * 60 * 60 * 1000);
    this.auditEvents = this.auditEvents.filter(event => new Date(event.timestamp) > cutoffDate);
  }

  // Métodos de utilidad
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTrailId(): string {
    return `trail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getAuditEvents(): SecurityAuditEvent[] {
    return [...this.auditEvents];
  }

  public getComplianceChecks(): ComplianceCheck[] {
    return Array.from(this.complianceChecks.values());
  }

  public getSecurityIncidents(): SecurityIncident[] {
    return [...this.securityIncidents];
  }

  public getConfig(): SecurityAuditConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SecurityAuditConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const securityAudit = SecurityAuditService.getInstance();

export default SecurityAuditService;

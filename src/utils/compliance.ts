/**
 * Sistema de cumplimiento y regulaciones para Sensus
 * Proporciona funcionalidades de cumplimiento GDPR, CCPA, LGPD y otras regulaciones
 */

export interface Regulation {
  id: string;
  name: string;
  fullName: string;
  description: string;
  jurisdiction: string;
  effectiveDate: string;
  status: 'active' | 'draft' | 'repealed';
  requirements: RegulationRequirement[];
  penalties: {
    maxFine: number;
    currency: string;
    description: string;
  };
  contactInfo: {
    authority: string;
    website: string;
    email: string;
  };
}

export interface RegulationRequirement {
  id: string;
  article: string;
  title: string;
  description: string;
  category: 'data_protection' | 'consent' | 'rights' | 'security' | 'breach_notification' | 'data_transfer' | 'accountability';
  mandatory: boolean;
  implementation: string[];
  evidence: string[];
  complianceCheck: string;
}

export interface ComplianceAssessment {
  id: string;
  regulation: string;
  assessmentDate: string;
  assessor: string;
  scope: string[];
  findings: ComplianceFinding[];
  overallScore: number;
  status: 'compliant' | 'non-compliant' | 'partial' | 'requires_improvement';
  recommendations: string[];
  nextAssessment: string;
  evidence: string[];
}

export interface ComplianceFinding {
  id: string;
  requirement: string;
  finding: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  recommendation: string;
  status: 'open' | 'in-progress' | 'resolved' | 'accepted-risk';
  assignedTo?: string;
  dueDate?: string;
  evidence?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DataProcessingRecord {
  id: string;
  name: string;
  description: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  automatedDecision: boolean;
  dpoRequired: boolean;
  dpiaRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  id: string;
  dataSubjectId: string;
  purpose: string;
  legalBasis: string;
  granted: boolean;
  grantedAt: string;
  withdrawnAt?: string;
  version: string;
  language: string;
  method: 'explicit' | 'opt-in' | 'opt-out';
  evidence: string[];
  metadata: Record<string, any>;
}

export interface DataBreachRecord {
  id: string;
  description: string;
  dataCategories: string[];
  affectedSubjects: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  discoveredAt: string;
  reportedAt?: string;
  resolvedAt?: string;
  status: 'discovered' | 'investigating' | 'reported' | 'resolved';
  notificationRequired: boolean;
  notificationDeadline?: string;
  measures: string[];
  rootCause?: string;
  prevention: string[];
  metadata: Record<string, any>;
}

export interface ComplianceConfig {
  regulations: {
    enableGDPR: boolean;
    enableCCPA: boolean;
    enableLGPD: boolean;
    enableHIPAA: boolean;
    enableSOX: boolean;
    enablePCIDSS: boolean;
  };
  assessments: {
    enableAutomatedAssessments: boolean;
    assessmentInterval: number; // días
    requireEvidence: boolean;
    enableContinuousMonitoring: boolean;
  };
  reporting: {
    enableAutomatedReporting: boolean;
    reportSchedule: 'weekly' | 'monthly' | 'quarterly' | 'annually';
    reportRecipients: string[];
    includeEvidence: boolean;
  };
  notifications: {
    enableBreachNotifications: boolean;
    enableAssessmentAlerts: boolean;
    enableDeadlineReminders: boolean;
    channels: string[];
  };
}

export class ComplianceService {
  private static instance: ComplianceService;
  private regulations: Map<string, Regulation> = new Map();
  private assessments: Map<string, ComplianceAssessment> = new Map();
  private dataProcessingRecords: Map<string, DataProcessingRecord> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private dataBreachRecords: DataBreachRecord[] = [];
  private config: ComplianceConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultRegulations();
    this.setupDefaultDataProcessingRecords();
    this.startComplianceMonitoring();
  }

  public static getInstance(): ComplianceService {
    if (!ComplianceService.instance) {
      ComplianceService.instance = new ComplianceService();
    }
    return ComplianceService.instance;
  }

  private getDefaultConfig(): ComplianceConfig {
    return {
      regulations: {
        enableGDPR: true,
        enableCCPA: true,
        enableLGPD: false,
        enableHIPAA: false,
        enableSOX: false,
        enablePCIDSS: false,
      },
      assessments: {
        enableAutomatedAssessments: true,
        assessmentInterval: 90,
        requireEvidence: true,
        enableContinuousMonitoring: true,
      },
      reporting: {
        enableAutomatedReporting: true,
        reportSchedule: 'monthly',
        reportRecipients: ['compliance@sensus.com'],
        includeEvidence: true,
      },
      notifications: {
        enableBreachNotifications: true,
        enableAssessmentAlerts: true,
        enableDeadlineReminders: true,
        channels: ['email', 'slack'],
      },
    };
  }

  private setupDefaultRegulations(): void {
    const regulations: Regulation[] = [
      {
        id: 'gdpr',
        name: 'GDPR',
        fullName: 'General Data Protection Regulation',
        description: 'Regulation on the protection of natural persons with regard to the processing of personal data',
        jurisdiction: 'European Union',
        effectiveDate: '2018-05-25',
        status: 'active',
        requirements: [
          {
            id: 'gdpr-art-5',
            article: 'Article 5',
            title: 'Principles relating to processing of personal data',
            description: 'Personal data shall be processed lawfully, fairly and in a transparent manner',
            category: 'data_protection',
            mandatory: true,
            implementation: ['Data minimization', 'Purpose limitation', 'Accuracy', 'Storage limitation'],
            evidence: ['Data processing records', 'Privacy notices', 'Data retention policies'],
            complianceCheck: 'Verify data processing principles are followed',
          },
          {
            id: 'gdpr-art-6',
            article: 'Article 6',
            title: 'Lawfulness of processing',
            description: 'Processing shall be lawful only if and to the extent that at least one of the legal bases applies',
            category: 'data_protection',
            mandatory: true,
            implementation: ['Consent management', 'Contract processing', 'Legal obligation compliance'],
            evidence: ['Consent records', 'Contract documentation', 'Legal basis assessments'],
            complianceCheck: 'Verify legal basis for all data processing',
          },
          {
            id: 'gdpr-art-7',
            article: 'Article 7',
            title: 'Conditions for consent',
            description: 'Consent must be freely given, specific, informed and unambiguous',
            category: 'consent',
            mandatory: true,
            implementation: ['Consent forms', 'Withdrawal mechanisms', 'Consent records'],
            evidence: ['Consent records', 'Privacy notices', 'Withdrawal logs'],
            complianceCheck: 'Verify consent is valid and properly recorded',
          },
          {
            id: 'gdpr-art-12-22',
            article: 'Articles 12-22',
            title: 'Rights of the data subject',
            description: 'Data subjects have rights to access, rectification, erasure, portability, etc.',
            category: 'rights',
            mandatory: true,
            implementation: ['Data subject request procedures', 'Response mechanisms', 'Identity verification'],
            evidence: ['Request logs', 'Response records', 'Procedure documentation'],
            complianceCheck: 'Verify data subject rights are properly implemented',
          },
          {
            id: 'gdpr-art-32',
            article: 'Article 32',
            title: 'Security of processing',
            description: 'Appropriate technical and organizational measures to ensure security',
            category: 'security',
            mandatory: true,
            implementation: ['Encryption', 'Access controls', 'Security monitoring', 'Incident response'],
            evidence: ['Security policies', 'Technical measures', 'Incident logs'],
            complianceCheck: 'Verify security measures are adequate',
          },
          {
            id: 'gdpr-art-33-34',
            article: 'Articles 33-34',
            title: 'Notification of a personal data breach',
            description: 'Breach notification requirements to supervisory authority and data subjects',
            category: 'breach_notification',
            mandatory: true,
            implementation: ['Breach detection', 'Notification procedures', 'Documentation'],
            evidence: ['Breach logs', 'Notification records', 'Response procedures'],
            complianceCheck: 'Verify breach notification procedures are in place',
          },
        ],
        penalties: {
          maxFine: 20000000,
          currency: 'EUR',
          description: 'Up to €20 million or 4% of annual global turnover, whichever is higher',
        },
        contactInfo: {
          authority: 'European Data Protection Board',
          website: 'https://edpb.europa.eu',
          email: 'info@edpb.europa.eu',
        },
      },
      {
        id: 'ccpa',
        name: 'CCPA',
        fullName: 'California Consumer Privacy Act',
        description: 'California state law that provides privacy rights to California residents',
        jurisdiction: 'California, USA',
        effectiveDate: '2020-01-01',
        status: 'active',
        requirements: [
          {
            id: 'ccpa-1798-105',
            article: 'Section 1798.105',
            title: 'Right to delete',
            description: 'Consumers have the right to request deletion of personal information',
            category: 'rights',
            mandatory: true,
            implementation: ['Deletion procedures', 'Verification processes', 'Response mechanisms'],
            evidence: ['Deletion logs', 'Procedure documentation', 'Response records'],
            complianceCheck: 'Verify deletion procedures are properly implemented',
          },
          {
            id: 'ccpa-1798-110',
            article: 'Section 1798.110',
            title: 'Right to know',
            description: 'Consumers have the right to know what personal information is collected',
            category: 'rights',
            mandatory: true,
            implementation: ['Privacy notices', 'Data collection disclosures', 'Response procedures'],
            evidence: ['Privacy notices', 'Collection logs', 'Response records'],
            complianceCheck: 'Verify privacy notices are comprehensive and accessible',
          },
          {
            id: 'ccpa-1798-115',
            article: 'Section 1798.115',
            title: 'Right to opt-out',
            description: 'Consumers have the right to opt-out of sale of personal information',
            category: 'rights',
            mandatory: true,
            implementation: ['Opt-out mechanisms', 'Verification processes', 'Response procedures'],
            evidence: ['Opt-out logs', 'Mechanism documentation', 'Response records'],
            complianceCheck: 'Verify opt-out mechanisms are functional',
          },
        ],
        penalties: {
          maxFine: 7500,
          currency: 'USD',
          description: 'Up to $7,500 per intentional violation',
        },
        contactInfo: {
          authority: 'California Attorney General',
          website: 'https://oag.ca.gov/privacy/ccpa',
          email: 'privacy@doj.ca.gov',
        },
      },
    ];

    regulations.forEach(regulation => this.regulations.set(regulation.id, regulation));
  }

  private setupDefaultDataProcessingRecords(): void {
    const records: DataProcessingRecord[] = [
      {
        id: 'user-management',
        name: 'User Management',
        description: 'Processing of user data for account management and authentication',
        purpose: 'User account management and authentication',
        legalBasis: 'contract',
        dataCategories: ['contact_info', 'profile_data', 'authentication_data'],
        dataSubjects: ['users'],
        recipients: ['internal'],
        retentionPeriod: 2555, // 7 años
        securityMeasures: ['encryption', 'access_control', 'audit_logging'],
        crossBorderTransfer: false,
        automatedDecision: false,
        dpoRequired: false,
        dpiaRequired: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Processing of usage data for analytics and improvement',
        purpose: 'Service improvement and analytics',
        legalBasis: 'legitimate_interests',
        dataCategories: ['usage_data', 'preferences'],
        dataSubjects: ['users'],
        recipients: ['internal'],
        retentionPeriod: 365,
        securityMeasures: ['anonymization', 'pseudonymization'],
        crossBorderTransfer: false,
        automatedDecision: false,
        dpoRequired: false,
        dpiaRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    records.forEach(record => this.dataProcessingRecords.set(record.id, record));
  }

  private startComplianceMonitoring(): void {
    // Monitoreo continuo de cumplimiento
    setInterval(() => {
      this.runContinuousMonitoring();
    }, 24 * 60 * 60 * 1000); // Diariamente

    // Verificaciones de cumplimiento
    setInterval(() => {
      this.runComplianceChecks();
    }, this.config.assessments.assessmentInterval * 24 * 60 * 60 * 1000);

    // Recordatorios de fechas límite
    setInterval(() => {
      this.checkDeadlines();
    }, 7 * 24 * 60 * 60 * 1000); // Semanalmente
  }

  // Métodos de gestión de regulaciones
  public getRegulations(): Regulation[] {
    return Array.from(this.regulations.values());
  }

  public getRegulation(regulationId: string): Regulation | undefined {
    return this.regulations.get(regulationId);
  }

  public getActiveRegulations(): Regulation[] {
    return Array.from(this.regulations.values()).filter(regulation => regulation.status === 'active');
  }

  // Métodos de evaluación de cumplimiento
  public async runComplianceAssessment(regulationId: string, scope: string[]): Promise<ComplianceAssessment> {
    const regulation = this.regulations.get(regulationId);
    if (!regulation) throw new Error('Regulation not found');

    const findings = await this.assessCompliance(regulation, scope);
    const overallScore = this.calculateOverallScore(findings);
    const status = this.determineComplianceStatus(overallScore, findings);

    const assessment: ComplianceAssessment = {
      id: this.generateAssessmentId(),
      regulation: regulationId,
      assessmentDate: new Date().toISOString(),
      assessor: 'system',
      scope,
      findings,
      overallScore,
      status,
      recommendations: this.generateRecommendations(findings),
      nextAssessment: new Date(Date.now() + this.config.assessments.assessmentInterval * 24 * 60 * 60 * 1000).toISOString(),
      evidence: this.collectEvidence(findings),
    };

    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  public async runAllComplianceAssessments(): Promise<ComplianceAssessment[]> {
    const activeRegulations = this.getActiveRegulations();
    const assessments: ComplianceAssessment[] = [];

    for (const regulation of activeRegulations) {
      const assessment = await this.runComplianceAssessment(regulation.id, ['all']);
      assessments.push(assessment);
    }

    return assessments;
  }

  // Métodos de gestión de registros de procesamiento de datos
  public async createDataProcessingRecord(record: Omit<DataProcessingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataProcessingRecord> {
    const dataProcessingRecord: DataProcessingRecord = {
      ...record,
      id: this.generateRecordId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.dataProcessingRecords.set(dataProcessingRecord.id, dataProcessingRecord);
    return dataProcessingRecord;
  }

  public async updateDataProcessingRecord(id: string, updates: Partial<DataProcessingRecord>): Promise<boolean> {
    const record = this.dataProcessingRecords.get(id);
    if (!record) return false;

    const updatedRecord = { ...record, ...updates, updatedAt: new Date().toISOString() };
    this.dataProcessingRecords.set(id, updatedRecord);
    return true;
  }

  public getDataProcessingRecords(): DataProcessingRecord[] {
    return Array.from(this.dataProcessingRecords.values());
  }

  // Métodos de gestión de consentimientos
  public async recordConsent(consent: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    const consentRecord: ConsentRecord = {
      ...consent,
      id: this.generateConsentId(),
    };

    this.consentRecords.set(consentRecord.id, consentRecord);
    return consentRecord;
  }

  public async withdrawConsent(consentId: string): Promise<boolean> {
    const consent = this.consentRecords.get(consentId);
    if (!consent) return false;

    consent.granted = false;
    consent.withdrawnAt = new Date().toISOString();
    this.consentRecords.set(consentId, consent);
    return true;
  }

  public getConsentRecords(): ConsentRecord[] {
    return Array.from(this.consentRecords.values());
  }

  // Métodos de gestión de brechas de datos
  public async recordDataBreach(breach: Omit<DataBreachRecord, 'id'>): Promise<DataBreachRecord> {
    const dataBreachRecord: DataBreachRecord = {
      ...breach,
      id: this.generateBreachId(),
    };

    this.dataBreachRecords.push(dataBreachRecord);

    // Verificar requisitos de notificación
    if (this.config.notifications.enableBreachNotifications) {
      await this.processBreachNotification(dataBreachRecord);
    }

    return dataBreachRecord;
  }

  public getDataBreachRecords(): DataBreachRecord[] {
    return [...this.dataBreachRecords];
  }

  // Métodos de reportes
  public async generateComplianceReport(regulationId: string, period: { start: string; end: string }): Promise<{
    regulation: Regulation;
    assessments: ComplianceAssessment[];
    findings: ComplianceFinding[];
    summary: {
      overallScore: number;
      totalFindings: number;
      criticalFindings: number;
      complianceStatus: string;
    };
    recommendations: string[];
  }> {
    const regulation = this.regulations.get(regulationId);
    if (!regulation) throw new Error('Regulation not found');

    const assessments = Array.from(this.assessments.values())
      .filter(assessment => assessment.regulation === regulationId);

    const findings = assessments.flatMap(assessment => assessment.findings);

    const summary = {
      overallScore: this.calculateOverallScore(findings),
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'critical').length,
      complianceStatus: this.determineComplianceStatus(this.calculateOverallScore(findings), findings),
    };

    return {
      regulation,
      assessments,
      findings,
      summary,
      recommendations: this.generateRecommendations(findings),
    };
  }

  // Métodos de monitoreo continuo
  private async runContinuousMonitoring(): Promise<void> {
    if (!this.config.assessments.enableContinuousMonitoring) return;

    console.log('Running continuous compliance monitoring...');

    // Verificar brechas de datos no reportadas
    const unreportedBreaches = this.dataBreachRecords.filter(breach => 
      breach.notificationRequired && !breach.reportedAt
    );

    if (unreportedBreaches.length > 0) {
      console.log(`Found ${unreportedBreaches.length} unreported data breaches`);
    }

    // Verificar consentimientos expirados
    const expiredConsents = Array.from(this.consentRecords.values())
      .filter(consent => {
        const consentDate = new Date(consent.grantedAt);
        const expirationDate = new Date(consentDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 año
        return new Date() > expirationDate;
      });

    if (expiredConsents.length > 0) {
      console.log(`Found ${expiredConsents.length} expired consents`);
    }
  }

  private async runComplianceChecks(): Promise<void> {
    if (!this.config.assessments.enableAutomatedAssessments) return;

    console.log('Running automated compliance checks...');
    await this.runAllComplianceAssessments();
  }

  private async checkDeadlines(): Promise<void> {
    if (!this.config.notifications.enableDeadlineReminders) return;

    console.log('Checking compliance deadlines...');

    // Verificar fechas límite de evaluaciones
    const upcomingAssessments = Array.from(this.assessments.values())
      .filter(assessment => {
        const nextAssessment = new Date(assessment.nextAssessment);
        const daysUntil = (nextAssessment.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 30 && daysUntil > 0;
      });

    if (upcomingAssessments.length > 0) {
      console.log(`Found ${upcomingAssessments.length} upcoming assessments`);
    }

    // Verificar fechas límite de hallazgos
    const overdueFindings = Array.from(this.assessments.values())
      .flatMap(assessment => assessment.findings)
      .filter(finding => {
        if (!finding.dueDate) return false;
        return new Date(finding.dueDate) < new Date();
      });

    if (overdueFindings.length > 0) {
      console.log(`Found ${overdueFindings.length} overdue findings`);
    }
  }

  // Métodos de evaluación
  private async assessCompliance(regulation: Regulation, scope: string[]): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    for (const requirement of regulation.requirements) {
      const finding = await this.assessRequirement(requirement, scope);
      if (finding) {
        findings.push(finding);
      }
    }

    return findings;
  }

  private async assessRequirement(requirement: RegulationRequirement, scope: string[]): Promise<ComplianceFinding | null> {
    // Simular evaluación de requisito
    const isCompliant = Math.random() > 0.3; // 70% de cumplimiento simulado

    if (isCompliant) {
      return null; // No hay hallazgos si es cumpliente
    }

    const severity = this.determineFindingSeverity(requirement);
    const impact = this.assessImpact(requirement);
    const recommendation = this.generateRecommendation(requirement);

    return {
      id: this.generateFindingId(),
      requirement: requirement.id,
      finding: `Non-compliance with ${requirement.article}: ${requirement.title}`,
      severity,
      impact,
      recommendation,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private determineFindingSeverity(requirement: RegulationRequirement): ComplianceFinding['severity'] {
    if (requirement.mandatory) {
      return Math.random() > 0.5 ? 'high' : 'critical';
    }
    return Math.random() > 0.5 ? 'medium' : 'low';
  }

  private assessImpact(requirement: RegulationRequirement): string {
    const impacts = {
      'data_protection': 'Risk to data subject privacy and rights',
      'consent': 'Invalid data processing and potential legal liability',
      'rights': 'Data subject rights violations and regulatory penalties',
      'security': 'Data security risks and potential breaches',
      'breach_notification': 'Regulatory penalties and reputational damage',
      'data_transfer': 'Cross-border transfer violations',
      'accountability': 'Lack of accountability and governance',
    };

    return impacts[requirement.category] || 'Compliance risk';
  }

  private generateRecommendation(requirement: RegulationRequirement): string {
    return `Implement ${requirement.implementation.join(', ')} to ensure compliance with ${requirement.article}`;
  }

  private calculateOverallScore(findings: ComplianceFinding[]): number {
    if (findings.length === 0) return 100;

    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;
    const mediumFindings = findings.filter(f => f.severity === 'medium').length;
    const lowFindings = findings.filter(f => f.severity === 'low').length;

    const score = 100 - (criticalFindings * 20) - (highFindings * 10) - (mediumFindings * 5) - (lowFindings * 2);
    return Math.max(score, 0);
  }

  private determineComplianceStatus(score: number, findings: ComplianceFinding[]): ComplianceAssessment['status'] {
    const criticalFindings = findings.filter(f => f.severity === 'critical').length;
    const highFindings = findings.filter(f => f.severity === 'high').length;

    if (criticalFindings > 0) return 'non-compliant';
    if (highFindings > 0 || score < 70) return 'requires_improvement';
    if (score >= 90) return 'compliant';
    return 'partial';
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

  private collectEvidence(findings: ComplianceFinding[]): string[] {
    const evidence: string[] = [];

    findings.forEach(finding => {
      if (finding.evidence) {
        evidence.push(...finding.evidence);
      }
    });

    return [...new Set(evidence)]; // Eliminar duplicados
  }

  private async processBreachNotification(breach: DataBreachRecord): Promise<void> {
    console.log(`Processing breach notification for breach ${breach.id}`);

    // Determinar si se requiere notificación
    if (breach.severity === 'high' || breach.severity === 'critical') {
      breach.notificationRequired = true;
      breach.notificationDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 horas
    }

    // Notificar a canales configurados
    if (this.config.notifications.channels.includes('email')) {
      console.log('Sending breach notification email');
    }

    if (this.config.notifications.channels.includes('slack')) {
      console.log('Sending breach notification to Slack');
    }
  }

  // Métodos de utilidad
  private generateAssessmentId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBreachId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFindingId(): string {
    return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getAssessments(): ComplianceAssessment[] {
    return Array.from(this.assessments.values());
  }

  public getConfig(): ComplianceConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<ComplianceConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const compliance = ComplianceService.getInstance();

export default ComplianceService;

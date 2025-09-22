/**
 * Sistema de protección de datos para Sensus
 * Proporciona funcionalidades de encriptación, privacidad y cumplimiento GDPR
 */

export interface DataSubject {
  id: string;
  email: string;
  name: string;
  data: Record<string, any>;
  consent: ConsentRecord[];
  rights: DataRights;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  id: string;
  purpose: string;
  granted: boolean;
  grantedAt: string;
  withdrawnAt?: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  version: string;
  metadata: Record<string, any>;
}

export interface DataRights {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
  restriction: boolean;
  objection: boolean;
  automatedDecision: boolean;
}

export interface DataProcessingActivity {
  id: string;
  name: string;
  description: string;
  purpose: string;
  legalBasis: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retentionPeriod: number; // días
  securityMeasures: string[];
  crossBorderTransfer: boolean;
  automatedDecision: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DataBreach {
  id: string;
  description: string;
  dataCategories: string[];
  affectedSubjects: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  discoveredAt: string;
  reportedAt?: string;
  resolvedAt?: string;
  status: 'discovered' | 'investigating' | 'reported' | 'resolved';
  measures: string[];
  notificationRequired: boolean;
  notificationDeadline?: string;
  metadata: Record<string, any>;
}

export interface PrivacyPolicy {
  id: string;
  version: string;
  effectiveDate: string;
  content: string;
  language: string;
  consentRequired: boolean;
  purposes: string[];
  dataCategories: string[];
  legalBasis: string[];
  retentionPeriods: Record<string, number>;
  rights: string[];
  contactInfo: {
    dpo?: string;
    controller: string;
    email: string;
    phone?: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DataProtectionConfig {
  encryption: {
    enableEncryption: boolean;
    algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
    keyRotation: number; // días
    enableKeyManagement: boolean;
  };
  privacy: {
    enableGDPR: boolean;
    enableCCPA: boolean;
    enableLGPD: boolean;
    defaultRetentionPeriod: number; // días
    enableDataMinimization: boolean;
    enablePurposeLimitation: boolean;
  };
  consent: {
    enableConsentManagement: boolean;
    requireExplicitConsent: boolean;
    enableConsentWithdrawal: boolean;
    consentExpiration: number; // días
    enableGranularConsent: boolean;
  };
  monitoring: {
    enableDataAudit: boolean;
    enableBreachDetection: boolean;
    enableComplianceMonitoring: boolean;
    alertThresholds: {
      dataAccess: number;
      dataModification: number;
      consentChanges: number;
    };
  };
}

export class DataProtectionService {
  private static instance: DataProtectionService;
  private dataSubjects: Map<string, DataSubject> = new Map();
  private processingActivities: Map<string, DataProcessingActivity> = new Map();
  private dataBreaches: DataBreach[] = [];
  private privacyPolicies: Map<string, PrivacyPolicy> = new Map();
  private config: DataProtectionConfig;
  private encryptionKey?: string;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultPrivacyPolicy();
    this.setupDefaultProcessingActivities();
    this.initializeEncryption();
  }

  public static getInstance(): DataProtectionService {
    if (!DataProtectionService.instance) {
      DataProtectionService.instance = new DataProtectionService();
    }
    return DataProtectionService.instance;
  }

  private getDefaultConfig(): DataProtectionConfig {
    return {
      encryption: {
        enableEncryption: true,
        algorithm: 'AES-256-GCM',
        keyRotation: 90,
        enableKeyManagement: true,
      },
      privacy: {
        enableGDPR: true,
        enableCCPA: false,
        enableLGPD: false,
        defaultRetentionPeriod: 2555, // 7 años
        enableDataMinimization: true,
        enablePurposeLimitation: true,
      },
      consent: {
        enableConsentManagement: true,
        requireExplicitConsent: true,
        enableConsentWithdrawal: true,
        consentExpiration: 365,
        enableGranularConsent: true,
      },
      monitoring: {
        enableDataAudit: true,
        enableBreachDetection: true,
        enableComplianceMonitoring: true,
        alertThresholds: {
          dataAccess: 100,
          dataModification: 50,
          consentChanges: 10,
        },
      },
    };
  }

  private setupDefaultPrivacyPolicy(): void {
    const privacyPolicy: PrivacyPolicy = {
      id: 'privacy-policy-v1',
      version: '1.0',
      effectiveDate: new Date().toISOString(),
      content: `
        <h1>Política de Privacidad de Sensus</h1>
        <p>Esta política describe cómo recopilamos, usamos y protegemos su información personal.</p>
        
        <h2>1. Información que Recopilamos</h2>
        <p>Recopilamos información que usted nos proporciona directamente, como:</p>
        <ul>
          <li>Información de contacto (nombre, email)</li>
          <li>Información de perfil</li>
          <li>Preferencias de usuario</li>
        </ul>
        
        <h2>2. Cómo Usamos su Información</h2>
        <p>Utilizamos su información para:</p>
        <ul>
          <li>Proporcionar nuestros servicios</li>
          <li>Mejorar la experiencia del usuario</li>
          <li>Comunicarnos con usted</li>
        </ul>
        
        <h2>3. Sus Derechos</h2>
        <p>Usted tiene derecho a:</p>
        <ul>
          <li>Acceder a sus datos</li>
          <li>Rectificar datos incorrectos</li>
          <li>Eliminar sus datos</li>
          <li>Portabilidad de datos</li>
          <li>Restricción del procesamiento</li>
          <li>Oposición al procesamiento</li>
        </ul>
        
        <h2>4. Contacto</h2>
        <p>Para ejercer sus derechos o para cualquier consulta sobre privacidad, contacte:</p>
        <p>Email: privacy@sensus.com</p>
      `,
      language: 'es',
      consentRequired: true,
      purposes: ['service_provision', 'user_experience', 'communication'],
      dataCategories: ['contact_info', 'profile_data', 'preferences'],
      legalBasis: ['consent', 'contract', 'legitimate_interests'],
      retentionPeriods: {
        contact_info: 2555,
        profile_data: 2555,
        preferences: 365,
      },
      rights: ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'],
      contactInfo: {
        controller: 'Sensus Inc.',
        email: 'privacy@sensus.com',
        address: '123 Privacy Street, Data City, DC 12345',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.privacyPolicies.set(privacyPolicy.id, privacyPolicy);
  }

  private setupDefaultProcessingActivities(): void {
    const activities: DataProcessingActivity[] = [
      {
        id: 'user-management',
        name: 'Gestión de Usuarios',
        description: 'Procesamiento de datos para gestión de cuentas de usuario',
        purpose: 'Proporcionar servicios de usuario',
        legalBasis: 'contract',
        dataCategories: ['contact_info', 'profile_data'],
        dataSubjects: ['users'],
        recipients: ['internal'],
        retentionPeriod: 2555,
        securityMeasures: ['encryption', 'access_control', 'audit_logging'],
        crossBorderTransfer: false,
        automatedDecision: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Análisis de uso para mejorar el servicio',
        purpose: 'Mejorar la experiencia del usuario',
        legalBasis: 'legitimate_interests',
        dataCategories: ['usage_data', 'preferences'],
        dataSubjects: ['users'],
        recipients: ['internal'],
        retentionPeriod: 365,
        securityMeasures: ['anonymization', 'pseudonymization'],
        crossBorderTransfer: false,
        automatedDecision: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    activities.forEach(activity => this.processingActivities.set(activity.id, activity));
  }

  private initializeEncryption(): void {
    if (this.config.encryption.enableEncryption) {
      this.encryptionKey = this.generateEncryptionKey();
    }
  }

  // Métodos de gestión de datos personales
  public async createDataSubject(data: Omit<DataSubject, 'id' | 'createdAt' | 'updatedAt' | 'consent' | 'rights'>): Promise<DataSubject> {
    const dataSubject: DataSubject = {
      ...data,
      id: this.generateDataSubjectId(),
      consent: [],
      rights: {
        access: true,
        rectification: true,
        erasure: true,
        portability: true,
        restriction: true,
        objection: true,
        automatedDecision: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Encriptar datos sensibles
    if (this.config.encryption.enableEncryption) {
      dataSubject.data = await this.encryptData(dataSubject.data);
    }

    this.dataSubjects.set(dataSubject.id, dataSubject);
    return dataSubject;
  }

  public async updateDataSubject(id: string, updates: Partial<DataSubject>): Promise<boolean> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) return false;

    const updatedDataSubject = {
      ...dataSubject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Encriptar datos sensibles si se actualizaron
    if (updates.data && this.config.encryption.enableEncryption) {
      updatedDataSubject.data = await this.encryptData(updates.data);
    }

    this.dataSubjects.set(id, updatedDataSubject);
    return true;
  }

  public async deleteDataSubject(id: string): Promise<boolean> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) return false;

    // Verificar si hay restricciones de eliminación
    if (!dataSubject.rights.erasure) {
      throw new Error('Data subject has restricted erasure rights');
    }

    this.dataSubjects.delete(id);
    return true;
  }

  public async getDataSubject(id: string): Promise<DataSubject | null> {
    const dataSubject = this.dataSubjects.get(id);
    if (!dataSubject) return null;

    // Desencriptar datos sensibles
    if (this.config.encryption.enableEncryption) {
      dataSubject.data = await this.decryptData(dataSubject.data);
    }

    return dataSubject;
  }

  // Métodos de gestión de consentimiento
  public async grantConsent(dataSubjectId: string, purpose: string, legalBasis: ConsentRecord['legalBasis']): Promise<ConsentRecord> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) throw new Error('Data subject not found');

    const consent: ConsentRecord = {
      id: this.generateConsentId(),
      purpose,
      granted: true,
      grantedAt: new Date().toISOString(),
      legalBasis,
      version: '1.0',
      metadata: {},
    };

    dataSubject.consent.push(consent);
    dataSubject.updatedAt = new Date().toISOString();
    this.dataSubjects.set(dataSubjectId, dataSubject);

    return consent;
  }

  public async withdrawConsent(dataSubjectId: string, consentId: string): Promise<boolean> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) return false;

    const consent = dataSubject.consent.find(c => c.id === consentId);
    if (!consent) return false;

    consent.granted = false;
    consent.withdrawnAt = new Date().toISOString();
    dataSubject.updatedAt = new Date().toISOString();
    this.dataSubjects.set(dataSubjectId, dataSubject);

    return true;
  }

  public async getConsentStatus(dataSubjectId: string, purpose: string): Promise<boolean> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) return false;

    const consent = dataSubject.consent.find(c => c.purpose === purpose && c.granted);
    return !!consent;
  }

  // Métodos de derechos de datos
  public async exerciseDataRight(dataSubjectId: string, right: keyof DataRights): Promise<{ success: boolean; data?: any; error?: string }> {
    const dataSubject = this.dataSubjects.get(dataSubjectId);
    if (!dataSubject) return { success: false, error: 'Data subject not found' };

    if (!dataSubject.rights[right]) {
      return { success: false, error: `Right ${right} is not available` };
    }

    switch (right) {
      case 'access':
        return { success: true, data: await this.getDataSubject(dataSubjectId) };
      
      case 'rectification':
        // Implementar rectificación
        return { success: true, data: 'Rectification request processed' };
      
      case 'erasure':
        return { success: await this.deleteDataSubject(dataSubjectId) };
      
      case 'portability':
        return { success: true, data: await this.exportData(dataSubjectId) };
      
      case 'restriction':
        // Implementar restricción
        return { success: true, data: 'Restriction request processed' };
      
      case 'objection':
        // Implementar oposición
        return { success: true, data: 'Objection request processed' };
      
      case 'automatedDecision':
        // Implementar decisión automatizada
        return { success: true, data: 'Automated decision review processed' };
      
      default:
        return { success: false, error: 'Unknown right' };
    }
  }

  // Métodos de encriptación
  public async encryptData(data: Record<string, any>): Promise<Record<string, any>> {
    if (!this.config.encryption.enableEncryption || !this.encryptionKey) {
      return data;
    }

    try {
      const encryptedData: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveData(key)) {
          encryptedData[key] = await this.encryptValue(value);
        } else {
          encryptedData[key] = value;
        }
      }

      return encryptedData;
    } catch (error) {
      console.error('Encryption error:', error);
      return data;
    }
  }

  public async decryptData(data: Record<string, any>): Promise<Record<string, any>> {
    if (!this.config.encryption.enableEncryption || !this.encryptionKey) {
      return data;
    }

    try {
      const decryptedData: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveData(key)) {
          decryptedData[key] = await this.decryptValue(value);
        } else {
          decryptedData[key] = value;
        }
      }

      return decryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      return data;
    }
  }

  private async encryptValue(value: any): Promise<string> {
    // Simular encriptación
    const jsonString = JSON.stringify(value);
    return btoa(jsonString); // Base64 encoding como simulación
  }

  private async decryptValue(encryptedValue: string): Promise<any> {
    // Simular desencriptación
    try {
      const jsonString = atob(encryptedValue);
      return JSON.parse(jsonString);
    } catch (error) {
      return encryptedValue;
    }
  }

  private isSensitiveData(key: string): boolean {
    const sensitiveKeys = ['email', 'phone', 'address', 'ssn', 'creditCard', 'password'];
    return sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey));
  }

  // Métodos de gestión de brechas de datos
  public async reportDataBreach(breach: Omit<DataBreach, 'id' | 'discoveredAt' | 'status'>): Promise<DataBreach> {
    const dataBreach: DataBreach = {
      ...breach,
      id: this.generateBreachId(),
      discoveredAt: new Date().toISOString(),
      status: 'discovered',
    };

    // Determinar si se requiere notificación
    if (this.config.privacy.enableGDPR) {
      dataBreach.notificationRequired = this.requiresNotification(dataBreach);
      if (dataBreach.notificationRequired) {
        dataBreach.notificationDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(); // 72 horas
      }
    }

    this.dataBreaches.push(dataBreach);
    return dataBreach;
  }

  private requiresNotification(breach: DataBreach): boolean {
    // Criterios GDPR para notificación
    return breach.severity === 'high' || breach.severity === 'critical' || breach.affectedSubjects > 100;
  }

  // Métodos de exportación y portabilidad
  public async exportData(dataSubjectId: string): Promise<string> {
    const dataSubject = await this.getDataSubject(dataSubjectId);
    if (!dataSubject) throw new Error('Data subject not found');

    const exportData = {
      dataSubject: {
        id: dataSubject.id,
        email: dataSubject.email,
        name: dataSubject.name,
        data: dataSubject.data,
        consent: dataSubject.consent,
        rights: dataSubject.rights,
        createdAt: dataSubject.createdAt,
        updatedAt: dataSubject.updatedAt,
      },
      processingActivities: Array.from(this.processingActivities.values()),
      privacyPolicy: Array.from(this.privacyPolicies.values())[0],
      exportDate: new Date().toISOString(),
      format: 'JSON',
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Métodos de auditoría y cumplimiento
  public async auditDataAccess(dataSubjectId: string, userId: string, resource: string, action: string): Promise<void> {
    if (!this.config.monitoring.enableDataAudit) return;

    // Log de acceso a datos
    console.log(`Data access audit: User ${userId} accessed ${resource} for data subject ${dataSubjectId} with action ${action}`);
  }

  public async checkCompliance(): Promise<{ compliant: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Verificar políticas de privacidad
    if (this.privacyPolicies.size === 0) {
      issues.push('No privacy policy found');
    }

    // Verificar actividades de procesamiento
    if (this.processingActivities.size === 0) {
      issues.push('No data processing activities documented');
    }

    // Verificar brechas de datos no reportadas
    const unreportedBreaches = this.dataBreaches.filter(breach => 
      breach.status === 'discovered' && breach.notificationRequired && !breach.reportedAt
    );
    if (unreportedBreaches.length > 0) {
      issues.push(`${unreportedBreaches.length} unreported data breaches`);
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  // Métodos de utilidad
  private generateDataSubjectId(): string {
    return `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBreachId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEncryptionKey(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getDataSubjects(): DataSubject[] {
    return Array.from(this.dataSubjects.values());
  }

  public getProcessingActivities(): DataProcessingActivity[] {
    return Array.from(this.processingActivities.values());
  }

  public getDataBreaches(): DataBreach[] {
    return [...this.dataBreaches];
  }

  public getPrivacyPolicies(): PrivacyPolicy[] {
    return Array.from(this.privacyPolicies.values());
  }

  public getConfig(): DataProtectionConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<DataProtectionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const dataProtection = DataProtectionService.getInstance();

export default DataProtectionService;

/**
 * Sistema de health check para Sensus
 * Proporciona funcionalidades de verificación de salud de la aplicación
 */

export interface HealthCheck {
  id: string;
  name: string;
  description: string;
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  lastCheck: string;
  responseTime: number;
  error?: string;
  metadata: Record<string, any>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  checks: HealthCheck[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
    unknown: number;
    averageResponseTime: number;
  };
  timestamp: string;
  version: string;
  environment: string;
}

export interface HealthCheckConfig {
  interval: number; // milisegundos
  timeout: number; // milisegundos
  retries: number;
  enabled: boolean;
  checks: HealthCheckDefinition[];
}

export interface HealthCheckDefinition {
  id: string;
  name: string;
  description: string;
  type: 'http' | 'database' | 'cache' | 'storage' | 'external' | 'custom';
  config: Record<string, any>;
  enabled: boolean;
  critical: boolean;
  timeout: number;
  retries: number;
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private checks: Map<string, HealthCheck> = new Map();
  private config: HealthCheckConfig;
  private interval?: NodeJS.Timeout;
  private _isRunning: boolean = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultChecks();
  }

  public static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  private getDefaultConfig(): HealthCheckConfig {
    return {
      interval: 30000, // 30 segundos
      timeout: 5000, // 5 segundos
      retries: 3,
      enabled: true,
      checks: [],
    };
  }

  private setupDefaultChecks(): void {
    this.config.checks = [
      {
        id: 'application',
        name: 'Application Health',
        description: 'Check if the application is running',
        type: 'custom',
        config: {},
        enabled: true,
        critical: true,
        timeout: 1000,
        retries: 1,
      },
      {
        id: 'database',
        name: 'Database Connection',
        description: 'Check database connectivity',
        type: 'database',
        config: { url: process.env.DATABASE_URL || 'mongodb://localhost:27017/sensus' },
        enabled: true,
        critical: true,
        timeout: 5000,
        retries: 3,
      },
      {
        id: 'cache',
        name: 'Cache Service',
        description: 'Check cache service connectivity',
        type: 'cache',
        config: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
        enabled: true,
        critical: false,
        timeout: 3000,
        retries: 2,
      },
      {
        id: 'storage',
        name: 'Storage Service',
        description: 'Check storage service connectivity',
        type: 'storage',
        config: { url: process.env.STORAGE_URL || 'https://storage.example.com' },
        enabled: true,
        critical: false,
        timeout: 5000,
        retries: 2,
      },
      {
        id: 'external-api',
        name: 'External API',
        description: 'Check external API connectivity',
        type: 'external',
        config: { url: process.env.EXTERNAL_API_URL || 'https://api.example.com/health' },
        enabled: true,
        critical: false,
        timeout: 10000,
        retries: 2,
      },
    ];
  }

  // Métodos de configuración
  public configure(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public addCheck(definition: HealthCheckDefinition): void {
    this.config.checks.push(definition);
  }

  public removeCheck(checkId: string): boolean {
    const index = this.config.checks.findIndex(check => check.id === checkId);
    if (index === -1) return false;

    this.config.checks.splice(index, 1);
    this.checks.delete(checkId);
    return true;
  }

  public updateCheck(checkId: string, updates: Partial<HealthCheckDefinition>): boolean {
    const index = this.config.checks.findIndex(check => check.id === checkId);
    if (index === -1) return false;

    this.config.checks[index] = { ...this.config.checks[index], ...updates };
    return true;
  }

  // Métodos de ejecución
  public start(): void {
    if (this.isRunning) return;

    this._isRunning = true;
    this.runChecks(); // Ejecutar inmediatamente
    this.interval = setInterval(() => {
      this.runChecks();
    }, this.config.interval);
  }

  public stop(): void {
    if (!this.isRunning) return;

    this._isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  public async runChecks(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = [];
    const startTime = Date.now();

    for (const definition of this.config.checks) {
      if (!definition.enabled) continue;

      const check = await this.runCheck(definition);
      checks.push(check);
      this.checks.set(definition.id, check);
    }

    const totalTime = Date.now() - startTime;
    const summary = this.calculateSummary(checks);

    return {
      status: this.determineOverallStatus(checks),
      checks,
      summary,
      timestamp: new Date().toISOString(),
      version: process.env.VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private async runCheck(definition: HealthCheckDefinition): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: HealthCheck['status'] = 'unknown';
    let error: string | undefined;
    let metadata: Record<string, any> = {};

    try {
      switch (definition.type) {
        case 'http':
          const httpResult = await this.checkHttp(definition.config);
          status = httpResult.status;
          metadata = httpResult.metadata;
          break;
        case 'database':
          const dbResult = await this.checkDatabase(definition.config);
          status = dbResult.status;
          metadata = dbResult.metadata;
          break;
        case 'cache':
          const cacheResult = await this.checkCache(definition.config);
          status = cacheResult.status;
          metadata = cacheResult.metadata;
          break;
        case 'storage':
          const storageResult = await this.checkStorage(definition.config);
          status = storageResult.status;
          metadata = storageResult.metadata;
          break;
        case 'external':
          const externalResult = await this.checkExternal(definition.config);
          status = externalResult.status;
          metadata = externalResult.metadata;
          break;
        case 'custom':
          const customResult = await this.checkCustom(definition.config);
          status = customResult.status;
          metadata = customResult.metadata;
          break;
        default:
          status = 'unknown';
          error = `Unknown check type: ${definition.type}`;
      }
    } catch (err) {
      status = 'unhealthy';
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const responseTime = Date.now() - startTime;

    return {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      status,
      lastCheck: new Date().toISOString(),
      responseTime,
      error,
      metadata,
    };
  }

  private async checkHttp(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    const url = config.url;
    const method = config.method || 'GET';
    const headers = config.headers || {};
    const timeout = config.timeout || this.config.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const status = response.ok ? 'healthy' : 'degraded';
      const metadata = {
        statusCode: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };

      return { status, metadata };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async checkDatabase(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    // Simular verificación de base de datos
    const url = config.url;
    const timeout = config.timeout || this.config.timeout;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Database connection timeout'));
      }, timeout);

      // Simular conexión a base de datos
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          status: 'healthy',
          metadata: {
            url,
            connectionTime: Math.random() * 100,
            version: '1.0.0',
          },
        });
      }, Math.random() * 1000);
    });
  }

  private async checkCache(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    // Simular verificación de cache
    const url = config.url;
    const timeout = config.timeout || this.config.timeout;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Cache connection timeout'));
      }, timeout);

      // Simular conexión a cache
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          status: 'healthy',
          metadata: {
            url,
            connectionTime: Math.random() * 50,
            version: '1.0.0',
          },
        });
      }, Math.random() * 500);
    });
  }

  private async checkStorage(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    // Simular verificación de storage
    const url = config.url;
    const timeout = config.timeout || this.config.timeout;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Storage connection timeout'));
      }, timeout);

      // Simular conexión a storage
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          status: 'healthy',
          metadata: {
            url,
            connectionTime: Math.random() * 200,
            version: '1.0.0',
          },
        });
      }, Math.random() * 1000);
    });
  }

  private async checkExternal(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    // Simular verificación de API externa
    const url = config.url;
    const timeout = config.timeout || this.config.timeout;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('External API timeout'));
      }, timeout);

      // Simular conexión a API externa
      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          status: 'healthy',
          metadata: {
            url,
            connectionTime: Math.random() * 300,
            version: '1.0.0',
          },
        });
      }, Math.random() * 1500);
    });
  }

  private async checkCustom(config: Record<string, any>): Promise<{ status: HealthCheck['status']; metadata: Record<string, any> }> {
    // Verificación personalizada para la aplicación
    const metadata = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: Date.now(),
    };

    return {
      status: 'healthy',
      metadata,
    };
  }

  private calculateSummary(checks: HealthCheck[]): HealthCheckResult['summary'] {
    const total = checks.length;
    const healthy = checks.filter(c => c.status === 'healthy').length;
    const unhealthy = checks.filter(c => c.status === 'unhealthy').length;
    const degraded = checks.filter(c => c.status === 'degraded').length;
    const unknown = checks.filter(c => c.status === 'unknown').length;
    const averageResponseTime = checks.reduce((sum, c) => sum + c.responseTime, 0) / total;

    return {
      total,
      healthy,
      unhealthy,
      degraded,
      unknown,
      averageResponseTime,
    };
  }

  private determineOverallStatus(checks: HealthCheck[]): HealthCheckResult['status'] {
    const criticalChecks = checks.filter(c => {
      const definition = this.config.checks.find(d => d.id === c.id);
      return definition?.critical;
    });

    // Si hay checks críticos fallando, el estado es unhealthy
    if (criticalChecks.some(c => c.status === 'unhealthy')) {
      return 'unhealthy';
    }

    // Si hay checks críticos degradados, el estado es degraded
    if (criticalChecks.some(c => c.status === 'degraded')) {
      return 'degraded';
    }

    // Si hay checks no críticos fallando, el estado es degraded
    if (checks.some(c => c.status === 'unhealthy')) {
      return 'degraded';
    }

    // Si todos los checks están healthy, el estado es healthy
    if (checks.every(c => c.status === 'healthy')) {
      return 'healthy';
    }

    return 'unknown';
  }

  // Métodos de consulta
  public getChecks(): HealthCheck[] {
    return Array.from(this.checks.values());
  }

  public getCheck(checkId: string): HealthCheck | undefined {
    return this.checks.get(checkId);
  }

  public getConfig(): HealthCheckConfig {
    return { ...this.config };
  }

  public isRunning(): boolean {
    return this._isRunning;
  }

  // Métodos de utilidad
  public getStatus(): 'healthy' | 'unhealthy' | 'degraded' | 'unknown' {
    const checks = this.getChecks();
    if (checks.length === 0) return 'unknown';

    return this.determineOverallStatus(checks);
  }

  public getUptime(): number {
    return process.uptime();
  }

  public getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // Métodos de limpieza
  public destroy(): void {
    this.stop();
    this.checks.clear();
  }
}

// Instancia singleton
export const healthCheck = HealthCheckService.getInstance();

export default HealthCheckService;

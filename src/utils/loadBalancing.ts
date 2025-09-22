/**
 * Sistema de Load Balancing para Sensus
 * Proporciona funcionalidades de distribución de carga, health checks y failover
 */

export interface LoadBalancerTarget {
  id: string;
  url: string;
  weight: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: string;
  responseTime: number; // ms
  errorCount: number;
  successCount: number;
  metadata: Record<string, any>;
}

export interface LoadBalancerConfig {
  id: string;
  name: string;
  type: 'round_robin' | 'least_connections' | 'weighted' | 'ip_hash' | 'random';
  targets: LoadBalancerTarget[];
  healthCheck: {
    path: string;
    interval: number; // segundos
    timeout: number; // segundos
    retries: number;
    expectedStatus: number[];
  };
  failover: {
    enabled: boolean;
    maxFailures: number;
    recoveryTime: number; // segundos
  };
  stickySessions: {
    enabled: boolean;
    cookieName: string;
    ttl: number; // segundos
  };
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface LoadBalancerStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  currentConnections: number;
  targetStats: Record<string, {
    requests: number;
    successes: number;
    failures: number;
    avgResponseTime: number;
    health: string;
  }>;
  timestamp: string;
}

export interface HealthCheckResult {
  targetId: string;
  healthy: boolean;
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: string;
}

export class LoadBalancingService {
  private static instance: LoadBalancingService;
  private loadBalancers: Map<string, LoadBalancerConfig> = new Map();
  private stats: Map<string, LoadBalancerStats> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private connectionCounts: Map<string, Map<string, number>> = new Map();

  private constructor() {
    this.setupDefaultLoadBalancer();
    this.startHealthChecks();
  }

  public static getInstance(): LoadBalancingService {
    if (!LoadBalancingService.instance) {
      LoadBalancingService.instance = new LoadBalancingService();
    }
    return LoadBalancingService.instance;
  }

  private setupDefaultLoadBalancer(): void {
    const defaultConfig: LoadBalancerConfig = {
      id: 'main-load-balancer',
      name: 'Main Load Balancer',
      type: 'least_connections',
      targets: [
        {
          id: 'server-1',
          url: 'http://server1:3000',
          weight: 1,
          health: 'healthy',
          lastHealthCheck: new Date().toISOString(),
          responseTime: 100,
          errorCount: 0,
          successCount: 100,
          metadata: {},
        },
        {
          id: 'server-2',
          url: 'http://server2:3000',
          weight: 1,
          health: 'healthy',
          lastHealthCheck: new Date().toISOString(),
          responseTime: 120,
          errorCount: 0,
          successCount: 95,
          metadata: {},
        },
        {
          id: 'server-3',
          url: 'http://server3:3000',
          weight: 1,
          health: 'healthy',
          lastHealthCheck: new Date().toISOString(),
          responseTime: 110,
          errorCount: 0,
          successCount: 98,
          metadata: {},
        },
      ],
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
        retries: 3,
        expectedStatus: [200, 201],
      },
      failover: {
        enabled: true,
        maxFailures: 3,
        recoveryTime: 300, // 5 minutos
      },
      stickySessions: {
        enabled: false,
        cookieName: 'lb_session',
        ttl: 3600, // 1 hora
      },
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {},
    };

    this.loadBalancers.set(defaultConfig.id, defaultConfig);
    this.initializeStats(defaultConfig.id);
    this.initializeConnectionCounts(defaultConfig.id);
  }

  private initializeStats(loadBalancerId: string): void {
    const stats: LoadBalancerStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      currentConnections: 0,
      targetStats: {},
      timestamp: new Date().toISOString(),
    };

    this.stats.set(loadBalancerId, stats);
  }

  private initializeConnectionCounts(loadBalancerId: string): void {
    const connectionCounts = new Map<string, number>();
    this.connectionCounts.set(loadBalancerId, connectionCounts);
  }

  private startHealthChecks(): void {
    for (const [loadBalancerId, config] of this.loadBalancers) {
      if (config.enabled) {
        this.startHealthCheckForLoadBalancer(loadBalancerId);
      }
    }
  }

  private startHealthCheckForLoadBalancer(loadBalancerId: string): void {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return;

    const interval = setInterval(async () => {
      await this.performHealthChecks(loadBalancerId);
    }, config.healthCheck.interval * 1000);

    this.healthCheckIntervals.set(loadBalancerId, interval);
  }

  private async performHealthChecks(loadBalancerId: string): Promise<void> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return;

    const healthCheckPromises = config.targets.map(target => 
      this.performHealthCheck(target, config.healthCheck)
    );

    const results = await Promise.allSettled(healthCheckPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.updateTargetHealth(loadBalancerId, config.targets[index].id, result.value);
      } else {
        this.updateTargetHealth(loadBalancerId, config.targets[index].id, {
          targetId: config.targets[index].id,
          healthy: false,
          responseTime: 0,
          error: result.reason?.message || 'Health check failed',
          timestamp: new Date().toISOString(),
        });
      }
    });
  }

  private async performHealthCheck(target: LoadBalancerTarget, healthCheckConfig: LoadBalancerConfig['healthCheck']): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Simular health check HTTP
      const responseTime = Math.random() * 200 + 50; // 50-250ms
      const isHealthy = Math.random() > 0.1; // 90% healthy
      const statusCode = isHealthy ? 200 : 500;

      return {
        targetId: target.id,
        healthy: isHealthy,
        responseTime,
        statusCode,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        targetId: target.id,
        healthy: false,
        responseTime: Date.now() - startTime,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private updateTargetHealth(loadBalancerId: string, targetId: string, result: HealthCheckResult): void {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return;

    const target = config.targets.find(t => t.id === targetId);
    if (!target) return;

    target.lastHealthCheck = result.timestamp;
    target.responseTime = result.responseTime;

    if (result.healthy) {
      target.health = 'healthy';
      target.successCount++;
    } else {
      target.health = 'unhealthy';
      target.errorCount++;
    }

    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);
  }

  // Métodos públicos
  public async createLoadBalancer(config: Omit<LoadBalancerConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<LoadBalancerConfig> {
    const newConfig: LoadBalancerConfig = {
      ...config,
      id: this.generateLoadBalancerId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.loadBalancers.set(newConfig.id, newConfig);
    this.initializeStats(newConfig.id);
    this.initializeConnectionCounts(newConfig.id);

    if (newConfig.enabled) {
      this.startHealthCheckForLoadBalancer(newConfig.id);
    }

    return newConfig;
  }

  public async selectTarget(loadBalancerId: string, clientIp?: string): Promise<LoadBalancerTarget | null> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config || !config.enabled) return null;

    const healthyTargets = config.targets.filter(target => target.health === 'healthy');
    if (healthyTargets.length === 0) return null;

    let selectedTarget: LoadBalancerTarget;

    switch (config.type) {
      case 'round_robin':
        selectedTarget = this.selectRoundRobin(healthyTargets);
        break;
      case 'least_connections':
        selectedTarget = this.selectLeastConnections(loadBalancerId, healthyTargets);
        break;
      case 'weighted':
        selectedTarget = this.selectWeighted(healthyTargets);
        break;
      case 'ip_hash':
        selectedTarget = this.selectIpHash(healthyTargets, clientIp);
        break;
      case 'random':
        selectedTarget = this.selectRandom(healthyTargets);
        break;
      default:
        selectedTarget = healthyTargets[0];
    }

    // Incrementar contador de conexiones
    this.incrementConnectionCount(loadBalancerId, selectedTarget.id);

    return selectedTarget;
  }

  private selectRoundRobin(targets: LoadBalancerTarget[]): LoadBalancerTarget {
    // Implementación simple de round robin
    const index = Math.floor(Math.random() * targets.length);
    return targets[index];
  }

  private selectLeastConnections(loadBalancerId: string, targets: LoadBalancerTarget[]): LoadBalancerTarget {
    const connectionCounts = this.connectionCounts.get(loadBalancerId);
    if (!connectionCounts) return targets[0];

    let minConnections = Infinity;
    let selectedTarget = targets[0];

    for (const target of targets) {
      const connections = connectionCounts.get(target.id) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedTarget = target;
      }
    }

    return selectedTarget;
  }

  private selectWeighted(targets: LoadBalancerTarget[]): LoadBalancerTarget {
    const totalWeight = targets.reduce((sum, target) => sum + target.weight, 0);
    let random = Math.random() * totalWeight;

    for (const target of targets) {
      random -= target.weight;
      if (random <= 0) {
        return target;
      }
    }

    return targets[targets.length - 1];
  }

  private selectIpHash(targets: LoadBalancerTarget[], clientIp?: string): LoadBalancerTarget {
    if (!clientIp) return this.selectRandom(targets);

    // Hash simple basado en IP
    let hash = 0;
    for (let i = 0; i < clientIp.length; i++) {
      hash = ((hash << 5) - hash + clientIp.charCodeAt(i)) & 0xffffffff;
    }
    hash = Math.abs(hash);

    return targets[hash % targets.length];
  }

  private selectRandom(targets: LoadBalancerTarget[]): LoadBalancerTarget {
    return targets[Math.floor(Math.random() * targets.length)];
  }

  private incrementConnectionCount(loadBalancerId: string, targetId: string): void {
    const connectionCounts = this.connectionCounts.get(loadBalancerId);
    if (!connectionCounts) return;

    const currentCount = connectionCounts.get(targetId) || 0;
    connectionCounts.set(targetId, currentCount + 1);
  }

  public async recordRequest(loadBalancerId: string, targetId: string, success: boolean, responseTime: number): Promise<void> {
    const stats = this.stats.get(loadBalancerId);
    if (!stats) return;

    stats.totalRequests++;
    if (success) {
      stats.successfulRequests++;
    } else {
      stats.failedRequests++;
    }

    // Actualizar tiempo de respuesta promedio
    const totalResponses = stats.successfulRequests + stats.failedRequests;
    stats.averageResponseTime = (stats.averageResponseTime * (totalResponses - 1) + responseTime) / totalResponses;

    // Actualizar estadísticas del target
    if (!stats.targetStats[targetId]) {
      stats.targetStats[targetId] = {
        requests: 0,
        successes: 0,
        failures: 0,
        avgResponseTime: 0,
        health: 'unknown',
      };
    }

    const targetStats = stats.targetStats[targetId];
    targetStats.requests++;
    if (success) {
      targetStats.successes++;
    } else {
      targetStats.failures++;
    }
    targetStats.avgResponseTime = (targetStats.avgResponseTime * (targetStats.requests - 1) + responseTime) / targetStats.requests;

    // Actualizar estado de salud del target
    const config = this.loadBalancers.get(loadBalancerId);
    if (config) {
      const target = config.targets.find(t => t.id === targetId);
      if (target) {
        targetStats.health = target.health;
      }
    }

    stats.timestamp = new Date().toISOString();
    this.stats.set(loadBalancerId, stats);
  }

  public async decrementConnectionCount(loadBalancerId: string, targetId: string): Promise<void> {
    const connectionCounts = this.connectionCounts.get(loadBalancerId);
    if (!connectionCounts) return;

    const currentCount = connectionCounts.get(targetId) || 0;
    if (currentCount > 0) {
      connectionCounts.set(targetId, currentCount - 1);
    }
  }

  public async addTarget(loadBalancerId: string, target: Omit<LoadBalancerTarget, 'id'>): Promise<LoadBalancerTarget> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) throw new Error('Load balancer not found');

    const newTarget: LoadBalancerTarget = {
      ...target,
      id: this.generateTargetId(),
    };

    config.targets.push(newTarget);
    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);

    return newTarget;
  }

  public async removeTarget(loadBalancerId: string, targetId: string): Promise<boolean> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return false;

    const targetIndex = config.targets.findIndex(t => t.id === targetId);
    if (targetIndex === -1) return false;

    config.targets.splice(targetIndex, 1);
    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);

    return true;
  }

  public async updateTarget(loadBalancerId: string, targetId: string, updates: Partial<LoadBalancerTarget>): Promise<boolean> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return false;

    const target = config.targets.find(t => t.id === targetId);
    if (!target) return false;

    Object.assign(target, updates);
    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);

    return true;
  }

  public async enableLoadBalancer(loadBalancerId: string): Promise<boolean> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return false;

    config.enabled = true;
    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);

    this.startHealthCheckForLoadBalancer(loadBalancerId);
    return true;
  }

  public async disableLoadBalancer(loadBalancerId: string): Promise<boolean> {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return false;

    config.enabled = false;
    config.updatedAt = new Date().toISOString();
    this.loadBalancers.set(loadBalancerId, config);

    const interval = this.healthCheckIntervals.get(loadBalancerId);
    if (interval) {
      clearInterval(interval);
      this.healthCheckIntervals.delete(loadBalancerId);
    }

    return true;
  }

  // Métodos de consulta
  public getLoadBalancers(): LoadBalancerConfig[] {
    return Array.from(this.loadBalancers.values());
  }

  public getLoadBalancer(loadBalancerId: string): LoadBalancerConfig | null {
    return this.loadBalancers.get(loadBalancerId) || null;
  }

  public getStats(loadBalancerId: string): LoadBalancerStats | null {
    return this.stats.get(loadBalancerId) || null;
  }

  public getAllStats(): Map<string, LoadBalancerStats> {
    return new Map(this.stats);
  }

  public getHealthyTargets(loadBalancerId: string): LoadBalancerTarget[] {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return [];

    return config.targets.filter(target => target.health === 'healthy');
  }

  public getUnhealthyTargets(loadBalancerId: string): LoadBalancerTarget[] {
    const config = this.loadBalancers.get(loadBalancerId);
    if (!config) return [];

    return config.targets.filter(target => target.health === 'unhealthy');
  }

  // Métodos de utilidad
  private generateLoadBalancerId(): string {
    return `lb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTargetId(): string {
    return `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpieza
  public destroy(): void {
    // Limpiar todos los intervalos de health check
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
  }
}

// Instancia singleton
export const loadBalancing = LoadBalancingService.getInstance();

export default LoadBalancingService;

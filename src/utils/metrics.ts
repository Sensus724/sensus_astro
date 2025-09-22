/**
 * Sistema de métricas avanzado para Sensus
 * Proporciona funcionalidades de recolección, agregación y análisis de métricas
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  tags: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'summary' | 'timer';
  unit?: string;
  description?: string;
}

export interface MetricAggregation {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  tags: Record<string, string>;
}

export interface MetricQuery {
  name?: string;
  tags?: Record<string, string>;
  startTime?: string;
  endTime?: string;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy?: string[];
  limit?: number;
  offset?: number;
}

export interface MetricAlert {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  duration: number; // segundos
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  channels: string[];
  cooldown: number; // minutos
  lastTriggered?: string;
}

export interface MetricDashboard {
  id: string;
  name: string;
  description: string;
  widgets: MetricWidget[];
  refreshInterval: number;
  public: boolean;
  created: string;
  updated: string;
}

export interface MetricWidget {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'table' | 'stat';
  title: string;
  query: MetricQuery;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Metric[] = [];
  private maxMetrics: number = 10000;
  private flushInterval: number = 60000; // 1 minuto
  private flushTimer?: number;
  private remoteEndpoint?: string;
  private enableRemote: boolean = false;
  private sampleRate: number = 1.0;
  private alerts: MetricAlert[] = [];
  private alertCooldowns: Map<string, number> = new Map();

  private constructor() {
    this.setupAutoFlush();
    this.setupSystemMetrics();
    this.setupPerformanceMetrics();
  }

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupSystemMetrics(): void {
    // Métricas de memoria
    setInterval(() => {
      if (performance.memory) {
        this.gauge('memory.used', performance.memory.usedJSHeapSize, { unit: 'bytes' });
        this.gauge('memory.total', performance.memory.totalJSHeapSize, { unit: 'bytes' });
        this.gauge('memory.limit', performance.memory.jsHeapSizeLimit, { unit: 'bytes' });
        this.gauge('memory.percentage', (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100, { unit: 'percent' });
      }
    }, 30000);

    // Métricas de timing
    setInterval(() => {
      const timing = performance.timing;
      if (timing.loadEventEnd > 0) {
        this.histogram('timing.navigation', timing.loadEventEnd - timing.navigationStart, { unit: 'ms' });
        this.histogram('timing.dom', timing.domContentLoadedEventEnd - timing.navigationStart, { unit: 'ms' });
        this.histogram('timing.load', timing.loadEventEnd - timing.navigationStart, { unit: 'ms' });
        this.histogram('timing.dns', timing.domainLookupEnd - timing.domainLookupStart, { unit: 'ms' });
        this.histogram('timing.tcp', timing.connectEnd - timing.connectStart, { unit: 'ms' });
        this.histogram('timing.request', timing.responseStart - timing.requestStart, { unit: 'ms' });
        this.histogram('timing.response', timing.responseEnd - timing.responseStart, { unit: 'ms' });
      }
    }, 60000);

    // Métricas de Core Web Vitals
    this.setupCoreWebVitals();
  }

  private setupCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.histogram('webvitals.lcp', lastEntry.startTime, { unit: 'ms' });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.histogram('webvitals.fid', entry.processingStart - entry.startTime, { unit: 'ms' });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.histogram('webvitals.cls', clsValue, { unit: 'score' });
    }).observe({ entryTypes: ['layout-shift'] });

    // First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.histogram('webvitals.fcp', entry.startTime, { unit: 'ms' });
      });
    }).observe({ entryTypes: ['paint'] });
  }

  private setupPerformanceMetrics(): void {
    // Métricas de interacción del usuario
    document.addEventListener('click', () => {
      this.counter('user.interaction.click', 1);
    });

    document.addEventListener('scroll', () => {
      this.counter('user.interaction.scroll', 1);
    });

    document.addEventListener('keydown', () => {
      this.counter('user.interaction.keydown', 1);
    });

    // Métricas de navegación
    window.addEventListener('popstate', () => {
      this.counter('user.navigation.popstate', 1);
    });

    // Métricas de red
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const url = args[0];
      const method = args[1]?.method || 'GET';
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        this.histogram('network.request.duration', duration, { 
          method, 
          status: response.status.toString(),
          url: url.toString().substring(0, 100) // Truncar URL larga
        });
        
        this.counter('network.request.count', 1, { method, status: response.status.toString() });
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        
        this.histogram('network.request.duration', duration, { 
          method, 
          status: 'error',
          url: url.toString().substring(0, 100)
        });
        
        this.counter('network.request.error', 1, { method });
        
        throw error;
      }
    };
  }

  // Métodos de configuración
  public configure(options: {
    remoteEndpoint?: string;
    enableRemote?: boolean;
    sampleRate?: number;
    maxMetrics?: number;
    flushInterval?: number;
  }): void {
    this.remoteEndpoint = options.remoteEndpoint;
    this.enableRemote = options.enableRemote ?? false;
    this.sampleRate = options.sampleRate ?? 1.0;
    this.maxMetrics = options.maxMetrics ?? 10000;
    this.flushInterval = options.flushInterval ?? 60000;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.setupAutoFlush();
  }

  // Métodos de recolección de métricas
  public counter(name: string, value: number = 1, tags: Record<string, string> = {}): void {
    if (Math.random() > this.sampleRate) return;

    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'counter',
      description: `Counter metric: ${name}`,
    };

    this.addMetric(metric);
  }

  public gauge(name: string, value: number, tags: Record<string, string> = {}): void {
    if (Math.random() > this.sampleRate) return;

    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'gauge',
      description: `Gauge metric: ${name}`,
    };

    this.addMetric(metric);
  }

  public histogram(name: string, value: number, tags: Record<string, string> = {}): void {
    if (Math.random() > this.sampleRate) return;

    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'histogram',
      description: `Histogram metric: ${name}`,
    };

    this.addMetric(metric);
  }

  public summary(name: string, value: number, tags: Record<string, string> = {}): void {
    if (Math.random() > this.sampleRate) return;

    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type: 'summary',
      description: `Summary metric: ${name}`,
    };

    this.addMetric(metric);
  }

  public timer(name: string, tags: Record<string, string> = {}): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.histogram(name, duration, { ...tags, unit: 'ms' });
    };
  }

  private addMetric(metric: Metric): void {
    this.metrics.push(metric);

    // Verificar alertas
    this.checkAlerts(metric);

    // Limitar tamaño del buffer
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Métodos de alertas
  public addAlert(alert: MetricAlert): void {
    this.alerts.push(alert);
  }

  public removeAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }

  public updateAlert(alertId: string, updates: Partial<MetricAlert>): void {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index !== -1) {
      this.alerts[index] = { ...this.alerts[index], ...updates };
    }
  }

  private checkAlerts(metric: Metric): void {
    this.alerts.forEach(alert => {
      if (!alert.enabled) return;
      if (alert.metric !== metric.name) return;

      // Verificar cooldown
      const lastTriggered = this.alertCooldowns.get(alert.id);
      if (lastTriggered && Date.now() - lastTriggered < alert.cooldown * 60 * 1000) {
        return;
      }

      // Verificar condición
      if (this.evaluateAlertCondition(alert, metric)) {
        this.triggerAlert(alert, metric);
        this.alertCooldowns.set(alert.id, Date.now());
      }
    });
  }

  private evaluateAlertCondition(alert: MetricAlert, metric: Metric): boolean {
    switch (alert.condition) {
      case 'gt':
        return metric.value > alert.threshold;
      case 'lt':
        return metric.value < alert.threshold;
      case 'eq':
        return metric.value === alert.threshold;
      case 'gte':
        return metric.value >= alert.threshold;
      case 'lte':
        return metric.value <= alert.threshold;
      default:
        return false;
    }
  }

  private async triggerAlert(alert: MetricAlert, metric: Metric): Promise<void> {
    const alertData = {
      alert,
      metric,
      timestamp: new Date().toISOString(),
    };

    // Enviar alerta a canales configurados
    for (const channel of alert.channels) {
      try {
        await this.sendAlertToChannel(channel, alertData);
      } catch (error) {
        console.error(`Failed to send alert to channel ${channel}:`, error);
      }
    }
  }

  private async sendAlertToChannel(channel: string, alertData: any): Promise<void> {
    // Implementar envío a diferentes canales
    console.log(`Alert sent to ${channel}:`, alertData);
  }

  // Métodos de consulta
  public query(query: MetricQuery): Metric[] {
    let filteredMetrics = [...this.metrics];

    if (query.name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === query.name);
    }

    if (query.tags) {
      filteredMetrics = filteredMetrics.filter(metric => 
        Object.entries(query.tags!).every(([key, value]) => 
          metric.tags[key] === value
        )
      );
    }

    if (query.startTime) {
      filteredMetrics = filteredMetrics.filter(metric => metric.timestamp >= query.startTime!);
    }

    if (query.endTime) {
      filteredMetrics = filteredMetrics.filter(metric => metric.timestamp <= query.endTime!);
    }

    if (query.limit) {
      filteredMetrics = filteredMetrics.slice(0, query.limit);
    }

    if (query.offset) {
      filteredMetrics = filteredMetrics.slice(query.offset);
    }

    return filteredMetrics;
  }

  public aggregate(query: MetricQuery): MetricAggregation[] {
    const metrics = this.query(query);
    const grouped = this.groupMetrics(metrics, query.groupBy || []);

    return grouped.map(group => {
      const values = group.metrics.map(m => m.value).sort((a, b) => a - b);
      const count = values.length;
      const sum = values.reduce((acc, val) => acc + val, 0);
      const min = values[0] || 0;
      const max = values[count - 1] || 0;
      const avg = count > 0 ? sum / count : 0;

      return {
        name: group.name,
        count,
        sum,
        min,
        max,
        avg,
        p50: this.percentile(values, 50),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
        tags: group.tags,
      };
    });
  }

  private groupMetrics(metrics: Metric[], groupBy: string[]): Array<{ name: string; tags: Record<string, string>; metrics: Metric[] }> {
    const groups = new Map<string, { name: string; tags: Record<string, string>; metrics: Metric[] }>();

    metrics.forEach(metric => {
      const groupKey = groupBy.length > 0 
        ? groupBy.map(key => `${key}:${metric.tags[key] || 'unknown'}`).join(',')
        : metric.name;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          name: metric.name,
          tags: groupBy.reduce((acc, key) => ({ ...acc, [key]: metric.tags[key] || 'unknown' }), {}),
          metrics: [],
        });
      }

      groups.get(groupKey)!.metrics.push(metric);
    });

    return Array.from(groups.values());
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const index = Math.ceil((p / 100) * values.length) - 1;
    return values[Math.max(0, index)];
  }

  // Métodos de gestión
  public async flush(): Promise<void> {
    if (this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    if (this.enableRemote && this.remoteEndpoint) {
      try {
        await fetch(this.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metrics: metricsToSend }),
        });
      } catch (error) {
        console.error('Failed to send metrics to remote endpoint:', error);
      }
    }
  }

  public getMetrics(): Metric[] {
    return [...this.metrics];
  }

  public getAlerts(): MetricAlert[] {
    return [...this.alerts];
  }

  public clear(): void {
    this.metrics = [];
  }

  public export(): string {
    return JSON.stringify({
      metrics: this.metrics,
      alerts: this.alerts,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  public import(data: string): void {
    try {
      const imported = JSON.parse(data);
      if (imported.metrics && Array.isArray(imported.metrics)) {
        this.metrics.push(...imported.metrics);
      }
      if (imported.alerts && Array.isArray(imported.alerts)) {
        this.alerts.push(...imported.alerts);
      }
    } catch (error) {
      console.error('Failed to import metrics:', error);
    }
  }

  // Métodos de limpieza
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Instancia singleton
export const metrics = MetricsCollector.getInstance();

// Funciones de conveniencia
export const counter = (name: string, value?: number, tags?: Record<string, string>) => 
  metrics.counter(name, value, tags);
export const gauge = (name: string, value: number, tags?: Record<string, string>) => 
  metrics.gauge(name, value, tags);
export const histogram = (name: string, value: number, tags?: Record<string, string>) => 
  metrics.histogram(name, value, tags);
export const summary = (name: string, value: number, tags?: Record<string, string>) => 
  metrics.summary(name, value, tags);
export const timer = (name: string, tags?: Record<string, string>) => 
  metrics.timer(name, tags);

export default MetricsCollector;

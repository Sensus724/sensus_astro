/**
 * Sistema de monitoreo y logging para Sensus
 * Proporciona funcionalidades de monitoreo, logging y métricas
 */

export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  source?: string;
  stack?: string;
}

export interface MetricEntry {
  name: string;
  value: number;
  timestamp: string;
  tags?: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  channels: string[];
  cooldown: number; // minutes
  lastTriggered?: string;
}

export interface MonitoringConfig {
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsole: boolean;
    enableRemote: boolean;
    remoteUrl?: string;
    batchSize: number;
    flushInterval: number;
  };
  metrics: {
    enableMetrics: boolean;
    enableCustomMetrics: boolean;
    sampleRate: number;
    batchSize: number;
    flushInterval: number;
  };
  alerts: {
    enableAlerts: boolean;
    rules: AlertRule[];
    channels: {
      slack?: string;
      discord?: string;
      email?: string;
      webhook?: string;
    };
  };
  performance: {
    enablePerformanceMonitoring: boolean;
    enableCoreWebVitals: boolean;
    enableResourceTiming: boolean;
    enableUserTiming: boolean;
  };
  errors: {
    enableErrorTracking: boolean;
    enableCrashReporting: boolean;
    enableSourceMaps: boolean;
    sampleRate: number;
  };
}

export class MonitoringService {
  private config: MonitoringConfig;
  private logBuffer: LogEntry[] = [];
  private metricsBuffer: MetricEntry[] = [];
  private alertCooldowns: Map<string, number> = new Map();
  private performanceObserver?: PerformanceObserver;
  private errorHandler?: (error: ErrorEvent) => void;
  private unhandledRejectionHandler?: (event: PromiseRejectionEvent) => void;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.init();
  }

  private init(): void {
    // Inicializar logging
    if (this.config.logging.enableConsole) {
      this.setupConsoleLogging();
    }

    // Inicializar métricas
    if (this.config.metrics.enableMetrics) {
      this.setupMetrics();
    }

    // Inicializar monitoreo de rendimiento
    if (this.config.performance.enablePerformanceMonitoring) {
      this.setupPerformanceMonitoring();
    }

    // Inicializar tracking de errores
    if (this.config.errors.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Configurar flush automático
    this.setupAutoFlush();
  }

  private setupConsoleLogging(): void {
    const originalConsole = {
      error: console.error,
      warn: console.warn,
      info: console.info,
      debug: console.debug,
    };

    console.error = (...args) => {
      this.log('error', args.join(' '), { args });
      originalConsole.error(...args);
    };

    console.warn = (...args) => {
      this.log('warn', args.join(' '), { args });
      originalConsole.warn(...args);
    };

    console.info = (...args) => {
      this.log('info', args.join(' '), { args });
      originalConsole.info(...args);
    };

    console.debug = (...args) => {
      this.log('debug', args.join(' '), { args });
      originalConsole.debug(...args);
    };
  }

  private setupMetrics(): void {
    // Métricas básicas del sistema
    this.startSystemMetrics();

    // Métricas de la aplicación
    this.startApplicationMetrics();
  }

  private startSystemMetrics(): void {
    setInterval(() => {
      // Memoria
      if ('memory' in performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        this.recordMetric('memory.used', memory.usedJSHeapSize, 'gauge');
        this.recordMetric('memory.total', memory.totalJSHeapSize, 'gauge');
        this.recordMetric('memory.limit', memory.jsHeapSizeLimit, 'gauge');
      }

      // Timing
      this.recordMetric('timing.navigation', performance.timing.loadEventEnd - performance.timing.navigationStart, 'histogram');
      this.recordMetric('timing.dom', performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart, 'histogram');
      this.recordMetric('timing.load', performance.timing.loadEventEnd - performance.timing.navigationStart, 'histogram');
    }, 30000); // Cada 30 segundos
  }

  private startApplicationMetrics(): void {
    // Métricas de interacción del usuario
    document.addEventListener('click', () => {
      this.recordMetric('user.interaction.click', 1, 'counter');
    });

    document.addEventListener('scroll', () => {
      this.recordMetric('user.interaction.scroll', 1, 'counter');
    });

    // Métricas de navegación
    window.addEventListener('popstate', () => {
      this.recordMetric('user.navigation.popstate', 1, 'counter');
    });

    // Métricas de red
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        this.recordMetric('network.request.duration', duration, 'histogram', {
          method: args[1]?.method || 'GET',
          status: response.status.toString(),
        });
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.recordMetric('network.request.error', 1, 'counter', {
          method: args[1]?.method || 'GET',
        });
        this.recordMetric('network.request.duration', duration, 'histogram', {
          method: args[1]?.method || 'GET',
          status: 'error',
        });
        throw error;
      }
    };
  }

  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    // Core Web Vitals
    if (this.config.performance.enableCoreWebVitals) {
      this.observeCoreWebVitals();
    }

    // Resource Timing
    if (this.config.performance.enableResourceTiming) {
      this.observeResourceTiming();
    }

    // User Timing
    if (this.config.performance.enableUserTiming) {
      this.observeUserTiming();
    }
  }

  private observeCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('webvitals.lcp', lastEntry.startTime, 'histogram');
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as any;
        if (fidEntry.processingStart && fidEntry.startTime) {
          this.recordMetric('webvitals.fid', fidEntry.processingStart - fidEntry.startTime, 'histogram');
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput && clsEntry.value) {
          clsValue += clsEntry.value;
        }
      });
      this.recordMetric('webvitals.cls', clsValue, 'histogram');
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeResourceTiming(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('resource.timing', entry.duration, 'histogram', {
          type: (entry as any).initiatorType || 'unknown',
          name: entry.name,
        });
      });
    }).observe({ entryTypes: ['resource'] });
  }

  private observeUserTiming(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('user.timing', entry.duration, 'histogram', {
          name: entry.name,
        });
      });
    }).observe({ entryTypes: ['measure'] });
  }

  private setupErrorTracking(): void {
    // Errores de JavaScript
    this.errorHandler = (event: ErrorEvent) => {
      this.log('error', event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };
    window.addEventListener('error', this.errorHandler);

    // Promesas rechazadas
    this.unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      this.log('error', 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    };
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  private setupAutoFlush(): void {
    // Flush de logs
    setInterval(() => {
      this.flushLogs();
    }, this.config.logging.flushInterval);

    // Flush de métricas
    setInterval(() => {
      this.flushMetrics();
    }, this.config.metrics.flushInterval);
  }

  // Métodos públicos
  log(level: LogEntry['level'], message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
      source: 'client',
    };

    this.logBuffer.push(entry);

    // Verificar reglas de alerta
    this.checkAlertRules(entry);

    // Flush si el buffer está lleno
    if (this.logBuffer.length >= this.config.logging.batchSize) {
      this.flushLogs();
    }
  }

  recordMetric(name: string, value: number, type: MetricEntry['type'], tags?: Record<string, string>): void {
    if (Math.random() > this.config.metrics.sampleRate) return;

    const entry: MetricEntry = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags,
      type,
    };

    this.metricsBuffer.push(entry);

    // Flush si el buffer está lleno
    if (this.metricsBuffer.length >= this.config.metrics.batchSize) {
      this.flushMetrics();
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    if (this.config.logging.enableRemote && this.config.logging.remoteUrl) {
      try {
        await fetch(this.config.logging.remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs }),
        });
      } catch (error) {
        console.error('Failed to send logs:', error);
      }
    }
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    if (this.config.metrics.enableMetrics) {
      try {
        // Enviar métricas a un endpoint de monitoreo
        await fetch('/api/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metrics }),
        });
      } catch (error) {
        console.error('Failed to send metrics:', error);
      }
    }
  }

  private checkAlertRules(entry: LogEntry): void {
    if (!this.config.alerts.enableAlerts) return;

    this.config.alerts.rules.forEach((rule) => {
      if (!rule.enabled) return;

      // Verificar cooldown
      const lastTriggered = this.alertCooldowns.get(rule.id);
      if (lastTriggered && Date.now() - lastTriggered < rule.cooldown * 60 * 1000) {
        return;
      }

      // Verificar condición
      if (this.evaluateAlertCondition(rule, entry)) {
        this.triggerAlert(rule, entry);
        this.alertCooldowns.set(rule.id, Date.now());
      }
    });
  }

  private evaluateAlertCondition(rule: AlertRule, entry: LogEntry): boolean {
    // Implementar lógica de evaluación de condiciones
    // Por simplicidad, solo verificamos el nivel de log
    if (rule.condition.includes('level') && rule.condition.includes(entry.level)) {
      return true;
    }
    return false;
  }

  private async triggerAlert(rule: AlertRule, entry: LogEntry): Promise<void> {
    const alert = {
      rule,
      entry,
      timestamp: new Date().toISOString(),
    };

    // Enviar alerta a canales configurados
    if (rule.channels.includes('slack') && this.config.alerts.channels.slack) {
      await this.sendSlackAlert(alert);
    }

    if (rule.channels.includes('discord') && this.config.alerts.channels.discord) {
      await this.sendDiscordAlert(alert);
    }

    if (rule.channels.includes('email') && this.config.alerts.channels.email) {
      await this.sendEmailAlert(alert);
    }

    if (rule.channels.includes('webhook') && this.config.alerts.channels.webhook) {
      await this.sendWebhookAlert(alert);
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    try {
      await fetch(this.config.alerts.channels.slack!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 Alert: ${alert.rule.name}`,
          attachments: [
            {
              color: alert.rule.severity === 'critical' ? 'danger' : 'warning',
              fields: [
                { title: 'Rule', value: alert.rule.name, short: true },
                { title: 'Severity', value: alert.rule.severity, short: true },
                { title: 'Message', value: alert.entry.message, short: false },
                { title: 'Timestamp', value: alert.timestamp, short: true },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  private async sendDiscordAlert(alert: any): Promise<void> {
    try {
      await fetch(this.config.alerts.channels.discord!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `🚨 **Alert: ${alert.rule.name}**`,
          embeds: [
            {
              color: alert.rule.severity === 'critical' ? 0xff0000 : 0xffaa00,
              fields: [
                { name: 'Rule', value: alert.rule.name, inline: true },
                { name: 'Severity', value: alert.rule.severity, inline: true },
                { name: 'Message', value: alert.entry.message, inline: false },
                { name: 'Timestamp', value: alert.timestamp, inline: true },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
    }
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    // Implementar envío de email
    console.log('Email alert:', alert);
  }

  private async sendWebhookAlert(alert: any): Promise<void> {
    try {
      await fetch(this.config.alerts.channels.webhook!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  // Métodos de utilidad
  private getCurrentUserId(): string | undefined {
    // Implementar lógica para obtener el ID del usuario actual
    return undefined;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  private getRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos para métricas personalizadas
  incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'counter', tags);
  }

  setGauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'gauge', tags);
  }

  recordHistogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'histogram', tags);
  }

  recordSummary(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric(name, value, 'summary', tags);
  }

  // Métodos para timing
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordHistogram(name, duration);
    };
  }

  // Métodos para performance
  mark(name: string): void {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): void {
    performance.measure(name, startMark, endMark);
  }

  // Métodos para errores
  captureException(error: Error, context?: Record<string, any>): void {
    this.log('error', error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }

  // Métodos para limpieza
  destroy(): void {
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
    if (this.unhandledRejectionHandler) {
      window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
    }
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.flushLogs();
    this.flushMetrics();
  }
}

// Configuración por defecto
export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  logging: {
    level: 'info',
    enableConsole: true,
    enableRemote: true,
    remoteUrl: '/api/logs',
    batchSize: 10,
    flushInterval: 30000,
  },
  metrics: {
    enableMetrics: true,
    enableCustomMetrics: true,
    sampleRate: 1.0,
    batchSize: 20,
    flushInterval: 60000,
  },
  alerts: {
    enableAlerts: true,
    rules: [
      {
        id: 'error-rate',
        name: 'High Error Rate',
        description: 'Alert when error rate is high',
        condition: 'level:error',
        threshold: 5,
        severity: 'high',
        enabled: true,
        channels: ['slack'],
        cooldown: 15,
      },
    ],
    channels: {
      slack: process.env.SLACK_WEBHOOK_URL,
      discord: process.env.DISCORD_WEBHOOK_URL,
    },
  },
  performance: {
    enablePerformanceMonitoring: true,
    enableCoreWebVitals: true,
    enableResourceTiming: true,
    enableUserTiming: true,
  },
  errors: {
    enableErrorTracking: true,
    enableCrashReporting: true,
    enableSourceMaps: true,
    sampleRate: 1.0,
  },
};

// Instancia singleton
let monitoringInstance: MonitoringService | null = null;

export function getMonitoringService(config?: MonitoringConfig): MonitoringService {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringService(config || DEFAULT_MONITORING_CONFIG);
  }
  return monitoringInstance;
}

export default MonitoringService;

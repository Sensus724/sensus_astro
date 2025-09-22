/**
 * Sistema de logging avanzado para Sensus
 * Proporciona funcionalidades de logging estructurado y contextual
 */

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  level?: 'error' | 'warn' | 'info' | 'debug';
  timestamp?: string;
  source?: string;
  environment?: string;
  version?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context: LogContext;
  stack?: string;
  duration?: number;
  performance?: {
    memory?: number;
    cpu?: number;
    network?: number;
  };
}

export interface LogFilter {
  level?: 'error' | 'warn' | 'info' | 'debug';
  component?: string;
  userId?: string;
  sessionId?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}

export interface LogAggregation {
  level: string;
  count: number;
  percentage: number;
}

export interface LogStats {
  total: number;
  byLevel: LogAggregation[];
  byComponent: Record<string, number>;
  byUser: Record<string, number>;
  timeRange: {
    start: string;
    end: string;
  };
  averagePerMinute: number;
  peakPerMinute: number;
}

export class Logger {
  private static instance: Logger;
  private context: LogContext = {};
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;
  private flushInterval: number = 30000; // 30 segundos
  private flushTimer?: number;
  private remoteEndpoint?: string;
  private enableConsole: boolean = true;
  private enableRemote: boolean = false;
  private enablePerformance: boolean = true;
  private logLevel: 'error' | 'warn' | 'info' | 'debug' = 'info';
  private sessionId: string;
  private requestCounter: number = 0;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.setupAutoFlush();
    this.setupPerformanceMonitoring();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupPerformanceMonitoring(): void {
    if (!this.enablePerformance) return;

    // Monitorear memoria
    if (performance.memory) {
      setInterval(() => {
        const memoryUsage = performance.memory!.usedJSHeapSize;
        this.context.metadata = {
          ...this.context.metadata,
          memoryUsage,
          memoryTotal: performance.memory!.totalJSHeapSize,
          memoryLimit: performance.memory!.jsHeapSizeLimit,
        };
      }, 10000);
    }

    // Monitorear rendimiento de red
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const start = performance.now();
      const requestId = `req_${++this.requestCounter}`;
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - start;
        
        this.context.metadata = {
          ...this.context.metadata,
          lastNetworkRequest: {
            url: args[0],
            method: args[1]?.method || 'GET',
            status: response.status,
            duration,
            requestId,
          },
        };
        
        return response;
      } catch (error) {
        const duration = performance.now() - start;
        this.context.metadata = {
          ...this.context.metadata,
          lastNetworkRequest: {
            url: args[0],
            method: args[1]?.method || 'GET',
            status: 'error',
            duration,
            requestId,
            error: error.message,
          },
        };
        throw error;
      }
    };
  }

  // Métodos de configuración
  public configure(options: {
    remoteEndpoint?: string;
    enableConsole?: boolean;
    enableRemote?: boolean;
    enablePerformance?: boolean;
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    maxBufferSize?: number;
    flushInterval?: number;
  }): void {
    this.remoteEndpoint = options.remoteEndpoint;
    this.enableConsole = options.enableConsole ?? true;
    this.enableRemote = options.enableRemote ?? false;
    this.enablePerformance = options.enablePerformance ?? true;
    this.logLevel = options.logLevel ?? 'info';
    this.maxBufferSize = options.maxBufferSize ?? 1000;
    this.flushInterval = options.flushInterval ?? 30000;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.setupAutoFlush();
  }

  public setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  public addTag(tag: string): void {
    if (!this.context.tags) {
      this.context.tags = [];
    }
    if (!this.context.tags.includes(tag)) {
      this.context.tags.push(tag);
    }
  }

  public removeTag(tag: string): void {
    if (this.context.tags) {
      this.context.tags = this.context.tags.filter(t => t !== tag);
    }
  }

  // Métodos de logging
  public error(message: string, context?: Partial<LogContext>): void {
    this.log('error', message, context);
  }

  public warn(message: string, context?: Partial<LogContext>): void {
    this.log('warn', message, context);
  }

  public info(message: string, context?: Partial<LogContext>): void {
    this.log('info', message, context);
  }

  public debug(message: string, context?: Partial<LogContext>): void {
    this.log('debug', message, context);
  }

  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, context?: Partial<LogContext>): void {
    // Verificar nivel de log
    if (!this.shouldLog(level)) return;

    const logEntry: LogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.context,
        ...context,
        level,
        timestamp: new Date().toISOString(),
        source: 'client',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.VERSION || '1.0.0',
      },
    };

    // Agregar stack trace para errores
    if (level === 'error') {
      logEntry.stack = new Error().stack;
    }

    // Agregar información de rendimiento
    if (this.enablePerformance) {
      logEntry.performance = {
        memory: performance.memory?.usedJSHeapSize,
        cpu: this.getCPUUsage(),
        network: this.getNetworkLatency(),
      };
    }

    // Agregar al buffer
    this.logBuffer.push(logEntry);

    // Log a consola si está habilitado
    if (this.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Flush si el buffer está lleno
    if (this.logBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private shouldLog(level: 'error' | 'warn' | 'info' | 'debug'): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private logToConsole(logEntry: LogEntry): void {
    const { level, message, context, timestamp, stack } = logEntry;
    const timestampStr = new Date(timestamp).toLocaleTimeString();
    
    const logMessage = `[${timestampStr}] ${level.toUpperCase()}: ${message}`;
    const logData = {
      context,
      stack: stack ? stack.split('\n').slice(0, 5) : undefined,
    };

    switch (level) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      case 'debug':
        console.debug(logMessage, logData);
        break;
    }
  }

  // Métodos de utilidad
  public time(label: string): void {
    this.info(`Timer started: ${label}`, { action: 'timer_start', metadata: { label } });
  }

  public timeEnd(label: string): void {
    this.info(`Timer ended: ${label}`, { action: 'timer_end', metadata: { label } });
  }

  public group(label: string): void {
    this.info(`Group started: ${label}`, { action: 'group_start', metadata: { label } });
  }

  public groupEnd(label: string): void {
    this.info(`Group ended: ${label}`, { action: 'group_end', metadata: { label } });
  }

  public count(label: string): void {
    this.info(`Count: ${label}`, { action: 'count', metadata: { label } });
  }

  public trace(message: string, context?: Partial<LogContext>): void {
    this.debug(message, { ...context, action: 'trace', stack: new Error().stack });
  }

  public assert(condition: boolean, message: string, context?: Partial<LogContext>): void {
    if (!condition) {
      this.error(`Assertion failed: ${message}`, context);
    }
  }

  // Métodos de gestión de logs
  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    if (this.enableRemote && this.remoteEndpoint) {
      try {
        await fetch(this.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs }),
        });
      } catch (error) {
        console.error('Failed to send logs to remote endpoint:', error);
      }
    }
  }

  public getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logBuffer];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      if (filter.component) {
        filteredLogs = filteredLogs.filter(log => log.context.component === filter.component);
      }
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.context.userId === filter.userId);
      }
      if (filter.sessionId) {
        filteredLogs = filteredLogs.filter(log => log.context.sessionId === filter.sessionId);
      }
      if (filter.tags && filter.tags.length > 0) {
        filteredLogs = filteredLogs.filter(log => 
          log.context.tags && filter.tags!.some(tag => log.context.tags!.includes(tag))
        );
      }
      if (filter.startTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endTime!);
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(0, filter.limit);
      }
      if (filter.offset) {
        filteredLogs = filteredLogs.slice(filter.offset);
      }
    }

    return filteredLogs;
  }

  public getStats(): LogStats {
    const logs = this.logBuffer;
    const total = logs.length;
    
    // Estadísticas por nivel
    const levelCounts = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byLevel: LogAggregation[] = Object.entries(levelCounts).map(([level, count]) => ({
      level,
      count,
      percentage: (count / total) * 100,
    }));

    // Estadísticas por componente
    const byComponent = logs.reduce((acc, log) => {
      const component = log.context.component || 'unknown';
      acc[component] = (acc[component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estadísticas por usuario
    const byUser = logs.reduce((acc, log) => {
      const userId = log.context.userId || 'anonymous';
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Rango de tiempo
    const timestamps = logs.map(log => new Date(log.timestamp).getTime());
    const timeRange = {
      start: timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : new Date().toISOString(),
      end: timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : new Date().toISOString(),
    };

    // Promedio por minuto
    const timeSpan = new Date(timeRange.end).getTime() - new Date(timeRange.start).getTime();
    const averagePerMinute = timeSpan > 0 ? (total / (timeSpan / 60000)) : 0;

    return {
      total,
      byLevel,
      byComponent,
      byUser,
      timeRange,
      averagePerMinute,
      peakPerMinute: Math.max(...byLevel.map(l => l.count)),
    };
  }

  public clear(): void {
    this.logBuffer = [];
  }

  public export(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }

  public import(logs: string): void {
    try {
      const importedLogs = JSON.parse(logs);
      if (Array.isArray(importedLogs)) {
        this.logBuffer.push(...importedLogs);
      }
    } catch (error) {
      this.error('Failed to import logs', { metadata: { error: error.message } });
    }
  }

  // Métodos de rendimiento
  private getCPUUsage(): number {
    // Simular uso de CPU (en un entorno real, esto requeriría APIs específicas)
    return Math.random() * 100;
  }

  private getNetworkLatency(): number {
    // Simular latencia de red
    return Math.random() * 100;
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
export const logger = Logger.getInstance();

// Funciones de conveniencia
export const logError = (message: string, context?: Partial<LogContext>) => logger.error(message, context);
export const logWarn = (message: string, context?: Partial<LogContext>) => logger.warn(message, context);
export const logInfo = (message: string, context?: Partial<LogContext>) => logger.info(message, context);
export const logDebug = (message: string, context?: Partial<LogContext>) => logger.debug(message, context);

// Decorador para logging automático
export function LogMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const methodName = `${target.constructor.name}.${propertyName}`;
    
    logger.info(`Method called: ${methodName}`, {
      component: target.constructor.name,
      action: 'method_call',
      metadata: { methodName, args: args.length },
    });

    try {
      const result = method.apply(this, args);
      const duration = performance.now() - start;
      
      logger.info(`Method completed: ${methodName}`, {
        component: target.constructor.name,
        action: 'method_complete',
        metadata: { methodName, duration },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      logger.error(`Method failed: ${methodName}`, {
        component: target.constructor.name,
        action: 'method_error',
        metadata: { methodName, duration, error: error.message },
      });

      throw error;
    }
  };

  return descriptor;
}

export default Logger;

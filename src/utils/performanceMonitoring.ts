/**
 * Sistema de monitoreo de rendimiento para Sensus
 * Monitoreo completo de métricas, alertas y análisis de rendimiento
 */

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: {
    // Core Web Vitals
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    
    // Custom metrics
    pageLoadTime: number;
    domContentLoaded: number;
    resourceLoadTime: number;
    memoryUsage: number;
    
    // User experience
    interactionTime: number;
    scrollPerformance: number;
    animationFrameRate: number;
  };
  environment: {
    connection: string;
    deviceMemory: number;
    hardwareConcurrency: number;
    platform: string;
  };
  errors: Array<{
    message: string;
    stack: string;
    timestamp: number;
    url: string;
  }>;
}

export interface MonitoringConfig {
  enableRealTimeMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserBehaviorTracking: boolean;
  enableResourceMonitoring: boolean;
  enableMemoryMonitoring: boolean;
  reportingEndpoint?: string;
  sampleRate: number;
  alertThresholds: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
    memoryUsage: number;
  };
}

class PerformanceMonitor {
  private config: MonitoringConfig;
  private metrics: Map<string, number> = new Map();
  private alerts: PerformanceAlert[] = [];
  private reports: PerformanceReport[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;
  private sessionId: string;
  private startTime: number;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      enableErrorTracking: true,
      enableUserBehaviorTracking: true,
      enableResourceMonitoring: true,
      enableMemoryMonitoring: true,
      sampleRate: 1.0,
      alertThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        ttfb: 800,
        memoryUsage: 0.8,
      },
      ...config,
    };

    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Verificar soporte de Performance API
    if (!('performance' in window)) {
      console.warn('Performance API not supported');
      return;
    }

    // Inicializar monitoreo
    if (this.config.enableRealTimeMonitoring) {
      this.startRealTimeMonitoring();
    }

    // Configurar tracking de errores
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Configurar tracking de comportamiento
    if (this.config.enableUserBehaviorTracking) {
      this.setupUserBehaviorTracking();
    }

    // Configurar monitoreo de recursos
    if (this.config.enableResourceMonitoring) {
      this.setupResourceMonitoring();
    }

    // Configurar monitoreo de memoria
    if (this.config.enableMemoryMonitoring) {
      this.setupMemoryMonitoring();
    }

    // Configurar reportes automáticos
    this.setupAutomaticReporting();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startRealTimeMonitoring() {
    this.isMonitoring = true;

    // Monitorear Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitorear métricas personalizadas
    this.monitorCustomMetrics();
    
    // Monitorear rendimiento de animaciones
    this.monitorAnimationPerformance();
    
    // Monitorear rendimiento de scroll
    this.monitorScrollPerformance();
  }

  private monitorCoreWebVitals() {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('lcp', lastEntry.startTime);
        this.checkAlert('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // FID - First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fid = entry.processingStart - entry.startTime;
          this.recordMetric('fid', fid);
          this.checkAlert('fid', fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }

    // CLS - Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('cls', clsValue);
        this.checkAlert('cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // FCP - First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('fcp', entry.startTime);
          this.checkAlert('fcp', entry.startTime);
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }
  }

  private monitorCustomMetrics() {
    // Tiempo de carga de la página
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      this.recordMetric('pageLoadTime', navigation.loadEventEnd - navigation.fetchStart);
      this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
      this.recordMetric('ttfb', navigation.responseStart - navigation.fetchStart);
    });

    // Tiempo de interacción
    let firstInteraction = false;
    const interactionStart = Date.now();
    
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        if (!firstInteraction) {
          const interactionTime = Date.now() - interactionStart;
          this.recordMetric('interactionTime', interactionTime);
          firstInteraction = true;
        }
      }, { once: true });
    });
  }

  private monitorAnimationPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        this.recordMetric('animationFrameRate', fps);
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  private monitorScrollPerformance() {
    let scrollStart = 0;
    let scrollEnd = 0;
    
    window.addEventListener('scroll', () => {
      scrollStart = performance.now();
    });
    
    window.addEventListener('scrollend', () => {
      scrollEnd = performance.now();
      const scrollTime = scrollEnd - scrollStart;
      this.recordMetric('scrollPerformance', scrollTime);
    });
  }

  private setupErrorTracking() {
    // Errores de JavaScript
    window.addEventListener('error', (event) => {
      this.recordError({
        message: event.message,
        stack: event.error?.stack || '',
        timestamp: Date.now(),
        url: event.filename,
      });
    });

    // Promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack || '',
        timestamp: Date.now(),
        url: window.location.href,
      });
    });
  }

  private setupUserBehaviorTracking() {
    // Tracking de clics
    document.addEventListener('click', (event) => {
      this.recordUserAction('click', {
        element: event.target.tagName,
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });
    });

    // Tracking de scroll
    let scrollTimeout: number;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordUserAction('scroll', {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
          timestamp: Date.now(),
        });
      }, 100);
    });

    // Tracking de tiempo en página
    let pageStartTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - pageStartTime;
      this.recordUserAction('pageExit', {
        timeOnPage,
        timestamp: Date.now(),
      });
    });
  }

  private setupResourceMonitoring() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Monitorear recursos lentos
          if (entry.duration > 1000) {
            this.recordResourceIssue(entry);
          }
          
          // Monitorear recursos fallidos
          if (entry.transferSize === 0 && entry.decodedBodySize > 0) {
            this.recordResourceIssue(entry, 'cached');
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      const monitorMemory = () => {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        
        this.recordMetric('memoryUsage', memoryUsage);
        this.checkAlert('memoryUsage', memoryUsage);
        
        // Monitorear cada 30 segundos
        setTimeout(monitorMemory, 30000);
      };
      
      monitorMemory();
    }
  }

  private setupAutomaticReporting() {
    // Reporte automático cada 5 minutos
    setInterval(() => {
      this.generateReport();
    }, 5 * 60 * 1000);

    // Reporte al cerrar la página
    window.addEventListener('beforeunload', () => {
      this.generateReport();
    });
  }

  private recordMetric(name: string, value: number) {
    this.metrics.set(name, value);
    
    // Dispatch evento de métrica
    window.dispatchEvent(new CustomEvent('performance:metric', {
      detail: { name, value, timestamp: Date.now() }
    }));
  }

  private recordError(error: { message: string; stack: string; timestamp: number; url: string }) {
    // Dispatch evento de error
    window.dispatchEvent(new CustomEvent('performance:error', {
      detail: error
    }));
  }

  private recordUserAction(action: string, data: any) {
    // Dispatch evento de acción del usuario
    window.dispatchEvent(new CustomEvent('performance:userAction', {
      detail: { action, data, timestamp: Date.now() }
    }));
  }

  private recordResourceIssue(entry: PerformanceResourceTiming, type: string = 'slow') {
    // Dispatch evento de problema de recurso
    window.dispatchEvent(new CustomEvent('performance:resourceIssue', {
      detail: { entry, type, timestamp: Date.now() }
    }));
  }

  private checkAlert(metric: string, value: number) {
    const threshold = this.config.alertThresholds[metric as keyof typeof this.config.alertThresholds];
    
    if (value > threshold) {
      const alert: PerformanceAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: this.getAlertType(metric, value, threshold),
        metric,
        value,
        threshold,
        message: this.getAlertMessage(metric, value, threshold),
        timestamp: Date.now(),
        resolved: false,
      };
      
      this.alerts.push(alert);
      
      // Dispatch evento de alerta
      window.dispatchEvent(new CustomEvent('performance:alert', {
        detail: alert
      }));
    }
  }

  private getAlertType(metric: string, value: number, threshold: number): 'warning' | 'error' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'error';
    return 'warning';
  }

  private getAlertMessage(metric: string, value: number, threshold: number): string {
    const messages = {
      lcp: `Largest Contentful Paint excedió el umbral: ${value.toFixed(0)}ms > ${threshold}ms`,
      fid: `First Input Delay excedió el umbral: ${value.toFixed(0)}ms > ${threshold}ms`,
      cls: `Cumulative Layout Shift excedió el umbral: ${value.toFixed(3)} > ${threshold}`,
      fcp: `First Contentful Paint excedió el umbral: ${value.toFixed(0)}ms > ${threshold}ms`,
      ttfb: `Time to First Byte excedió el umbral: ${value.toFixed(0)}ms > ${threshold}ms`,
      memoryUsage: `Uso de memoria excedió el umbral: ${(value * 100).toFixed(1)}% > ${(threshold * 100).toFixed(1)}%`,
    };
    
    return messages[metric as keyof typeof messages] || `Métrica ${metric} excedió el umbral`;
  }

  private generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: {
        lcp: this.metrics.get('lcp') || 0,
        fid: this.metrics.get('fid') || 0,
        cls: this.metrics.get('cls') || 0,
        fcp: this.metrics.get('fcp') || 0,
        ttfb: this.metrics.get('ttfb') || 0,
        pageLoadTime: this.metrics.get('pageLoadTime') || 0,
        domContentLoaded: this.metrics.get('domContentLoaded') || 0,
        resourceLoadTime: this.metrics.get('resourceLoadTime') || 0,
        memoryUsage: this.metrics.get('memoryUsage') || 0,
        interactionTime: this.metrics.get('interactionTime') || 0,
        scrollPerformance: this.metrics.get('scrollPerformance') || 0,
        animationFrameRate: this.metrics.get('animationFrameRate') || 0,
      },
      environment: {
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        deviceMemory: (navigator as any).deviceMemory || 0,
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        platform: navigator.platform,
      },
      errors: [], // Se llenaría con errores registrados
    };
    
    this.reports.push(report);
    
    // Enviar reporte si está configurado
    if (this.config.reportingEndpoint) {
      this.sendReport(report);
    }
    
    return report;
  }

  private async sendReport(report: PerformanceReport) {
    try {
      await fetch(this.config.reportingEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Error sending performance report:', error);
    }
  }

  // Métodos públicos
  public getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  public getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getSessionDuration(): number {
    return Date.now() - this.startTime;
  }

  public getPerformanceScore(): number {
    const metrics = this.metrics;
    let score = 100;

    // Penalizar por métricas pobres
    if (metrics.get('lcp') && metrics.get('lcp')! > this.config.alertThresholds.lcp) {
      score -= 20;
    }
    if (metrics.get('fid') && metrics.get('fid')! > this.config.alertThresholds.fid) {
      score -= 20;
    }
    if (metrics.get('cls') && metrics.get('cls')! > this.config.alertThresholds.cls) {
      score -= 20;
    }
    if (metrics.get('fcp') && metrics.get('fcp')! > this.config.alertThresholds.fcp) {
      score -= 20;
    }
    if (metrics.get('ttfb') && metrics.get('ttfb')! > this.config.alertThresholds.ttfb) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  public resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public clearReports(): void {
    this.reports = [];
  }

  public stopMonitoring(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }

  public destroy(): void {
    this.stopMonitoring();
  }
}

// Instancia singleton
let performanceMonitorInstance: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

// Funciones de conveniencia
export const getPerformanceMetrics = () => getPerformanceMonitor().getMetrics();
export const getPerformanceAlerts = () => getPerformanceMonitor().getAlerts();
export const getPerformanceReports = () => getPerformanceMonitor().getReports();
export const getPerformanceScore = () => getPerformanceMonitor().getPerformanceScore();
export const resolvePerformanceAlert = (alertId: string) => 
  getPerformanceMonitor().resolveAlert(alertId);

export default PerformanceMonitor;

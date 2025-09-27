/**
 * Utilidades de rendimiento para Sensus
 * Sistema completo de optimización y monitoreo de rendimiento
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Custom metrics
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  memoryUsage: number;
  
  // User experience
  interactionTime: number;
  scrollPerformance: number;
  animationFrameRate: number;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableReporting: boolean;
  enableOptimization: boolean;
  sampleRate: number;
  reportingEndpoint?: string;
  thresholds: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
}

class PerformanceManager {
  private config: PerformanceConfig;
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableMonitoring: true,
      enableReporting: true,
      enableOptimization: true,
      sampleRate: 1.0,
      thresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        ttfb: 800,
      },
      ...config,
    };

    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Verificar soporte de Performance API
    if (!('performance' in window)) {
      console.warn('Performance API not supported');
      return;
    }

    // Inicializar optimizaciones
    if (this.config.enableOptimization) {
      this.setupOptimizations();
    }

    // Inicializar monitoreo
    if (this.config.enableMonitoring) {
      this.startMonitoring();
    }
  }

  private setupOptimizations() {
    // Optimización de imágenes
    this.optimizeImages();
    
    // Optimización de recursos críticos
    this.optimizeCriticalResources();
    
    // Optimización de JavaScript
    this.optimizeJavaScript();
    
    // Optimización de CSS
    this.optimizeCSS();
    
    // Optimización de fuentes
    this.optimizeFonts();
  }

  private optimizeImages() {
    // Lazy loading para imágenes
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      // Observar todas las imágenes con data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }

    // Optimización de imágenes responsive
    this.setupResponsiveImages();
  }

  private setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-srcset]');
    
    images.forEach(img => {
      const srcset = img.getAttribute('data-srcset');
      if (srcset) {
        img.setAttribute('srcset', srcset);
        img.removeAttribute('data-srcset');
      }
    });
  }

  private optimizeCriticalResources() {
    // Preload de recursos críticos
    this.preloadCriticalResources();
    
    // Prefetch de recursos no críticos
    this.prefetchNonCriticalResources();
    
    // Optimización de conexiones
    this.optimizeConnections();
  }

  private preloadCriticalResources() {
    const criticalResources = [
      '/src/styles/main.css',
      '/src/js/core/core.js',
      '/src/js/modules/auth.js',
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  private prefetchNonCriticalResources() {
    const nonCriticalResources = [
      '/src/js/pages/diary-wellness.js',
      '/src/js/pages/evaluacion.js',
      '/src/js/pages/homepage.js',
    ];

    // Prefetch después de que la página esté cargada
    window.addEventListener('load', () => {
      setTimeout(() => {
        nonCriticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = resource;
          document.head.appendChild(link);
        });
      }, 2000);
    });
  }

  private optimizeConnections() {
    // DNS prefetch para dominios externos
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdnjs.cloudflare.com',
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  private optimizeJavaScript() {
    // Code splitting
    this.setupCodeSplitting();
    
    // Tree shaking
    this.setupTreeShaking();
    
    // Minificación
    this.setupMinification();
  }

  private setupCodeSplitting() {
    // Lazy loading de módulos
    const lazyModules = {
      'dashboard': () => import('../pages/index.astro'),
      'diary': () => import('../pages/diario.astro'),
      'evaluation': () => import('../pages/evaluacion.astro'),
    };

    // Cargar módulos cuando sean necesarios
    Object.entries(lazyModules).forEach(([name, loader]) => {
      const elements = document.querySelectorAll(`[data-lazy-module="${name}"]`);
      elements.forEach(element => {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              loader().then(module => {
                // Inicializar módulo
                if (module.default) {
                  module.default(element);
                }
              });
              observer.unobserve(element);
            }
          });
        });
        observer.observe(element);
      });
    });
  }

  private setupTreeShaking() {
    // Eliminar código no utilizado
    // Esto se hace principalmente en el build process
    console.log('Tree shaking optimization enabled');
  }

  private setupMinification() {
    // Minificación de JavaScript
    // Esto se hace en el build process
    console.log('Minification optimization enabled');
  }

  private optimizeCSS() {
    // Critical CSS inlining
    this.inlineCriticalCSS();
    
    // CSS minification
    this.setupCSSMinification();
    
    // CSS purging
    this.setupCSSPurging();
  }

  private inlineCriticalCSS() {
    // Inline critical CSS
    const criticalCSS = `
      body { margin: 0; font-family: Inter, sans-serif; }
      .loading-heart { display: flex; justify-content: center; align-items: center; height: 100vh; }
      .header { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    `;

    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }

  private setupCSSMinification() {
    // CSS minification se hace en el build process
    console.log('CSS minification enabled');
  }

  private setupCSSPurging() {
    // CSS purging se hace en el build process
    console.log('CSS purging enabled');
  }

  private optimizeFonts() {
    // Font display optimization
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      link.setAttribute('media', 'print');
      link.setAttribute('onload', 'this.media="all"');
    });

    // Font preloading
    this.preloadFonts();
  }

  private preloadFonts() {
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    ];

    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'style';
      document.head.appendChild(link);
    });
  }

  private startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitorear Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitorear métricas personalizadas
    this.monitorCustomMetrics();
    
    // Monitorear recursos
    this.monitorResources();
    
    // Monitorear memoria
    this.monitorMemory();
  }

  private monitorCoreWebVitals() {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.checkThreshold('lcp', this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // FID - First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as any;
          if (fidEntry.processingStart && fidEntry.startTime) {
            this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
          }
          this.checkThreshold('fid', this.metrics.fid);
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
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            clsValue += clsEntry.value;
          }
        });
        this.metrics.cls = clsValue;
        this.checkThreshold('cls', this.metrics.cls);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // FCP - First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.metrics.fcp = entry.startTime;
          this.checkThreshold('fcp', this.metrics.fcp);
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
      this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
      this.metrics.ttfb = navigation.responseStart - navigation.fetchStart;
    });

    // Tiempo de interacción
    let firstInteraction = false;
    const interactionStart = Date.now();
    
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        if (!firstInteraction) {
          this.metrics.interactionTime = Date.now() - interactionStart;
          firstInteraction = true;
        }
      }, { once: true });
    });
  }

  private monitorResources() {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Monitorear recursos lentos
          if (entry.duration > 1000) {
            console.warn('Slow resource:', entry.name, entry.duration);
          }
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    }
  }

  private monitorMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  }

  private checkThreshold(metric: string, value: number) {
    const threshold = this.config.thresholds[metric as keyof typeof this.config.thresholds];
    if (value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric}:`, value, '>', threshold);
      
      // Reportar métrica problemática
      if (this.config.enableReporting) {
        this.reportMetric(metric, value, threshold);
      }
    }
  }

  private reportMetric(metric: string, value: number, threshold: number) {
    const report = {
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Enviar reporte
    if (this.config.reportingEndpoint) {
      fetch(this.config.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      }).catch(error => {
        console.error('Error reporting performance metric:', error);
      });
    }
  }

  // Métodos públicos
  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public getScore(): number {
    const metrics = this.metrics;
    let score = 100;

    // Penalizar por métricas pobres
    if (metrics.lcp && metrics.lcp > this.config.thresholds.lcp) {
      score -= 20;
    }
    if (metrics.fid && metrics.fid > this.config.thresholds.fid) {
      score -= 20;
    }
    if (metrics.cls && metrics.cls > this.config.thresholds.cls) {
      score -= 20;
    }
    if (metrics.fcp && metrics.fcp > this.config.thresholds.fcp) {
      score -= 20;
    }
    if (metrics.ttfb && metrics.ttfb > this.config.thresholds.ttfb) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  public optimizeImage(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}): string {
    // Optimización de imágenes (implementar según el servicio de imágenes)
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // Ejemplo de optimización con un servicio de imágenes
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());
    params.set('f', format);

    return `${src}?${params.toString()}`;
  }

  public preloadRoute(route: string) {
    // Preload de rutas
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  }

  public stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }

  public destroy() {
    this.stopMonitoring();
  }
}

// Instancia singleton
let performanceManagerInstance: PerformanceManager | null = null;

export function getPerformanceManager(): PerformanceManager {
  if (!performanceManagerInstance) {
    performanceManagerInstance = new PerformanceManager();
  }
  return performanceManagerInstance;
}

// Funciones de conveniencia
export const getPerformanceMetrics = () => getPerformanceManager().getMetrics();
export const getPerformanceScore = () => getPerformanceManager().getScore();
export const optimizeImage = (src: string, options?: any) => 
  getPerformanceManager().optimizeImage(src, options);
export const preloadRoute = (route: string) => 
  getPerformanceManager().preloadRoute(route);

export default PerformanceManager;

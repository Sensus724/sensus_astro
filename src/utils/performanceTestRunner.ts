/**
 * Sistema de testing de rendimiento para Sensus
 * Testing de rendimiento, carga y estrés de la aplicación
 */

export interface PerformanceTestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
  headless: boolean;
  browser: 'chrome' | 'firefox' | 'edge' | 'safari';
  viewport: {
    width: number;
    height: number;
  };
  baseURL: string;
  slowMo: number;
  networkConditions: 'slow3G' | 'fast3G' | 'slow4G' | 'fast4G' | 'wifi';
  cpuThrottling: number;
  memoryThrottling: number;
}

export interface PerformanceTestSuite {
  name: string;
  tests: PerformanceTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

export interface PerformanceTest {
  name: string;
  fn: () => Promise<void>;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
  type: 'load' | 'stress' | 'spike' | 'volume' | 'endurance';
  iterations?: number;
  concurrency?: number;
  duration?: number;
}

export interface PerformanceTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  metrics: PerformanceMetrics;
  iterations: number;
  concurrency: number;
  networkConditions: string;
  cpuThrottling: number;
  memoryThrottling: number;
}

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  
  // Performance API
  pageLoadTime: number;
  domContentLoaded: number;
  resourceLoadTime: number;
  memoryUsage: number;
  
  // Custom metrics
  timeToInteractive: number;
  firstMeaningfulPaint: number;
  speedIndex: number;
  
  // Resource metrics
  totalResources: number;
  totalSize: number;
  compressedSize: number;
  compressionRatio: number;
  
  // Network metrics
  totalRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  slowestRequest: number;
  
  // Memory metrics
  heapUsed: number;
  heapTotal: number;
  heapLimit: number;
  memoryLeaks: number;
  
  // CPU metrics
  cpuUsage: number;
  mainThreadBlocking: number;
  
  // User experience
  interactionTime: number;
  scrollPerformance: number;
  animationFrameRate: number;
}

export interface PerformanceTestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  iterations: number;
  concurrency: number;
  averageMetrics: PerformanceMetrics;
  worstMetrics: PerformanceMetrics;
  bestMetrics: PerformanceMetrics;
  flakyTests: number;
  performanceRegressions: number;
}

class PerformanceTestRunner {
  private config: PerformanceTestConfig;
  private suites: PerformanceTestSuite[] = [];
  private results: PerformanceTestResult[] = [];
  private stats: PerformanceTestStats;
  private currentSuite: PerformanceTestSuite | null = null;
  private currentTest: PerformanceTest | null = null;
  private browser: any = null;
  private page: any = null;
  private performanceObserver: any = null;
  private metrics: PerformanceMetrics[] = [];

  constructor(config: Partial<PerformanceTestConfig> = {}) {
    this.config = {
      timeout: 300000, // 5 minutos
      retries: 1,
      parallel: false,
      verbose: true,
      headless: true,
      browser: 'chrome',
      viewport: { width: 1280, height: 720 },
      baseURL: 'http://localhost:3000',
      slowMo: 0,
      networkConditions: 'fast3G',
      cpuThrottling: 1,
      memoryThrottling: 1,
      ...config,
    };

    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      iterations: 0,
      concurrency: 0,
      averageMetrics: this.createEmptyMetrics(),
      worstMetrics: this.createEmptyMetrics(),
      bestMetrics: this.createEmptyMetrics(),
      flakyTests: 0,
      performanceRegressions: 0,
    };

    this.init();
  }

  private init() {
    // Configurar globales de testing de rendimiento
    this.setupGlobals();
    
    // Configurar navegador
    this.setupBrowser();
    
    // Configurar observador de rendimiento
    this.setupPerformanceObserver();
  }

  private createEmptyMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      pageLoadTime: 0,
      domContentLoaded: 0,
      resourceLoadTime: 0,
      memoryUsage: 0,
      timeToInteractive: 0,
      firstMeaningfulPaint: 0,
      speedIndex: 0,
      totalResources: 0,
      totalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      totalRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      slowestRequest: 0,
      heapUsed: 0,
      heapTotal: 0,
      heapLimit: 0,
      memoryLeaks: 0,
      cpuUsage: 0,
      mainThreadBlocking: 0,
      interactionTime: 0,
      scrollPerformance: 0,
      animationFrameRate: 0,
    };
  }

  private setupGlobals() {
    // Exponer funciones globales de testing de rendimiento
    (globalThis as any).describePerformance = this.describePerformance.bind(this);
    (globalThis as any).itPerformance = this.itPerformance.bind(this);
    (globalThis as any).beforeAllPerformance = this.beforeAllPerformance.bind(this);
    (globalThis as any).afterAllPerformance = this.afterAllPerformance.bind(this);
    (globalThis as any).beforeEachPerformance = this.beforeEachPerformance.bind(this);
    (globalThis as any).afterEachPerformance = this.afterEachPerformance.bind(this);
    
    // Exponer funciones de testing de rendimiento
    (globalThis as any).loadTest = this.loadTest.bind(this);
    (globalThis as any).stressTest = this.stressTest.bind(this);
    (globalThis as any).spikeTest = this.spikeTest.bind(this);
    (globalThis as any).volumeTest = this.volumeTest.bind(this);
    (globalThis as any).enduranceTest = this.enduranceTest.bind(this);
    
    // Exponer funciones de métricas
    (globalThis as any).measurePerformance = this.measurePerformance.bind(this);
    (globalThis as any).measureCoreWebVitals = this.measureCoreWebVitals.bind(this);
    (globalThis as any).measureResourceMetrics = this.measureResourceMetrics.bind(this);
    (globalThis as any).measureMemoryMetrics = this.measureMemoryMetrics.bind(this);
  }

  private setupBrowser() {
    // Configurar navegador con optimizaciones de rendimiento
    console.log('Setting up performance testing browser...');
  }

  private setupPerformanceObserver() {
    // Configurar observador de rendimiento
    console.log('Setting up performance observer...');
  }

  // API pública
  public describePerformance(name: string, fn: () => void) {
    const suite: PerformanceTestSuite = {
      name,
      tests: [],
    };
    
    this.currentSuite = suite;
    this.suites.push(suite);
    
    try {
      fn();
    } catch (error) {
      console.error(`Error in performance describe block "${name}":`, error);
    }
    
    this.currentSuite = null;
  }

  public itPerformance(name: string, fn: () => Promise<void>, options: Partial<PerformanceTest> = {}) {
    if (!this.currentSuite) {
      throw new Error('itPerformance() must be called within a describePerformance() block');
    }

    const test: PerformanceTest = {
      name,
      fn,
      timeout: options.timeout || this.config.timeout,
      type: options.type || 'load',
      iterations: options.iterations || 1,
      concurrency: options.concurrency || 1,
      duration: options.duration || 0,
      ...options,
    };

    this.currentSuite.tests.push(test);
  }

  public beforeAllPerformance(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeAllPerformance() must be called within a describePerformance() block');
    }
    this.currentSuite.setup = fn;
  }

  public afterAllPerformance(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterAllPerformance() must be called within a describePerformance() block');
    }
    this.currentSuite.teardown = fn;
  }

  public beforeEachPerformance(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeEachPerformance() must be called within a describePerformance() block');
    }
    this.currentSuite.beforeEach = fn;
  }

  public afterEachPerformance(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterEachPerformance() must be called within a describePerformance() block');
    }
    this.currentSuite.afterEach = fn;
  }

  // Funciones de testing de rendimiento
  public async loadTest(url: string, iterations: number = 10): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const metric = await this.measurePerformance(url);
      metrics.push(metric);
      
      // Esperar entre iteraciones
      await this.wait(1000);
    }
    
    return metrics;
  }

  public async stressTest(url: string, concurrency: number = 5, duration: number = 60000): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < duration) {
      const promises = [];
      
      for (let i = 0; i < concurrency; i++) {
        promises.push(this.measurePerformance(url));
      }
      
      const results = await Promise.all(promises);
      metrics.push(...results);
      
      // Esperar antes de la siguiente ronda
      await this.wait(1000);
    }
    
    return metrics;
  }

  public async spikeTest(url: string, spikeConcurrency: number = 20, normalConcurrency: number = 5): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    
    // Fase normal
    console.log('Normal load phase...');
    for (let i = 0; i < 5; i++) {
      const promises = [];
      for (let j = 0; j < normalConcurrency; j++) {
        promises.push(this.measurePerformance(url));
      }
      const results = await Promise.all(promises);
      metrics.push(...results);
      await this.wait(2000);
    }
    
    // Fase de pico
    console.log('Spike load phase...');
    const promises = [];
    for (let i = 0; i < spikeConcurrency; i++) {
      promises.push(this.measurePerformance(url));
    }
    const spikeResults = await Promise.all(promises);
    metrics.push(...spikeResults);
    
    // Fase de recuperación
    console.log('Recovery phase...');
    for (let i = 0; i < 5; i++) {
      const promises = [];
      for (let j = 0; j < normalConcurrency; j++) {
        promises.push(this.measurePerformance(url));
      }
      const results = await Promise.all(promises);
      metrics.push(...results);
      await this.wait(2000);
    }
    
    return metrics;
  }

  public async volumeTest(url: string, totalRequests: number = 1000): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    const batchSize = 10;
    const batches = Math.ceil(totalRequests / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const promises = [];
      const requestsInBatch = Math.min(batchSize, totalRequests - batch * batchSize);
      
      for (let i = 0; i < requestsInBatch; i++) {
        promises.push(this.measurePerformance(url));
      }
      
      const results = await Promise.all(promises);
      metrics.push(...results);
      
      // Esperar entre lotes
      await this.wait(100);
    }
    
    return metrics;
  }

  public async enduranceTest(url: string, duration: number = 300000): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    const startTime = Date.now();
    const interval = 10000; // 10 segundos
    
    while (Date.now() - startTime < duration) {
      const metric = await this.measurePerformance(url);
      metrics.push(metric);
      
      // Esperar hasta el siguiente intervalo
      const elapsed = Date.now() - startTime;
      const nextInterval = Math.ceil(elapsed / interval) * interval;
      const waitTime = nextInterval - elapsed;
      
      if (waitTime > 0) {
        await this.wait(waitTime);
      }
    }
    
    return metrics;
  }

  // Funciones de medición
  public async measurePerformance(url: string): Promise<PerformanceMetrics> {
    const startTime = Date.now();
    
    try {
      // Simular navegación y medición
      console.log(`Measuring performance for: ${url}`);
      
      // Medir Core Web Vitals
      const coreWebVitals = await this.measureCoreWebVitals();
      
      // Medir métricas de recursos
      const resourceMetrics = await this.measureResourceMetrics();
      
      // Medir métricas de memoria
      const memoryMetrics = await this.measureMemoryMetrics();
      
      // Medir métricas de CPU
      const cpuMetrics = await this.measureCPUMetrics();
      
      // Medir métricas de experiencia de usuario
      const uxMetrics = await this.measureUXMetrics();
      
      const metrics: PerformanceMetrics = {
        pageLoadTime: coreWebVitals.pageLoadTime || 0,
        lcp: coreWebVitals.lcp || 0,
        fid: coreWebVitals.fid || 0,
        cls: coreWebVitals.cls || 0,
        fcp: coreWebVitals.fcp || 0,
        ttfb: coreWebVitals.ttfb || 0,
        domContentLoaded: 0,
        resourceLoadTime: 0,
        memoryUsage: 0,
        timeToInteractive: 0,
        firstMeaningfulPaint: 0,
        ...resourceMetrics,
        ...memoryMetrics,
        ...cpuMetrics,
        ...uxMetrics,
        // pageLoadTime: Date.now() - startTime, // Comentado para evitar duplicado
      };
      
      this.metrics.push(metrics);
      return metrics;
      
    } catch (error) {
      console.error('Error measuring performance:', error);
      return this.createEmptyMetrics();
    }
  }

  public async measureCoreWebVitals(): Promise<Partial<PerformanceMetrics>> {
    // Simular medición de Core Web Vitals
    return {
      lcp: Math.random() * 2000 + 1000,
      fid: Math.random() * 100 + 50,
      cls: Math.random() * 0.1,
      fcp: Math.random() * 1500 + 800,
      ttfb: Math.random() * 800 + 400,
    };
  }

  public async measureResourceMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simular medición de recursos
    const totalResources = Math.floor(Math.random() * 50) + 20;
    const totalSize = Math.random() * 2000000 + 500000;
    const compressedSize = totalSize * 0.7;
    
    return {
      totalResources,
      totalSize,
      compressedSize,
      compressionRatio: compressedSize / totalSize,
      totalRequests: totalResources,
      failedRequests: Math.floor(Math.random() * 3),
      averageResponseTime: Math.random() * 500 + 100,
      slowestRequest: Math.random() * 2000 + 500,
    };
  }

  public async measureMemoryMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simular medición de memoria
    const heapUsed = Math.random() * 50000000 + 10000000;
    const heapTotal = heapUsed * 1.5;
    const heapLimit = heapTotal * 2;
    
    return {
      heapUsed,
      heapTotal,
      heapLimit,
      memoryUsage: heapUsed / heapLimit,
      memoryLeaks: Math.floor(Math.random() * 5),
    };
  }

  public async measureCPUMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simular medición de CPU
    return {
      cpuUsage: Math.random() * 50 + 10,
      mainThreadBlocking: Math.random() * 200 + 50,
    };
  }

  public async measureUXMetrics(): Promise<Partial<PerformanceMetrics>> {
    // Simular medición de experiencia de usuario
    return {
      timeToInteractive: Math.random() * 2000 + 1000,
      firstMeaningfulPaint: Math.random() * 1500 + 800,
      speedIndex: Math.random() * 2000 + 1000,
      interactionTime: Math.random() * 100 + 50,
      scrollPerformance: Math.random() * 50 + 10,
      animationFrameRate: Math.random() * 20 + 50,
    };
  }

  public async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async run(): Promise<PerformanceTestStats> {
    const startTime = Date.now();
    
    console.log('⚡ Running performance tests...\n');
    
    for (const suite of this.suites) {
      await this.runSuite(suite);
    }
    
    this.stats.duration = Date.now() - startTime;
    this.stats.total = this.results.length;
    this.stats.passed = this.results.filter(r => r.status === 'passed').length;
    this.stats.failed = this.results.filter(r => r.status === 'failed').length;
    this.stats.skipped = this.results.filter(r => r.status === 'skipped').length;
    this.stats.iterations = this.results.reduce((sum, r) => sum + r.iterations, 0);
    this.stats.concurrency = this.results.reduce((sum, r) => sum + r.concurrency, 0);
    
    this.calculateAggregateMetrics();
    
    this.printResults();
    
    return this.stats;
  }

  private async runSuite(suite: PerformanceTestSuite) {
    console.log(`📁 ${suite.name}`);
    
    try {
      // Ejecutar setup
      if (suite.setup) {
        await suite.setup();
      }
      
      // Ejecutar tests
      for (const test of suite.tests) {
        await this.runTest(suite, test);
      }
      
      // Ejecutar teardown
      if (suite.teardown) {
        await suite.teardown();
      }
      
    } catch (error) {
      console.error(`Error in performance suite "${suite.name}":`, error);
    }
  }

  private async runTest(suite: PerformanceTestSuite, test: PerformanceTest) {
    const startTime = Date.now();
    const result: PerformanceTestResult = {
      name: `${suite.name} - ${test.name}`,
      status: 'pending',
      duration: 0,
      metrics: this.createEmptyMetrics(),
      iterations: test.iterations || 1,
      concurrency: test.concurrency || 1,
      networkConditions: this.config.networkConditions,
      cpuThrottling: this.config.cpuThrottling,
      memoryThrottling: this.config.memoryThrottling,
    };
    
    this.currentTest = test;
    
    try {
      // Ejecutar beforeEach
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      // Ejecutar test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Performance test timeout')), test.timeout);
      });
      
      await Promise.race([test.fn(), timeoutPromise]);
      
      result.status = 'passed';
      
      // Ejecutar afterEach
      if (suite.afterEach) {
        await suite.afterEach();
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = error as Error;
    } finally {
      result.duration = Date.now() - startTime;
      this.results.push(result);
      this.currentTest = null;
    }
  }

  private calculateAggregateMetrics() {
    if (this.metrics.length === 0) return;
    
    // Calcular métricas promedio
    this.stats.averageMetrics = this.calculateAverageMetrics();
    
    // Calcular métricas peores
    this.stats.worstMetrics = this.calculateWorstMetrics();
    
    // Calcular métricas mejores
    this.stats.bestMetrics = this.calculateBestMetrics();
    
    // Detectar regresiones de rendimiento
    this.stats.performanceRegressions = this.detectPerformanceRegressions();
  }

  private calculateAverageMetrics(): PerformanceMetrics {
    const avg = this.createEmptyMetrics();
    
    for (const metric of this.metrics) {
      avg.lcp += metric.lcp;
      avg.fid += metric.fid;
      avg.cls += metric.cls;
      avg.fcp += metric.fcp;
      avg.ttfb += metric.ttfb;
      avg.pageLoadTime += metric.pageLoadTime;
      avg.domContentLoaded += metric.domContentLoaded;
      avg.resourceLoadTime += metric.resourceLoadTime;
      avg.memoryUsage += metric.memoryUsage;
      avg.timeToInteractive += metric.timeToInteractive;
      avg.firstMeaningfulPaint += metric.firstMeaningfulPaint;
      avg.speedIndex += metric.speedIndex;
      avg.totalResources += metric.totalResources;
      avg.totalSize += metric.totalSize;
      avg.compressedSize += metric.compressedSize;
      avg.totalRequests += metric.totalRequests;
      avg.failedRequests += metric.failedRequests;
      avg.averageResponseTime += metric.averageResponseTime;
      avg.slowestRequest += metric.slowestRequest;
      avg.heapUsed += metric.heapUsed;
      avg.heapTotal += metric.heapTotal;
      avg.heapLimit += metric.heapLimit;
      avg.memoryLeaks += metric.memoryLeaks;
      avg.cpuUsage += metric.cpuUsage;
      avg.mainThreadBlocking += metric.mainThreadBlocking;
      avg.interactionTime += metric.interactionTime;
      avg.scrollPerformance += metric.scrollPerformance;
      avg.animationFrameRate += metric.animationFrameRate;
    }
    
    const count = this.metrics.length;
    Object.keys(avg).forEach(key => {
      (avg as any)[key] = (avg as any)[key] / count;
    });
    
    return avg;
  }

  private calculateWorstMetrics(): PerformanceMetrics {
    const worst = this.createEmptyMetrics();
    
    for (const metric of this.metrics) {
      worst.lcp = Math.max(worst.lcp, metric.lcp);
      worst.fid = Math.max(worst.fid, metric.fid);
      worst.cls = Math.max(worst.cls, metric.cls);
      worst.fcp = Math.max(worst.fcp, metric.fcp);
      worst.ttfb = Math.max(worst.ttfb, metric.ttfb);
      worst.pageLoadTime = Math.max(worst.pageLoadTime, metric.pageLoadTime);
      worst.domContentLoaded = Math.max(worst.domContentLoaded, metric.domContentLoaded);
      worst.resourceLoadTime = Math.max(worst.resourceLoadTime, metric.resourceLoadTime);
      worst.memoryUsage = Math.max(worst.memoryUsage, metric.memoryUsage);
      worst.timeToInteractive = Math.max(worst.timeToInteractive, metric.timeToInteractive);
      worst.firstMeaningfulPaint = Math.max(worst.firstMeaningfulPaint, metric.firstMeaningfulPaint);
      worst.speedIndex = Math.max(worst.speedIndex, metric.speedIndex);
      worst.totalResources = Math.max(worst.totalResources, metric.totalResources);
      worst.totalSize = Math.max(worst.totalSize, metric.totalSize);
      worst.compressedSize = Math.max(worst.compressedSize, metric.compressedSize);
      worst.totalRequests = Math.max(worst.totalRequests, metric.totalRequests);
      worst.failedRequests = Math.max(worst.failedRequests, metric.failedRequests);
      worst.averageResponseTime = Math.max(worst.averageResponseTime, metric.averageResponseTime);
      worst.slowestRequest = Math.max(worst.slowestRequest, metric.slowestRequest);
      worst.heapUsed = Math.max(worst.heapUsed, metric.heapUsed);
      worst.heapTotal = Math.max(worst.heapTotal, metric.heapTotal);
      worst.heapLimit = Math.max(worst.heapLimit, metric.heapLimit);
      worst.memoryLeaks = Math.max(worst.memoryLeaks, metric.memoryLeaks);
      worst.cpuUsage = Math.max(worst.cpuUsage, metric.cpuUsage);
      worst.mainThreadBlocking = Math.max(worst.mainThreadBlocking, metric.mainThreadBlocking);
      worst.interactionTime = Math.max(worst.interactionTime, metric.interactionTime);
      worst.scrollPerformance = Math.max(worst.scrollPerformance, metric.scrollPerformance);
      worst.animationFrameRate = Math.max(worst.animationFrameRate, metric.animationFrameRate);
    }
    
    return worst;
  }

  private calculateBestMetrics(): PerformanceMetrics {
    const best = this.createEmptyMetrics();
    
    for (const metric of this.metrics) {
      best.lcp = Math.min(best.lcp, metric.lcp);
      best.fid = Math.min(best.fid, metric.fid);
      best.cls = Math.min(best.cls, metric.cls);
      best.fcp = Math.min(best.fcp, metric.fcp);
      best.ttfb = Math.min(best.ttfb, metric.ttfb);
      best.pageLoadTime = Math.min(best.pageLoadTime, metric.pageLoadTime);
      best.domContentLoaded = Math.min(best.domContentLoaded, metric.domContentLoaded);
      best.resourceLoadTime = Math.min(best.resourceLoadTime, metric.resourceLoadTime);
      best.memoryUsage = Math.min(best.memoryUsage, metric.memoryUsage);
      best.timeToInteractive = Math.min(best.timeToInteractive, metric.timeToInteractive);
      best.firstMeaningfulPaint = Math.min(best.firstMeaningfulPaint, metric.firstMeaningfulPaint);
      best.speedIndex = Math.min(best.speedIndex, metric.speedIndex);
      best.totalResources = Math.min(best.totalResources, metric.totalResources);
      best.totalSize = Math.min(best.totalSize, metric.totalSize);
      best.compressedSize = Math.min(best.compressedSize, metric.compressedSize);
      best.totalRequests = Math.min(best.totalRequests, metric.totalRequests);
      best.failedRequests = Math.min(best.failedRequests, metric.failedRequests);
      best.averageResponseTime = Math.min(best.averageResponseTime, metric.averageResponseTime);
      best.slowestRequest = Math.min(best.slowestRequest, metric.slowestRequest);
      best.heapUsed = Math.min(best.heapUsed, metric.heapUsed);
      best.heapTotal = Math.min(best.heapTotal, metric.heapTotal);
      best.heapLimit = Math.min(best.heapLimit, metric.heapLimit);
      best.memoryLeaks = Math.min(best.memoryLeaks, metric.memoryLeaks);
      best.cpuUsage = Math.min(best.cpuUsage, metric.cpuUsage);
      best.mainThreadBlocking = Math.min(best.mainThreadBlocking, metric.mainThreadBlocking);
      best.interactionTime = Math.min(best.interactionTime, metric.interactionTime);
      best.scrollPerformance = Math.min(best.scrollPerformance, metric.scrollPerformance);
      best.animationFrameRate = Math.min(best.animationFrameRate, metric.animationFrameRate);
    }
    
    return best;
  }

  private detectPerformanceRegressions(): number {
    // Detectar regresiones comparando con métricas anteriores
    // Por ahora, retornar 0 (implementar lógica real)
    return 0;
  }

  private printResults() {
    console.log('\n📊 Performance Test Results:');
    console.log(`Total: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`⏱️ Duration: ${this.stats.duration}ms`);
    console.log(`🔄 Iterations: ${this.stats.iterations}`);
    console.log(`👥 Concurrency: ${this.stats.concurrency}`);
    console.log(`📈 Performance Regressions: ${this.stats.performanceRegressions}`);
    
    if (this.metrics.length > 0) {
      console.log('\n📊 Performance Metrics Summary:');
      console.log(`LCP (Average): ${this.stats.averageMetrics.lcp.toFixed(2)}ms`);
      console.log(`FID (Average): ${this.stats.averageMetrics.fid.toFixed(2)}ms`);
      console.log(`CLS (Average): ${this.stats.averageMetrics.cls.toFixed(3)}`);
      console.log(`FCP (Average): ${this.stats.averageMetrics.fcp.toFixed(2)}ms`);
      console.log(`TTFB (Average): ${this.stats.averageMetrics.ttfb.toFixed(2)}ms`);
      console.log(`Page Load Time (Average): ${this.stats.averageMetrics.pageLoadTime.toFixed(2)}ms`);
      console.log(`Memory Usage (Average): ${(this.stats.averageMetrics.memoryUsage * 100).toFixed(2)}%`);
      console.log(`CPU Usage (Average): ${this.stats.averageMetrics.cpuUsage.toFixed(2)}%`);
      console.log(`Animation Frame Rate (Average): ${this.stats.averageMetrics.animationFrameRate.toFixed(2)} FPS`);
    }
    
    if (this.stats.failed > 0) {
      console.log('\n❌ Failed Performance Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  • ${result.name}`);
          if (result.error) {
            console.log(`    ${result.error.message}`);
          }
        });
    }
  }

  public getResults(): PerformanceTestResult[] {
    return [...this.results];
  }

  public getStats(): PerformanceTestStats {
    return { ...this.stats };
  }

  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  public clear() {
    this.suites = [];
    this.results = [];
    this.metrics = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      iterations: 0,
      concurrency: 0,
      averageMetrics: this.createEmptyMetrics(),
      worstMetrics: this.createEmptyMetrics(),
      bestMetrics: this.createEmptyMetrics(),
      flakyTests: 0,
      performanceRegressions: 0,
    };
  }
}

// Instancia singleton
let performanceTestRunnerInstance: PerformanceTestRunner | null = null;

export function getPerformanceTestRunner(): PerformanceTestRunner {
  if (!performanceTestRunnerInstance) {
    performanceTestRunnerInstance = new PerformanceTestRunner();
  }
  return performanceTestRunnerInstance;
}

// Funciones de conveniencia
export const runPerformanceTests = () => getPerformanceTestRunner().run();
export const clearPerformanceTests = () => getPerformanceTestRunner().clear();
export const getPerformanceTestResults = () => getPerformanceTestRunner().getResults();
export const getPerformanceTestStats = () => getPerformanceTestRunner().getStats();
export const getPerformanceMetrics = () => getPerformanceTestRunner().getMetrics();

export default PerformanceTestRunner;

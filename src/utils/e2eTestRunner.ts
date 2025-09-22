/**
 * Sistema de testing end-to-end para Sensus
 * Testing completo de flujos de usuario y funcionalidades
 */

export interface E2ETestConfig {
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
  screenshot: boolean;
  video: boolean;
  slowMo: number;
}

export interface E2ETestSuite {
  name: string;
  tests: E2ETest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

export interface E2ETest {
  name: string;
  fn: () => Promise<void>;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
  tags?: string[];
}

export interface E2ETestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  screenshots?: string[];
  video?: string;
  steps?: TestStep[];
  performance?: PerformanceMetrics;
}

export interface TestStep {
  name: string;
  action: string;
  selector?: string;
  value?: any;
  duration: number;
  success: boolean;
  error?: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage: number;
}

export interface E2ETestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  screenshots: number;
  videos: number;
  averageStepDuration: number;
  flakyTests: number;
}

class E2ETestRunner {
  private config: E2ETestConfig;
  private suites: E2ETestSuite[] = [];
  private results: E2ETestResult[] = [];
  private stats: E2ETestStats;
  private currentSuite: E2ETestSuite | null = null;
  private currentTest: E2ETest | null = null;
  private browser: any = null;
  private page: any = null;
  private steps: TestStep[] = [];
  private screenshots: string[] = [];
  private isRecording = false;

  constructor(config: Partial<E2ETestConfig> = {}) {
    this.config = {
      timeout: 60000,
      retries: 1,
      parallel: false,
      verbose: true,
      headless: true,
      browser: 'chrome',
      viewport: { width: 1280, height: 720 },
      baseURL: 'http://localhost:3000',
      screenshot: true,
      video: false,
      slowMo: 0,
      ...config,
    };

    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      screenshots: 0,
      videos: 0,
      averageStepDuration: 0,
      flakyTests: 0,
    };

    this.init();
  }

  private init() {
    // Configurar globales de testing E2E
    this.setupGlobals();
    
    // Configurar navegador
    this.setupBrowser();
  }

  private setupGlobals() {
    // Exponer funciones globales de testing E2E
    (globalThis as any).describeE2E = this.describeE2E.bind(this);
    (globalThis as any).itE2E = this.itE2E.bind(this);
    (globalThis as any).beforeAllE2E = this.beforeAllE2E.bind(this);
    (globalThis as any).afterAllE2E = this.afterAllE2E.bind(this);
    (globalThis as any).beforeEachE2E = this.beforeEachE2E.bind(this);
    (globalThis as any).afterEachE2E = this.afterEachE2E.bind(this);
    
    // Exponer funciones de interacción
    (globalThis as any).visit = this.visit.bind(this);
    (globalThis as any).click = this.click.bind(this);
    (globalThis as any).type = this.type.bind(this);
    (globalThis as any).select = this.select.bind(this);
    (globalThis as any).hover = this.hover.bind(this);
    (globalThis as any).scroll = this.scroll.bind(this);
    (globalThis as any).wait = this.wait.bind(this);
    (globalThis as any).expect = this.expect.bind(this);
    (globalThis as any).screenshot = this.screenshot.bind(this);
  }

  private async setupBrowser() {
    // Configurar navegador según el tipo
    switch (this.config.browser) {
      case 'chrome':
        await this.setupChrome();
        break;
      case 'firefox':
        await this.setupFirefox();
        break;
      case 'edge':
        await this.setupEdge();
        break;
      case 'safari':
        await this.setupSafari();
        break;
    }
  }

  private async setupChrome() {
    // Configurar Chrome/Chromium
    console.log('Setting up Chrome browser...');
  }

  private async setupFirefox() {
    // Configurar Firefox
    console.log('Setting up Firefox browser...');
  }

  private async setupEdge() {
    // Configurar Edge
    console.log('Setting up Edge browser...');
  }

  private async setupSafari() {
    // Configurar Safari
    console.log('Setting up Safari browser...');
  }

  // API pública
  public describeE2E(name: string, fn: () => void) {
    const suite: E2ETestSuite = {
      name,
      tests: [],
    };
    
    this.currentSuite = suite;
    this.suites.push(suite);
    
    try {
      fn();
    } catch (error) {
      console.error(`Error in E2E describe block "${name}":`, error);
    }
    
    this.currentSuite = null;
  }

  public itE2E(name: string, fn: () => Promise<void>, timeout?: number) {
    if (!this.currentSuite) {
      throw new Error('itE2E() must be called within a describeE2E() block');
    }

    const test: E2ETest = {
      name,
      fn,
      timeout: timeout || this.config.timeout,
    };

    this.currentSuite.tests.push(test);
  }

  public beforeAllE2E(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeAllE2E() must be called within a describeE2E() block');
    }
    this.currentSuite.setup = fn;
  }

  public afterAllE2E(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterAllE2E() must be called within a describeE2E() block');
    }
    this.currentSuite.teardown = fn;
  }

  public beforeEachE2E(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeEachE2E() must be called within a describeE2E() block');
    }
    this.currentSuite.beforeEach = fn;
  }

  public afterEachE2E(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterEachE2E() must be called within a describeE2E() block');
    }
    this.currentSuite.afterEach = fn;
  }

  // Funciones de interacción
  public async visit(url: string) {
    const startTime = Date.now();
    
    try {
      // Simular navegación
      console.log(`Navigating to: ${url}`);
      await this.wait(1000); // Simular tiempo de carga
      
      this.addStep('visit', `Navigate to ${url}`, undefined, undefined, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('visit', `Navigate to ${url}`, undefined, undefined, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async click(selector: string, options: any = {}) {
    const startTime = Date.now();
    
    try {
      // Simular clic
      console.log(`Clicking element: ${selector}`);
      await this.wait(100);
      
      this.addStep('click', `Click ${selector}`, selector, undefined, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('click', `Click ${selector}`, selector, undefined, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async type(selector: string, text: string, options: any = {}) {
    const startTime = Date.now();
    
    try {
      // Simular escritura
      console.log(`Typing "${text}" into: ${selector}`);
      await this.wait(text.length * 50); // Simular tiempo de escritura
      
      this.addStep('type', `Type "${text}" into ${selector}`, selector, text, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('type', `Type "${text}" into ${selector}`, selector, text, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async select(selector: string, value: string) {
    const startTime = Date.now();
    
    try {
      // Simular selección
      console.log(`Selecting "${value}" from: ${selector}`);
      await this.wait(100);
      
      this.addStep('select', `Select "${value}" from ${selector}`, selector, value, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('select', `Select "${value}" from ${selector}`, selector, value, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async hover(selector: string) {
    const startTime = Date.now();
    
    try {
      // Simular hover
      console.log(`Hovering over: ${selector}`);
      await this.wait(100);
      
      this.addStep('hover', `Hover over ${selector}`, selector, undefined, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('hover', `Hover over ${selector}`, selector, undefined, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async scroll(x: number, y: number) {
    const startTime = Date.now();
    
    try {
      // Simular scroll
      console.log(`Scrolling to: ${x}, ${y}`);
      await this.wait(100);
      
      this.addStep('scroll', `Scroll to ${x}, ${y}`, undefined, { x, y }, Date.now() - startTime, true);
    } catch (error) {
      this.addStep('scroll', `Scroll to ${x}, ${y}`, undefined, { x, y }, Date.now() - startTime, false, error.message);
      throw error;
    }
  }

  public async wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public expect(actual: any) {
    return new E2EAssertion(actual);
  }

  public async screenshot(name?: string) {
    if (!this.config.screenshot) return;
    
    const screenshotName = name || `screenshot-${Date.now()}.png`;
    console.log(`Taking screenshot: ${screenshotName}`);
    
    this.screenshots.push(screenshotName);
    this.stats.screenshots++;
    
    return screenshotName;
  }

  // Métodos privados
  private addStep(action: string, name: string, selector?: string, value?: any, duration?: number, success?: boolean, error?: string) {
    const step: TestStep = {
      name,
      action,
      selector,
      value,
      duration: duration || 0,
      success: success !== false,
      error,
    };
    
    this.steps.push(step);
  }

  private async capturePerformanceMetrics(): Promise<PerformanceMetrics> {
    // Simular captura de métricas de rendimiento
    return {
      pageLoadTime: Math.random() * 2000 + 1000,
      domContentLoaded: Math.random() * 1500 + 800,
      firstContentfulPaint: Math.random() * 1200 + 600,
      largestContentfulPaint: Math.random() * 2500 + 1500,
      firstInputDelay: Math.random() * 100 + 50,
      cumulativeLayoutShift: Math.random() * 0.1,
      memoryUsage: Math.random() * 0.5 + 0.3,
    };
  }

  public async run(): Promise<E2ETestStats> {
    const startTime = Date.now();
    
    console.log('🌐 Running E2E tests...\n');
    
    for (const suite of this.suites) {
      await this.runSuite(suite);
    }
    
    this.stats.duration = Date.now() - startTime;
    this.stats.total = this.results.length;
    this.stats.passed = this.results.filter(r => r.status === 'passed').length;
    this.stats.failed = this.results.filter(r => r.status === 'failed').length;
    this.stats.skipped = this.results.filter(r => r.status === 'skipped').length;
    this.stats.averageStepDuration = this.calculateAverageStepDuration();
    
    this.printResults();
    
    return this.stats;
  }

  private async runSuite(suite: E2ETestSuite) {
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
      console.error(`Error in E2E suite "${suite.name}":`, error);
    }
  }

  private async runTest(suite: E2ETestSuite, test: E2ETest) {
    const startTime = Date.now();
    const result: E2ETestResult = {
      name: `${suite.name} - ${test.name}`,
      status: 'pending',
      duration: 0,
      steps: [],
      screenshots: [],
    };
    
    this.currentTest = test;
    this.steps = [];
    this.screenshots = [];
    
    try {
      // Ejecutar beforeEach
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      // Ejecutar test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('E2E test timeout')), test.timeout);
      });
      
      await Promise.race([test.fn(), timeoutPromise]);
      
      result.status = 'passed';
      result.steps = [...this.steps];
      result.screenshots = [...this.screenshots];
      result.performance = await this.capturePerformanceMetrics();
      
      // Ejecutar afterEach
      if (suite.afterEach) {
        await suite.afterEach();
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = error as Error;
      result.steps = [...this.steps];
      result.screenshots = [...this.screenshots];
      result.performance = await this.capturePerformanceMetrics();
    } finally {
      result.duration = Date.now() - startTime;
      this.results.push(result);
      this.currentTest = null;
    }
  }

  private calculateAverageStepDuration(): number {
    if (this.steps.length === 0) return 0;
    
    const totalDuration = this.steps.reduce((sum, step) => sum + step.duration, 0);
    return totalDuration / this.steps.length;
  }

  private printResults() {
    console.log('\n📊 E2E Test Results:');
    console.log(`Total: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`⏱️ Duration: ${this.stats.duration}ms`);
    console.log(`📸 Screenshots: ${this.stats.screenshots}`);
    console.log(`🎥 Videos: ${this.stats.videos}`);
    console.log(`⚡ Average Step Duration: ${this.stats.averageStepDuration.toFixed(2)}ms`);
    
    if (this.stats.failed > 0) {
      console.log('\n❌ Failed E2E Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  • ${result.name}`);
          if (result.error) {
            console.log(`    ${result.error.message}`);
          }
          if (result.steps && result.steps.length > 0) {
            console.log(`    Steps: ${result.steps.length}`);
            const failedSteps = result.steps.filter(s => !s.success);
            if (failedSteps.length > 0) {
              console.log(`    Failed Steps: ${failedSteps.map(s => s.name).join(', ')}`);
            }
          }
        });
    }
  }

  public getResults(): E2ETestResult[] {
    return [...this.results];
  }

  public getStats(): E2ETestStats {
    return { ...this.stats };
  }

  public clear() {
    this.suites = [];
    this.results = [];
    this.steps = [];
    this.screenshots = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      screenshots: 0,
      videos: 0,
      averageStepDuration: 0,
      flakyTests: 0,
    };
  }
}

// Clase de Assertions para E2E
class E2EAssertion {
  constructor(private actual: any) {}

  toBe(expected: any) {
    if (this.actual !== expected) {
      throw new Error(`Expected ${this.actual} to be ${expected}`);
    }
    return this;
  }

  toEqual(expected: any) {
    if (!this.deepEqual(this.actual, expected)) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`);
    }
    return this;
  }

  toBeVisible() {
    if (!this.actual) {
      throw new Error('Expected element to be visible');
    }
    return this;
  }

  toBeHidden() {
    if (this.actual) {
      throw new Error('Expected element to be hidden');
    }
    return this;
  }

  toContainText(text: string) {
    if (!this.actual || !this.actual.includes(text)) {
      throw new Error(`Expected "${this.actual}" to contain text "${text}"`);
    }
    return this;
  }

  toHaveAttribute(attribute: string, value?: string) {
    if (!this.actual || !this.actual.hasAttribute(attribute)) {
      throw new Error(`Expected element to have attribute "${attribute}"`);
    }
    if (value !== undefined && this.actual.getAttribute(attribute) !== value) {
      throw new Error(`Expected attribute "${attribute}" to be "${value}", got "${this.actual.getAttribute(attribute)}"`);
    }
    return this;
  }

  toHaveClass(className: string) {
    if (!this.actual || !this.actual.classList.contains(className)) {
      throw new Error(`Expected element to have class "${className}"`);
    }
    return this;
  }

  toBeEnabled() {
    if (!this.actual || this.actual.disabled) {
      throw new Error('Expected element to be enabled');
    }
    return this;
  }

  toBeDisabled() {
    if (!this.actual || !this.actual.disabled) {
      throw new Error('Expected element to be disabled');
    }
    return this;
  }

  toBeChecked() {
    if (!this.actual || !this.actual.checked) {
      throw new Error('Expected element to be checked');
    }
    return this;
  }

  toBeUnchecked() {
    if (!this.actual || this.actual.checked) {
      throw new Error('Expected element to be unchecked');
    }
    return this;
  }

  toHaveValue(value: string) {
    if (!this.actual || this.actual.value !== value) {
      throw new Error(`Expected element to have value "${value}", got "${this.actual?.value}"`);
    }
    return this;
  }

  toHaveLength(length: number) {
    if (!Array.isArray(this.actual) && typeof this.actual !== 'string') {
      throw new Error('toHaveLength can only be used with arrays or strings');
    }
    if (this.actual.length !== length) {
      throw new Error(`Expected length ${length}, got ${this.actual.length}`);
    }
    return this;
  }

  toExist() {
    if (!this.actual) {
      throw new Error('Expected element to exist');
    }
    return this;
  }

  notToExist() {
    if (this.actual) {
      throw new Error('Expected element not to exist');
    }
    return this;
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    
    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!this.deepEqual(a[key], b[key])) return false;
      }
      return true;
    }
    
    return false;
  }
}

// Instancia singleton
let e2eTestRunnerInstance: E2ETestRunner | null = null;

export function getE2ETestRunner(): E2ETestRunner {
  if (!e2eTestRunnerInstance) {
    e2eTestRunnerInstance = new E2ETestRunner();
  }
  return e2eTestRunnerInstance;
}

// Funciones de conveniencia
export const runE2ETests = () => getE2ETestRunner().run();
export const clearE2ETests = () => getE2ETestRunner().clear();
export const getE2ETestResults = () => getE2ETestRunner().getResults();
export const getE2ETestStats = () => getE2ETestRunner().getStats();

export default E2ETestRunner;

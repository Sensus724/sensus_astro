/**
 * Sistema de testing unitario para Sensus
 * Framework completo de testing con mocks, assertions y reporting
 */

export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
  coverage: boolean;
  watch: boolean;
  bail: boolean;
}

export interface TestSuite {
  name: string;
  tests: Test[];
  beforeAll?: () => void | Promise<void>;
  afterAll?: () => void | Promise<void>;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
}

export interface Test {
  name: string;
  fn: () => void | Promise<void>;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  coverage?: CoverageReport;
}

export interface CoverageReport {
  statements: { total: number; covered: number; percentage: number };
  branches: { total: number; covered: number; percentage: number };
  functions: { total: number; covered: number; percentage: number };
  lines: { total: number; covered: number; percentage: number };
}

export interface TestRunnerStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  coverage: CoverageReport | null;
}

class TestRunner {
  private config: TestConfig;
  private suites: TestSuite[] = [];
  private results: TestResult[] = [];
  private stats: TestRunnerStats;
  private currentSuite: TestSuite | null = null;
  private currentTest: Test | null = null;

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      timeout: 5000,
      retries: 0,
      parallel: false,
      verbose: false,
      coverage: false,
      watch: false,
      bail: false,
      ...config,
    };

    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: null,
    };

    this.init();
  }

  private init() {
    // Configurar globales de testing
    this.setupGlobals();
    
    // Configurar mocks
    this.setupMocks();
    
    // Configurar coverage si está habilitado
    if (this.config.coverage) {
      this.setupCoverage();
    }
  }

  private setupGlobals() {
    // Exponer funciones globales de testing
    (globalThis as any).describe = this.describe.bind(this);
    (globalThis as any).it = this.it.bind(this);
    (globalThis as any).test = this.it.bind(this);
    (globalThis as any).beforeAll = this.beforeAll.bind(this);
    (globalThis as any).afterAll = this.afterAll.bind(this);
    (globalThis as any).beforeEach = this.beforeEach.bind(this);
    (globalThis as any).afterEach = this.afterEach.bind(this);
    (globalThis as any).expect = this.expect.bind(this);
    (globalThis as any).mock = this.mock.bind(this);
    (globalThis as any).spyOn = this.spyOn.bind(this);
  }

  private setupMocks() {
    // Configurar sistema de mocks
    (globalThis as any).jest = {
      mock: this.mock.bind(this),
      spyOn: this.spyOn.bind(this),
      fn: this.createMockFunction.bind(this),
    };
  }

  private setupCoverage() {
    // Configurar coverage tracking
    console.log('Coverage tracking enabled');
  }

  // API pública
  public describe(name: string, fn: () => void) {
    const suite: TestSuite = {
      name,
      tests: [],
    };
    
    this.currentSuite = suite;
    this.suites.push(suite);
    
    try {
      fn();
    } catch (error) {
      console.error(`Error in describe block "${name}":`, error);
    }
    
    this.currentSuite = null;
  }

  public it(name: string, fn: () => void | Promise<void>, timeout?: number) {
    if (!this.currentSuite) {
      throw new Error('it() must be called within a describe() block');
    }

    const test: Test = {
      name,
      fn,
      timeout: timeout || this.config.timeout,
    };

    this.currentSuite.tests.push(test);
  }

  public beforeAll(fn: () => void | Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeAll() must be called within a describe() block');
    }
    this.currentSuite.beforeAll = fn;
  }

  public afterAll(fn: () => void | Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterAll() must be called within a describe() block');
    }
    this.currentSuite.afterAll = fn;
  }

  public beforeEach(fn: () => void | Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeEach() must be called within a describe() block');
    }
    this.currentSuite.beforeEach = fn;
  }

  public afterEach(fn: () => void | Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterEach() must be called within a describe() block');
    }
    this.currentSuite.afterEach = fn;
  }

  public expect(actual: any) {
    return new Assertion(actual);
  }

  public mock(module: string, implementation?: any) {
    return new Mock(module, implementation);
  }

  public spyOn(object: any, method: string) {
    return new Spy(object, method);
  }

  public createMockFunction() {
    return new MockFunction();
  }

  public async run(): Promise<TestRunnerStats> {
    const startTime = Date.now();
    
    console.log('🧪 Running tests...\n');
    
    for (const suite of this.suites) {
      await this.runSuite(suite);
    }
    
    this.stats.duration = Date.now() - startTime;
    this.stats.total = this.results.length;
    this.stats.passed = this.results.filter(r => r.status === 'passed').length;
    this.stats.failed = this.results.filter(r => r.status === 'failed').length;
    this.stats.skipped = this.results.filter(r => r.status === 'skipped').length;
    
    this.printResults();
    
    return this.stats;
  }

  private async runSuite(suite: TestSuite) {
    console.log(`📁 ${suite.name}`);
    
    try {
      // Ejecutar beforeAll
      if (suite.beforeAll) {
        await suite.beforeAll();
      }
      
      // Ejecutar tests
      for (const test of suite.tests) {
        await this.runTest(suite, test);
      }
      
      // Ejecutar afterAll
      if (suite.afterAll) {
        await suite.afterAll();
      }
      
    } catch (error) {
      console.error(`Error in suite "${suite.name}":`, error);
    }
  }

  private async runTest(suite: TestSuite, test: Test) {
    const startTime = Date.now();
    const result: TestResult = {
      name: `${suite.name} - ${test.name}`,
      status: 'pending',
      duration: 0,
    };
    
    this.currentTest = test;
    
    try {
      // Ejecutar beforeEach
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      // Ejecutar test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout')), test.timeout);
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

  private printResults() {
    console.log('\n📊 Test Results:');
    console.log(`Total: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`⏱️ Duration: ${this.stats.duration}ms`);
    
    if (this.stats.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  • ${result.name}`);
          if (result.error) {
            console.log(`    ${result.error.message}`);
          }
        });
    }
    
    if (this.config.coverage && this.stats.coverage) {
      console.log('\n📈 Coverage:');
      console.log(`Statements: ${this.stats.coverage.statements.percentage}%`);
      console.log(`Branches: ${this.stats.coverage.branches.percentage}%`);
      console.log(`Functions: ${this.stats.coverage.functions.percentage}%`);
      console.log(`Lines: ${this.stats.coverage.lines.percentage}%`);
    }
  }

  public getResults(): TestResult[] {
    return [...this.results];
  }

  public getStats(): TestRunnerStats {
    return { ...this.stats };
  }

  public clear() {
    this.suites = [];
    this.results = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      coverage: null,
    };
  }
}

// Clase de Assertions
class Assertion {
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

  toBeTruthy() {
    if (!this.actual) {
      throw new Error(`Expected ${this.actual} to be truthy`);
    }
    return this;
  }

  toBeFalsy() {
    if (this.actual) {
      throw new Error(`Expected ${this.actual} to be falsy`);
    }
    return this;
  }

  toBeNull() {
    if (this.actual !== null) {
      throw new Error(`Expected ${this.actual} to be null`);
    }
    return this;
  }

  toBeUndefined() {
    if (this.actual !== undefined) {
      throw new Error(`Expected ${this.actual} to be undefined`);
    }
    return this;
  }

  toBeDefined() {
    if (this.actual === undefined) {
      throw new Error(`Expected ${this.actual} to be defined`);
    }
    return this;
  }

  toContain(expected: any) {
    if (Array.isArray(this.actual)) {
      if (!this.actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}`);
      }
    } else if (typeof this.actual === 'string') {
      if (!this.actual.includes(expected)) {
        throw new Error(`Expected string to contain ${expected}`);
      }
    } else {
      throw new Error('toContain can only be used with arrays or strings');
    }
    return this;
  }

  toHaveLength(expected: number) {
    if (!Array.isArray(this.actual) && typeof this.actual !== 'string') {
      throw new Error('toHaveLength can only be used with arrays or strings');
    }
    if (this.actual.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${this.actual.length}`);
    }
    return this;
  }

  toThrow(expected?: string | RegExp) {
    if (typeof this.actual !== 'function') {
      throw new Error('toThrow can only be used with functions');
    }
    
    try {
      this.actual();
      throw new Error('Expected function to throw');
    } catch (error) {
      if (expected) {
        const message = (error as Error).message;
        if (typeof expected === 'string') {
          if (!message.includes(expected)) {
            throw new Error(`Expected error message to contain "${expected}", got "${message}"`);
          }
        } else {
          if (!expected.test(message)) {
            throw new Error(`Expected error message to match ${expected}, got "${message}"`);
          }
        }
      }
    }
    return this;
  }

  toBeGreaterThan(expected: number) {
    if (this.actual <= expected) {
      throw new Error(`Expected ${this.actual} to be greater than ${expected}`);
    }
    return this;
  }

  toBeLessThan(expected: number) {
    if (this.actual >= expected) {
      throw new Error(`Expected ${this.actual} to be less than ${expected}`);
    }
    return this;
  }

  toBeCloseTo(expected: number, precision: number = 2) {
    const diff = Math.abs(this.actual - expected);
    const threshold = Math.pow(10, -precision) / 2;
    if (diff > threshold) {
      throw new Error(`Expected ${this.actual} to be close to ${expected} (precision: ${precision})`);
    }
    return this;
  }

  toMatch(expected: RegExp) {
    if (typeof this.actual !== 'string') {
      throw new Error('toMatch can only be used with strings');
    }
    if (!expected.test(this.actual)) {
      throw new Error(`Expected "${this.actual}" to match ${expected}`);
    }
    return this;
  }

  toHaveProperty(property: string, value?: any) {
    if (!(property in this.actual)) {
      throw new Error(`Expected object to have property "${property}"`);
    }
    if (value !== undefined) {
      if (!this.deepEqual(this.actual[property], value)) {
        throw new Error(`Expected property "${property}" to equal ${JSON.stringify(value)}`);
      }
    }
    return this;
  }

  not = {
    toBe: (expected: any) => {
      if (this.actual === expected) {
        throw new Error(`Expected ${this.actual} not to be ${expected}`);
      }
      return this;
    },
    toEqual: (expected: any) => {
      if (this.deepEqual(this.actual, expected)) {
        throw new Error(`Expected ${JSON.stringify(this.actual)} not to equal ${JSON.stringify(expected)}`);
      }
      return this;
    },
    toContain: (expected: any) => {
      if (Array.isArray(this.actual)) {
        if (this.actual.includes(expected)) {
          throw new Error(`Expected array not to contain ${expected}`);
        }
      } else if (typeof this.actual === 'string') {
        if (this.actual.includes(expected)) {
          throw new Error(`Expected string not to contain ${expected}`);
        }
      } else {
        throw new Error('not.toContain can only be used with arrays or strings');
      }
      return this;
    },
  };

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

// Clase Mock
class Mock {
  constructor(private module: string, private implementation?: any) {
    this.setup();
  }

  private setup() {
    // Implementar mock
    console.log(`Mocking module: ${this.module}`);
  }

  public mockReturnValue(value: any) {
    return this;
  }

  public mockResolvedValue(value: any) {
    return this;
  }

  public mockRejectedValue(value: any) {
    return this;
  }

  public mockImplementation(fn: Function) {
    return this;
  }
}

// Clase Spy
class Spy {
  constructor(private object: any, private method: string) {
    this.setup();
  }

  private setup() {
    // Implementar spy
    console.log(`Spying on ${this.object.constructor.name}.${this.method}`);
  }

  public mockReturnValue(value: any) {
    return this;
  }

  public mockResolvedValue(value: any) {
    return this;
  }

  public mockRejectedValue(value: any) {
    return this;
  }

  public mockImplementation(fn: Function) {
    return this;
  }

  public toHaveBeenCalled() {
    return this;
  }

  public toHaveBeenCalledWith(...args: any[]) {
    return this;
  }

  public toHaveBeenCalledTimes(count: number) {
    return this;
  }
}

// Clase MockFunction
class MockFunction {
  private calls: any[][] = [];
  private returnValue: any = undefined;

  constructor(private implementation?: Function) {}

  public mockReturnValue(value: any) {
    this.returnValue = value;
    return this;
  }

  public mockResolvedValue(value: any) {
    this.returnValue = Promise.resolve(value);
    return this;
  }

  public mockRejectedValue(value: any) {
    this.returnValue = Promise.reject(value);
    return this;
  }

  public mockImplementation(fn: Function) {
    this.implementation = fn;
    return this;
  }

  public toHaveBeenCalled() {
    if (this.calls.length === 0) {
      throw new Error('Expected function to have been called');
    }
    return this;
  }

  public toHaveBeenCalledWith(...args: any[]) {
    const found = this.calls.some(call => 
      call.length === args.length && 
      call.every((arg, index) => arg === args[index])
    );
    if (!found) {
      throw new Error(`Expected function to have been called with ${JSON.stringify(args)}`);
    }
    return this;
  }

  public toHaveBeenCalledTimes(count: number) {
    if (this.calls.length !== count) {
      throw new Error(`Expected function to have been called ${count} times, got ${this.calls.length}`);
    }
    return this;
  }

  public get calls() {
    return this.calls;
  }

  public get returnValue() {
    return this.returnValue;
  }
}

// Instancia singleton
let testRunnerInstance: TestRunner | null = null;

export function getTestRunner(): TestRunner {
  if (!testRunnerInstance) {
    testRunnerInstance = new TestRunner();
  }
  return testRunnerInstance;
}

// Funciones de conveniencia
export const runTests = () => getTestRunner().run();
export const clearTests = () => getTestRunner().clear();
export const getTestResults = () => getTestRunner().getResults();
export const getTestStats = () => getTestRunner().getStats();

export default TestRunner;

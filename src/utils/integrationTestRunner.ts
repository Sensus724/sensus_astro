/**
 * Sistema de testing de integración para Sensus
 * Testing de integración entre componentes, servicios y APIs
 */

export interface IntegrationTestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  verbose: boolean;
  mockExternalServices: boolean;
  testDatabase: boolean;
  testAPIs: boolean;
}

export interface IntegrationTestSuite {
  name: string;
  tests: IntegrationTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

export interface IntegrationTest {
  name: string;
  fn: () => Promise<void>;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
  dependencies?: string[];
}

export interface IntegrationTestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'pending';
  duration: number;
  error?: Error;
  dependencies?: string[];
  apiCalls?: APICall[];
  databaseQueries?: DatabaseQuery[];
}

export interface APICall {
  method: string;
  url: string;
  status: number;
  duration: number;
  requestBody?: any;
  responseBody?: any;
}

export interface DatabaseQuery {
  query: string;
  duration: number;
  resultCount: number;
  error?: string;
}

export interface IntegrationTestStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  apiCalls: number;
  databaseQueries: number;
  averageResponseTime: number;
}

class IntegrationTestRunner {
  private config: IntegrationTestConfig;
  private suites: IntegrationTestSuite[] = [];
  private results: IntegrationTestResult[] = [];
  private stats: IntegrationTestStats;
  private currentSuite: IntegrationTestSuite | null = null;
  private currentTest: IntegrationTest | null = null;
  private apiCalls: APICall[] = [];
  private databaseQueries: DatabaseQuery[] = [];
  private mocks: Map<string, any> = new Map();

  constructor(config: Partial<IntegrationTestConfig> = {}) {
    this.config = {
      timeout: 30000,
      retries: 1,
      parallel: false,
      verbose: true,
      mockExternalServices: true,
      testDatabase: true,
      testAPIs: true,
      ...config,
    };

    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      apiCalls: 0,
      databaseQueries: 0,
      averageResponseTime: 0,
    };

    this.init();
  }

  private init() {
    // Configurar mocks de servicios externos
    if (this.config.mockExternalServices) {
      this.setupExternalServiceMocks();
    }
    
    // Configurar base de datos de prueba
    if (this.config.testDatabase) {
      this.setupTestDatabase();
    }
    
    // Configurar interceptores de API
    if (this.config.testAPIs) {
      this.setupAPIInterseptors();
    }
    
    // Configurar globales de testing
    this.setupGlobals();
  }

  private setupExternalServiceMocks() {
    // Mock de Firebase
    this.mocks.set('firebase', {
      auth: {
        signInWithEmailAndPassword: this.mockAPICall('POST', '/auth/signin'),
        createUserWithEmailAndPassword: this.mockAPICall('POST', '/auth/signup'),
        signOut: this.mockAPICall('POST', '/auth/signout'),
        onAuthStateChanged: this.mockAuthStateChange(),
      },
      firestore: {
        collection: this.mockFirestoreCollection(),
        doc: this.mockFirestoreDoc(),
      },
    });

    // Mock de APIs externas
    this.mocks.set('externalAPIs', {
      'https://api.example.com': this.mockExternalAPI(),
    });
  }

  private setupTestDatabase() {
    // Configurar base de datos de prueba
    this.mocks.set('database', {
      users: this.mockDatabaseTable('users'),
      sessions: this.mockDatabaseTable('sessions'),
      evaluations: this.mockDatabaseTable('evaluations'),
      diaryEntries: this.mockDatabaseTable('diary_entries'),
    });
  }

  private setupAPIInterseptors() {
    // Interceptar llamadas a API para testing
    const originalFetch = window.fetch;
    window.fetch = async (url: string | URL | Request, options?: RequestInit) => {
      const startTime = Date.now();
      const method = options?.method || 'GET';
      
      try {
        const response = await originalFetch(url, options);
        const duration = Date.now() - startTime;
        
        const apiCall: APICall = {
          method,
          url: url.toString(),
          status: response.status,
          duration,
          requestBody: options?.body,
        };
        
        this.apiCalls.push(apiCall);
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        const apiCall: APICall = {
          method,
          url: url.toString(),
          status: 0,
          duration,
          requestBody: options?.body,
        };
        
        this.apiCalls.push(apiCall);
        throw error;
      }
    };
  }

  private setupGlobals() {
    // Exponer funciones globales de testing de integración
    (globalThis as any).describeIntegration = this.describeIntegration.bind(this);
    (globalThis as any).itIntegration = this.itIntegration.bind(this);
    (globalThis as any).beforeAllIntegration = this.beforeAllIntegration.bind(this);
    (globalThis as any).afterAllIntegration = this.afterAllIntegration.bind(this);
    (globalThis as any).beforeEachIntegration = this.beforeEachIntegration.bind(this);
    (globalThis as any).afterEachIntegration = this.afterEachIntegration.bind(this);
    (globalThis as any).mockService = this.mockService.bind(this);
    (globalThis as any).mockAPI = this.mockAPI.bind(this);
    (globalThis as any).mockDatabase = this.mockDatabase.bind(this);
  }

  // Métodos de mock
  private mockAPICall(method: string, endpoint: string) {
    return async (data?: any) => {
      const startTime = Date.now();
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      const duration = Date.now() - startTime;
      const apiCall: APICall = {
        method,
        url: endpoint,
        status: 200,
        duration,
        requestBody: data,
        responseBody: { success: true, data },
      };
      
      this.apiCalls.push(apiCall);
      
      return { success: true, data };
    };
  }

  private mockAuthStateChange() {
    return (callback: (user: any) => void) => {
      // Simular cambio de estado de autenticación
      setTimeout(() => {
        callback({ uid: 'test-user', email: 'test@example.com' });
      }, 100);
      
      return () => {}; // unsubscribe function
    };
  }

  private mockFirestoreCollection() {
    return (name: string) => ({
      doc: (id: string) => this.mockFirestoreDoc(),
      add: (data: any) => Promise.resolve({ id: 'test-id', ...data }),
      get: () => Promise.resolve({ docs: [] }),
      where: (field: string, operator: string, value: any) => this.mockFirestoreCollection(),
    });
  }

  private mockFirestoreDoc() {
    return {
      get: () => Promise.resolve({ exists: true, data: () => ({}) }),
      set: (data: any) => Promise.resolve(),
      update: (data: any) => Promise.resolve(),
      delete: () => Promise.resolve(),
    };
  }

  private mockExternalAPI() {
    return {
      get: (endpoint: string) => this.mockAPICall('GET', endpoint),
      post: (endpoint: string, data: any) => this.mockAPICall('POST', endpoint),
      put: (endpoint: string, data: any) => this.mockAPICall('PUT', endpoint),
      delete: (endpoint: string) => this.mockAPICall('DELETE', endpoint),
    };
  }

  private mockDatabaseTable(tableName: string) {
    const data: any[] = [];
    
    return {
      insert: (record: any) => {
        const id = `test-${Date.now()}`;
        data.push({ id, ...record });
        return Promise.resolve({ id, ...record });
      },
      findById: (id: string) => {
        const record = data.find(r => r.id === id);
        return Promise.resolve(record || null);
      },
      findByField: (field: string, value: any) => {
        const records = data.filter(r => r[field] === value);
        return Promise.resolve(records);
      },
      update: (id: string, updates: any) => {
        const index = data.findIndex(r => r.id === id);
        if (index !== -1) {
          data[index] = { ...data[index], ...updates };
          return Promise.resolve(data[index]);
        }
        return Promise.resolve(null);
      },
      delete: (id: string) => {
        const index = data.findIndex(r => r.id === id);
        if (index !== -1) {
          data.splice(index, 1);
          return Promise.resolve(true);
        }
        return Promise.resolve(false);
      },
      getAll: () => Promise.resolve([...data]),
      clear: () => {
        data.length = 0;
        return Promise.resolve();
      },
    };
  }

  // API pública
  public describeIntegration(name: string, fn: () => void) {
    const suite: IntegrationTestSuite = {
      name,
      tests: [],
    };
    
    this.currentSuite = suite;
    this.suites.push(suite);
    
    try {
      fn();
    } catch (error) {
      console.error(`Error in integration describe block "${name}":`, error);
    }
    
    this.currentSuite = null;
  }

  public itIntegration(name: string, fn: () => Promise<void>, timeout?: number) {
    if (!this.currentSuite) {
      throw new Error('itIntegration() must be called within a describeIntegration() block');
    }

    const test: IntegrationTest = {
      name,
      fn,
      timeout: timeout || this.config.timeout,
    };

    this.currentSuite.tests.push(test);
  }

  public beforeAllIntegration(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeAllIntegration() must be called within a describeIntegration() block');
    }
    this.currentSuite.setup = fn;
  }

  public afterAllIntegration(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterAllIntegration() must be called within a describeIntegration() block');
    }
    this.currentSuite.teardown = fn;
  }

  public beforeEachIntegration(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('beforeEachIntegration() must be called within a describeIntegration() block');
    }
    this.currentSuite.beforeEach = fn;
  }

  public afterEachIntegration(fn: () => Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('afterEachIntegration() must be called within a describeIntegration() block');
    }
    this.currentSuite.afterEach = fn;
  }

  public mockService(serviceName: string, implementation: any) {
    this.mocks.set(serviceName, implementation);
  }

  public mockAPI(endpoint: string, response: any, status: number = 200) {
    this.mocks.set(`api_${endpoint}`, { response, status });
  }

  public mockDatabase(tableName: string, data: any[]) {
    const table = this.mocks.get('database')[tableName];
    if (table) {
      table.clear().then(() => {
        data.forEach(record => table.insert(record));
      });
    }
  }

  public async run(): Promise<IntegrationTestStats> {
    const startTime = Date.now();
    
    console.log('🔗 Running integration tests...\n');
    
    for (const suite of this.suites) {
      await this.runSuite(suite);
    }
    
    this.stats.duration = Date.now() - startTime;
    this.stats.total = this.results.length;
    this.stats.passed = this.results.filter(r => r.status === 'passed').length;
    this.stats.failed = this.results.filter(r => r.status === 'failed').length;
    this.stats.skipped = this.results.filter(r => r.status === 'skipped').length;
    this.stats.apiCalls = this.apiCalls.length;
    this.stats.databaseQueries = this.databaseQueries.length;
    this.stats.averageResponseTime = this.calculateAverageResponseTime();
    
    this.printResults();
    
    return this.stats;
  }

  private async runSuite(suite: IntegrationTestSuite) {
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
      console.error(`Error in integration suite "${suite.name}":`, error);
    }
  }

  private async runTest(suite: IntegrationTestSuite, test: IntegrationTest) {
    const startTime = Date.now();
    const result: IntegrationTestResult = {
      name: `${suite.name} - ${test.name}`,
      status: 'pending',
      duration: 0,
      dependencies: test.dependencies,
    };
    
    this.currentTest = test;
    
    try {
      // Ejecutar beforeEach
      if (suite.beforeEach) {
        await suite.beforeEach();
      }
      
      // Ejecutar test
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Integration test timeout')), test.timeout);
      });
      
      await Promise.race([test.fn(), timeoutPromise]);
      
      result.status = 'passed';
      result.apiCalls = [...this.apiCalls];
      result.databaseQueries = [...this.databaseQueries];
      
      // Ejecutar afterEach
      if (suite.afterEach) {
        await suite.afterEach();
      }
      
    } catch (error) {
      result.status = 'failed';
      result.error = error as Error;
      result.apiCalls = [...this.apiCalls];
      result.databaseQueries = [...this.databaseQueries];
    } finally {
      result.duration = Date.now() - startTime;
      this.results.push(result);
      this.currentTest = null;
      
      // Limpiar llamadas de API y queries para el siguiente test
      this.apiCalls = [];
      this.databaseQueries = [];
    }
  }

  private calculateAverageResponseTime(): number {
    if (this.apiCalls.length === 0) return 0;
    
    const totalTime = this.apiCalls.reduce((sum, call) => sum + call.duration, 0);
    return totalTime / this.apiCalls.length;
  }

  private printResults() {
    console.log('\n📊 Integration Test Results:');
    console.log(`Total: ${this.stats.total}`);
    console.log(`✅ Passed: ${this.stats.passed}`);
    console.log(`❌ Failed: ${this.stats.failed}`);
    console.log(`⏭️ Skipped: ${this.stats.skipped}`);
    console.log(`⏱️ Duration: ${this.stats.duration}ms`);
    console.log(`🌐 API Calls: ${this.stats.apiCalls}`);
    console.log(`🗄️ Database Queries: ${this.stats.databaseQueries}`);
    console.log(`⚡ Average Response Time: ${this.stats.averageResponseTime.toFixed(2)}ms`);
    
    if (this.stats.failed > 0) {
      console.log('\n❌ Failed Integration Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  • ${result.name}`);
          if (result.error) {
            console.log(`    ${result.error.message}`);
          }
          if (result.apiCalls && result.apiCalls.length > 0) {
            console.log(`    API Calls: ${result.apiCalls.length}`);
          }
          if (result.databaseQueries && result.databaseQueries.length > 0) {
            console.log(`    Database Queries: ${result.databaseQueries.length}`);
          }
        });
    }
  }

  public getResults(): IntegrationTestResult[] {
    return [...this.results];
  }

  public getStats(): IntegrationTestStats {
    return { ...this.stats };
  }

  public getAPICalls(): APICall[] {
    return [...this.apiCalls];
  }

  public getDatabaseQueries(): DatabaseQuery[] {
    return [...this.databaseQueries];
  }

  public clear() {
    this.suites = [];
    this.results = [];
    this.apiCalls = [];
    this.databaseQueries = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      apiCalls: 0,
      databaseQueries: 0,
      averageResponseTime: 0,
    };
  }
}

// Instancia singleton
let integrationTestRunnerInstance: IntegrationTestRunner | null = null;

export function getIntegrationTestRunner(): IntegrationTestRunner {
  if (!integrationTestRunnerInstance) {
    integrationTestRunnerInstance = new IntegrationTestRunner();
  }
  return integrationTestRunnerInstance;
}

// Funciones de conveniencia
export const runIntegrationTests = () => getIntegrationTestRunner().run();
export const clearIntegrationTests = () => getIntegrationTestRunner().clear();
export const getIntegrationTestResults = () => getIntegrationTestRunner().getResults();
export const getIntegrationTestStats = () => getIntegrationTestRunner().getStats();

export default IntegrationTestRunner;

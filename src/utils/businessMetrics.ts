/**
 * Sistema de métricas de negocio para Sensus
 * Proporciona funcionalidades de KPIs, métricas de ingresos y análisis de negocio
 */

export interface BusinessMetric {
  id: string;
  name: string;
  description: string;
  category: 'revenue' | 'users' | 'engagement' | 'conversion' | 'retention' | 'performance' | 'cost' | 'quality';
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  unit: string;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  calculatedAt: string;
  metadata: Record<string, any>;
}

export interface RevenueMetric {
  id: string;
  period: string;
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  churnRate: number;
  customerLifetimeValue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  revenueBySource: Array<{ source: string; amount: number; percentage: number }>;
  revenueByRegion: Array<{ region: string; amount: number; percentage: number }>;
  revenueByProduct: Array<{ product: string; amount: number; percentage: number }>;
  metadata: Record<string, any>;
}

export interface UserMetric {
  id: string;
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  churnedUsers: number;
  userGrowth: number;
  userRetention: number;
  averageSessionDuration: number;
  sessionsPerUser: number;
  pageViewsPerUser: number;
  usersBySource: Array<{ source: string; count: number; percentage: number }>;
  usersByRegion: Array<{ region: string; count: number; percentage: number }>;
  usersByDevice: Array<{ device: string; count: number; percentage: number }>;
  metadata: Record<string, any>;
}

export interface ConversionMetric {
  id: string;
  funnelId: string;
  period: string;
  totalVisitors: number;
  totalConversions: number;
  conversionRate: number;
  costPerAcquisition: number;
  revenuePerConversion: number;
  conversionBySource: Array<{ source: string; conversions: number; rate: number }>;
  conversionByDevice: Array<{ device: string; conversions: number; rate: number }>;
  conversionByRegion: Array<{ region: string; conversions: number; rate: number }>;
  averageTimeToConvert: number;
  metadata: Record<string, any>;
}

export interface EngagementMetric {
  id: string;
  period: string;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  sessionsPerUser: number;
  pageViewsPerSession: number;
  bounceRate: number;
  returnRate: number;
  engagementScore: number;
  topPages: Array<{ page: string; views: number; timeOnPage: number }>;
  topFeatures: Array<{ feature: string; usage: number; satisfaction: number }>;
  userSegments: Array<{ segment: string; count: number; engagement: number }>;
  metadata: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  period: string;
  pageLoadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  serverResponseTime: number;
  errorRate: number;
  uptime: number;
  throughput: number;
  performanceScore: number;
  performanceByPage: Array<{ page: string; score: number; loadTime: number }>;
  performanceByDevice: Array<{ device: string; score: number; loadTime: number }>;
  metadata: Record<string, any>;
}

export interface CostMetric {
  id: string;
  period: string;
  totalCost: number;
  infrastructureCost: number;
  marketingCost: number;
  personnelCost: number;
  operationalCost: number;
  costPerUser: number;
  costPerAcquisition: number;
  costPerSession: number;
  costGrowth: number;
  costByCategory: Array<{ category: string; amount: number; percentage: number }>;
  costByRegion: Array<{ region: string; amount: number; percentage: number }>;
  costEfficiency: number;
  metadata: Record<string, any>;
}

export interface QualityMetric {
  id: string;
  period: string;
  customerSatisfaction: number;
  netPromoterScore: number;
  customerEffortScore: number;
  supportTickets: number;
  bugReports: number;
  featureRequests: number;
  resolutionTime: number;
  satisfactionByFeature: Array<{ feature: string; satisfaction: number; usage: number }>;
  satisfactionByUserSegment: Array<{ segment: string; satisfaction: number; count: number }>;
  qualityScore: number;
  metadata: Record<string, any>;
}

export interface BusinessDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  filters: DashboardFilter[];
  refreshInterval: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'gauge' | 'kpi' | 'alert';
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
  refreshInterval?: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
  responsive: boolean;
}

export interface DashboardFilter {
  id: string;
  name: string;
  type: 'date' | 'select' | 'multiselect' | 'range' | 'text';
  field: string;
  options?: string[];
  defaultValue?: any;
}

export interface BusinessMetricsConfig {
  collection: {
    enableRealTimeCollection: boolean;
    collectionInterval: number; // minutos
    enableHistoricalData: boolean;
    retentionPeriod: number; // días
  };
  calculation: {
    enableAutomatedCalculation: boolean;
    calculationInterval: number; // minutos
    enableTrendAnalysis: boolean;
    enableForecasting: boolean;
  };
  alerting: {
    enableAlerts: boolean;
    alertThresholds: Record<string, { warning: number; critical: number }>;
    notificationChannels: string[];
  };
  reporting: {
    enableAutomatedReports: boolean;
    reportSchedule: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    reportRecipients: string[];
    includeCharts: boolean;
  };
}

export class BusinessMetricsService {
  private static instance: BusinessMetricsService;
  private metrics: Map<string, BusinessMetric> = new Map();
  private revenueMetrics: RevenueMetric[] = [];
  private userMetrics: UserMetric[] = [];
  private conversionMetrics: ConversionMetric[] = [];
  private engagementMetrics: EngagementMetric[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private costMetrics: CostMetric[] = [];
  private qualityMetrics: QualityMetric[] = [];
  private dashboards: Map<string, BusinessDashboard> = new Map();
  private config: BusinessMetricsConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultMetrics();
    this.setupDefaultDashboards();
    this.startMetricsCollection();
  }

  public static getInstance(): BusinessMetricsService {
    if (!BusinessMetricsService.instance) {
      BusinessMetricsService.instance = new BusinessMetricsService();
    }
    return BusinessMetricsService.instance;
  }

  private getDefaultConfig(): BusinessMetricsConfig {
    return {
      collection: {
        enableRealTimeCollection: true,
        collectionInterval: 5,
        enableHistoricalData: true,
        retentionPeriod: 2555, // 7 años
      },
      calculation: {
        enableAutomatedCalculation: true,
        calculationInterval: 15,
        enableTrendAnalysis: true,
        enableForecasting: true,
      },
      alerting: {
        enableAlerts: true,
        alertThresholds: {
          revenue_growth: { warning: -5, critical: -10 },
          user_retention: { warning: 70, critical: 60 },
          conversion_rate: { warning: 2, critical: 1 },
          error_rate: { warning: 5, critical: 10 },
        },
        notificationChannels: ['email', 'slack'],
      },
      reporting: {
        enableAutomatedReports: true,
        reportSchedule: 'weekly',
        reportRecipients: ['executives@sensus.com'],
        includeCharts: true,
      },
    };
  }

  private setupDefaultMetrics(): void {
    const defaultMetrics: BusinessMetric[] = [
      {
        id: 'revenue_growth',
        name: 'Revenue Growth',
        description: 'Monthly revenue growth percentage',
        category: 'revenue',
        type: 'gauge',
        value: 0,
        unit: '%',
        target: 10,
        threshold: { warning: 5, critical: 0 },
        period: 'monthly',
        calculatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: 'user_retention',
        name: 'User Retention',
        description: 'Percentage of users who return',
        category: 'retention',
        type: 'gauge',
        value: 0,
        unit: '%',
        target: 80,
        threshold: { warning: 70, critical: 60 },
        period: 'monthly',
        calculatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: 'conversion_rate',
        name: 'Conversion Rate',
        description: 'Overall conversion rate',
        category: 'conversion',
        type: 'gauge',
        value: 0,
        unit: '%',
        target: 5,
        threshold: { warning: 2, critical: 1 },
        period: 'daily',
        calculatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: 'customer_satisfaction',
        name: 'Customer Satisfaction',
        description: 'Average customer satisfaction score',
        category: 'quality',
        type: 'gauge',
        value: 0,
        unit: 'score',
        target: 4.5,
        threshold: { warning: 4.0, critical: 3.5 },
        period: 'monthly',
        calculatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: 'cost_per_acquisition',
        name: 'Cost Per Acquisition',
        description: 'Average cost to acquire a new customer',
        category: 'cost',
        type: 'gauge',
        value: 0,
        unit: '$',
        target: 50,
        threshold: { warning: 75, critical: 100 },
        period: 'monthly',
        calculatedAt: new Date().toISOString(),
        metadata: {},
      },
    ];

    defaultMetrics.forEach(metric => this.metrics.set(metric.id, metric));
  }

  private setupDefaultDashboards(): void {
    const executiveDashboard: BusinessDashboard = {
      id: 'executive-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level business metrics for executives',
      widgets: [
        {
          id: 'revenue-kpi',
          type: 'kpi',
          title: 'Monthly Revenue',
          dataSource: 'revenue_metrics',
          configuration: { metric: 'totalRevenue', format: 'currency' },
          position: { x: 0, y: 0, width: 2, height: 1 },
        },
        {
          id: 'user-growth-chart',
          type: 'chart',
          title: 'User Growth',
          dataSource: 'user_metrics',
          configuration: { type: 'line', metric: 'totalUsers' },
          position: { x: 2, y: 0, width: 2, height: 1 },
        },
        {
          id: 'conversion-rate-gauge',
          type: 'gauge',
          title: 'Conversion Rate',
          dataSource: 'conversion_metrics',
          configuration: { metric: 'conversionRate', max: 10 },
          position: { x: 0, y: 1, width: 1, height: 1 },
        },
        {
          id: 'satisfaction-score',
          type: 'metric',
          title: 'Customer Satisfaction',
          dataSource: 'quality_metrics',
          configuration: { metric: 'customerSatisfaction', format: 'decimal' },
          position: { x: 1, y: 1, width: 1, height: 1 },
        },
      ],
      layout: { columns: 4, rows: 2, gridSize: 1, responsive: true },
      filters: [
        {
          id: 'date-range',
          name: 'Date Range',
          type: 'date',
          field: 'period',
          defaultValue: 'last_30_days',
        },
      ],
      refreshInterval: 300000, // 5 minutos
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system',
    };

    this.dashboards.set(executiveDashboard.id, executiveDashboard);
  }

  private startMetricsCollection(): void {
    if (!this.config.collection.enableRealTimeCollection) return;

    // Recolección de métricas en tiempo real
    setInterval(() => {
      this.collectRealTimeMetrics();
    }, this.config.collection.collectionInterval * 60 * 1000);

    // Cálculo automático de métricas
    if (this.config.calculation.enableAutomatedCalculation) {
      setInterval(() => {
        this.calculateMetrics();
      }, this.config.calculation.calculationInterval * 60 * 1000);
    }

    // Generación de reportes automáticos
    if (this.config.reporting.enableAutomatedReports) {
      setInterval(() => {
        this.generateAutomatedReports();
      }, 24 * 60 * 60 * 1000); // Diariamente
    }
  }

  // Métodos de recolección de métricas
  public async collectRevenueMetrics(period: string): Promise<RevenueMetric> {
    const revenueMetric: RevenueMetric = {
      id: this.generateMetricId(),
      period,
      totalRevenue: Math.floor(Math.random() * 100000) + 50000,
      recurringRevenue: Math.floor(Math.random() * 80000) + 40000,
      oneTimeRevenue: Math.floor(Math.random() * 20000) + 10000,
      averageRevenuePerUser: Math.floor(Math.random() * 100) + 50,
      revenueGrowth: Math.random() * 20 - 5, // -5% a 15%
      churnRate: Math.random() * 10, // 0% a 10%
      customerLifetimeValue: Math.floor(Math.random() * 1000) + 500,
      monthlyRecurringRevenue: Math.floor(Math.random() * 50000) + 25000,
      annualRecurringRevenue: Math.floor(Math.random() * 600000) + 300000,
      revenueBySource: [
        { source: 'subscriptions', amount: Math.floor(Math.random() * 50000) + 25000, percentage: 60 },
        { source: 'one-time', amount: Math.floor(Math.random() * 20000) + 10000, percentage: 25 },
        { source: 'add-ons', amount: Math.floor(Math.random() * 15000) + 5000, percentage: 15 },
      ],
      revenueByRegion: [
        { region: 'North America', amount: Math.floor(Math.random() * 40000) + 20000, percentage: 50 },
        { region: 'Europe', amount: Math.floor(Math.random() * 30000) + 15000, percentage: 35 },
        { region: 'Asia', amount: Math.floor(Math.random() * 20000) + 10000, percentage: 15 },
      ],
      revenueByProduct: [
        { product: 'Basic Plan', amount: Math.floor(Math.random() * 30000) + 15000, percentage: 40 },
        { product: 'Pro Plan', amount: Math.floor(Math.random() * 40000) + 20000, percentage: 45 },
        { product: 'Enterprise', amount: Math.floor(Math.random() * 20000) + 10000, percentage: 15 },
      ],
      metadata: {},
    };

    this.revenueMetrics.push(revenueMetric);
    return revenueMetric;
  }

  public async collectUserMetrics(period: string): Promise<UserMetric> {
    const userMetric: UserMetric = {
      id: this.generateMetricId(),
      period,
      totalUsers: Math.floor(Math.random() * 10000) + 5000,
      newUsers: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 5000) + 2500,
      returningUsers: Math.floor(Math.random() * 3000) + 1500,
      churnedUsers: Math.floor(Math.random() * 200) + 100,
      userGrowth: Math.random() * 30 - 5, // -5% a 25%
      userRetention: Math.random() * 40 + 60, // 60% a 100%
      averageSessionDuration: Math.floor(Math.random() * 600) + 300, // 5-15 minutos
      sessionsPerUser: Math.random() * 5 + 2, // 2-7 sesiones
      pageViewsPerUser: Math.floor(Math.random() * 20) + 10, // 10-30 páginas
      usersBySource: [
        { source: 'organic', count: Math.floor(Math.random() * 3000) + 1500, percentage: 40 },
        { source: 'paid', count: Math.floor(Math.random() * 2000) + 1000, percentage: 25 },
        { source: 'social', count: Math.floor(Math.random() * 1500) + 750, percentage: 20 },
        { source: 'referral', count: Math.floor(Math.random() * 1000) + 500, percentage: 15 },
      ],
      usersByRegion: [
        { region: 'North America', count: Math.floor(Math.random() * 4000) + 2000, percentage: 50 },
        { region: 'Europe', count: Math.floor(Math.random() * 3000) + 1500, percentage: 35 },
        { region: 'Asia', count: Math.floor(Math.random() * 2000) + 1000, percentage: 15 },
      ],
      usersByDevice: [
        { device: 'desktop', count: Math.floor(Math.random() * 4000) + 2000, percentage: 50 },
        { device: 'mobile', count: Math.floor(Math.random() * 3000) + 1500, percentage: 35 },
        { device: 'tablet', count: Math.floor(Math.random() * 1000) + 500, percentage: 15 },
      ],
      metadata: {},
    };

    this.userMetrics.push(userMetric);
    return userMetric;
  }

  public async collectConversionMetrics(funnelId: string, period: string): Promise<ConversionMetric> {
    const conversionMetric: ConversionMetric = {
      id: this.generateMetricId(),
      funnelId,
      period,
      totalVisitors: Math.floor(Math.random() * 10000) + 5000,
      totalConversions: Math.floor(Math.random() * 500) + 250,
      conversionRate: Math.random() * 10, // 0% a 10%
      costPerAcquisition: Math.floor(Math.random() * 100) + 25, // $25-$125
      revenuePerConversion: Math.floor(Math.random() * 200) + 100, // $100-$300
      conversionBySource: [
        { source: 'organic', conversions: Math.floor(Math.random() * 200) + 100, rate: Math.random() * 8 + 2 },
        { source: 'paid', conversions: Math.floor(Math.random() * 150) + 75, rate: Math.random() * 12 + 3 },
        { source: 'social', conversions: Math.floor(Math.random() * 100) + 50, rate: Math.random() * 6 + 1 },
        { source: 'referral', conversions: Math.floor(Math.random() * 75) + 25, rate: Math.random() * 10 + 2 },
      ],
      conversionByDevice: [
        { device: 'desktop', conversions: Math.floor(Math.random() * 200) + 100, rate: Math.random() * 8 + 2 },
        { device: 'mobile', conversions: Math.floor(Math.random() * 150) + 75, rate: Math.random() * 6 + 1 },
        { device: 'tablet', conversions: Math.floor(Math.random() * 50) + 25, rate: Math.random() * 4 + 1 },
      ],
      conversionByRegion: [
        { region: 'North America', conversions: Math.floor(Math.random() * 200) + 100, rate: Math.random() * 8 + 2 },
        { region: 'Europe', conversions: Math.floor(Math.random() * 150) + 75, rate: Math.random() * 7 + 2 },
        { region: 'Asia', conversions: Math.floor(Math.random() * 100) + 50, rate: Math.random() * 6 + 1 },
      ],
      averageTimeToConvert: Math.floor(Math.random() * 1800) + 300, // 5-35 minutos
      metadata: {},
    };

    this.conversionMetrics.push(conversionMetric);
    return conversionMetric;
  }

  public async collectEngagementMetrics(period: string): Promise<EngagementMetric> {
    const engagementMetric: EngagementMetric = {
      id: this.generateMetricId(),
      period,
      dailyActiveUsers: Math.floor(Math.random() * 2000) + 1000,
      weeklyActiveUsers: Math.floor(Math.random() * 5000) + 2500,
      monthlyActiveUsers: Math.floor(Math.random() * 8000) + 4000,
      averageSessionDuration: Math.floor(Math.random() * 600) + 300, // 5-15 minutos
      sessionsPerUser: Math.random() * 5 + 2, // 2-7 sesiones
      pageViewsPerSession: Math.floor(Math.random() * 10) + 5, // 5-15 páginas
      bounceRate: Math.random() * 50 + 20, // 20%-70%
      returnRate: Math.random() * 40 + 30, // 30%-70%
      engagementScore: Math.random() * 40 + 60, // 60-100
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 5000) + 2500, timeOnPage: Math.floor(Math.random() * 300) + 60 },
        { page: '/features', views: Math.floor(Math.random() * 2000) + 1000, timeOnPage: Math.floor(Math.random() * 600) + 120 },
        { page: '/pricing', views: Math.floor(Math.random() * 1500) + 750, timeOnPage: Math.floor(Math.random() * 900) + 180 },
        { page: '/about', views: Math.floor(Math.random() * 1000) + 500, timeOnPage: Math.floor(Math.random() * 180) + 60 },
      ],
      topFeatures: [
        { feature: 'Dashboard', usage: Math.floor(Math.random() * 1000) + 500, satisfaction: Math.random() * 2 + 3 },
        { feature: 'Analytics', usage: Math.floor(Math.random() * 800) + 400, satisfaction: Math.random() * 2 + 3 },
        { feature: 'Reports', usage: Math.floor(Math.random() * 600) + 300, satisfaction: Math.random() * 2 + 3 },
        { feature: 'Settings', usage: Math.floor(Math.random() * 400) + 200, satisfaction: Math.random() * 2 + 3 },
      ],
      userSegments: [
        { segment: 'power_users', count: Math.floor(Math.random() * 500) + 250, engagement: Math.random() * 20 + 80 },
        { segment: 'regular_users', count: Math.floor(Math.random() * 1000) + 500, engagement: Math.random() * 30 + 50 },
        { segment: 'casual_users', count: Math.floor(Math.random() * 1500) + 750, engagement: Math.random() * 40 + 30 },
        { segment: 'new_users', count: Math.floor(Math.random() * 800) + 400, engagement: Math.random() * 50 + 20 },
      ],
      metadata: {},
    };

    this.engagementMetrics.push(engagementMetric);
    return engagementMetric;
  }

  public async collectPerformanceMetrics(period: string): Promise<PerformanceMetric> {
    const performanceMetric: PerformanceMetric = {
      id: this.generateMetricId(),
      period,
      pageLoadTime: Math.random() * 2000 + 500, // 0.5-2.5 segundos
      timeToInteractive: Math.random() * 3000 + 1000, // 1-4 segundos
      firstContentfulPaint: Math.random() * 1500 + 500, // 0.5-2 segundos
      largestContentfulPaint: Math.random() * 2500 + 1000, // 1-3.5 segundos
      cumulativeLayoutShift: Math.random() * 0.2, // 0-0.2
      firstInputDelay: Math.random() * 100 + 10, // 10-110ms
      serverResponseTime: Math.random() * 500 + 100, // 100-600ms
      errorRate: Math.random() * 5, // 0-5%
      uptime: Math.random() * 5 + 95, // 95-100%
      throughput: Math.floor(Math.random() * 1000) + 500, // 500-1500 req/s
      performanceScore: Math.random() * 40 + 60, // 60-100
      performanceByPage: [
        { page: '/', score: Math.random() * 40 + 60, loadTime: Math.random() * 2000 + 500 },
        { page: '/features', score: Math.random() * 40 + 60, loadTime: Math.random() * 2500 + 750 },
        { page: '/pricing', score: Math.random() * 40 + 60, loadTime: Math.random() * 3000 + 1000 },
        { page: '/dashboard', score: Math.random() * 40 + 60, loadTime: Math.random() * 4000 + 1500 },
      ],
      performanceByDevice: [
        { device: 'desktop', score: Math.random() * 30 + 70, loadTime: Math.random() * 1500 + 500 },
        { device: 'mobile', score: Math.random() * 40 + 50, loadTime: Math.random() * 3000 + 1000 },
        { device: 'tablet', score: Math.random() * 35 + 55, loadTime: Math.random() * 2500 + 750 },
      ],
      metadata: {},
    };

    this.performanceMetrics.push(performanceMetric);
    return performanceMetric;
  }

  public async collectCostMetrics(period: string): Promise<CostMetric> {
    const costMetric: CostMetric = {
      id: this.generateMetricId(),
      period,
      totalCost: Math.floor(Math.random() * 50000) + 25000, // $25k-$75k
      infrastructureCost: Math.floor(Math.random() * 20000) + 10000, // $10k-$30k
      marketingCost: Math.floor(Math.random() * 15000) + 7500, // $7.5k-$22.5k
      personnelCost: Math.floor(Math.random() * 10000) + 5000, // $5k-$15k
      operationalCost: Math.floor(Math.random() * 5000) + 2500, // $2.5k-$7.5k
      costPerUser: Math.random() * 10 + 5, // $5-$15
      costPerAcquisition: Math.random() * 50 + 25, // $25-$75
      costPerSession: Math.random() * 2 + 0.5, // $0.5-$2.5
      costGrowth: Math.random() * 20 - 5, // -5% a 15%
      costByCategory: [
        { category: 'Infrastructure', amount: Math.floor(Math.random() * 20000) + 10000, percentage: 40 },
        { category: 'Marketing', amount: Math.floor(Math.random() * 15000) + 7500, percentage: 30 },
        { category: 'Personnel', amount: Math.floor(Math.random() * 10000) + 5000, percentage: 20 },
        { category: 'Operations', amount: Math.floor(Math.random() * 5000) + 2500, percentage: 10 },
      ],
      costByRegion: [
        { region: 'North America', amount: Math.floor(Math.random() * 25000) + 12500, percentage: 50 },
        { region: 'Europe', amount: Math.floor(Math.random() * 15000) + 7500, percentage: 30 },
        { region: 'Asia', amount: Math.floor(Math.random() * 10000) + 5000, percentage: 20 },
      ],
      costEfficiency: Math.random() * 40 + 60, // 60-100%
      metadata: {},
    };

    this.costMetrics.push(costMetric);
    return costMetric;
  }

  public async collectQualityMetrics(period: string): Promise<QualityMetric> {
    const qualityMetric: QualityMetric = {
      id: this.generateMetricId(),
      period,
      customerSatisfaction: Math.random() * 2 + 3, // 3-5
      netPromoterScore: Math.random() * 60 - 20, // -20 a 40
      customerEffortScore: Math.random() * 3 + 1, // 1-4
      supportTickets: Math.floor(Math.random() * 200) + 100, // 100-300
      bugReports: Math.floor(Math.random() * 50) + 25, // 25-75
      featureRequests: Math.floor(Math.random() * 100) + 50, // 50-150
      resolutionTime: Math.floor(Math.random() * 24) + 2, // 2-26 horas
      satisfactionByFeature: [
        { feature: 'Dashboard', satisfaction: Math.random() * 2 + 3, usage: Math.floor(Math.random() * 1000) + 500 },
        { feature: 'Analytics', satisfaction: Math.random() * 2 + 3, usage: Math.floor(Math.random() * 800) + 400 },
        { feature: 'Reports', satisfaction: Math.random() * 2 + 3, usage: Math.floor(Math.random() * 600) + 300 },
        { feature: 'Settings', satisfaction: Math.random() * 2 + 3, usage: Math.floor(Math.random() * 400) + 200 },
      ],
      satisfactionByUserSegment: [
        { segment: 'enterprise', satisfaction: Math.random() * 2 + 3, count: Math.floor(Math.random() * 100) + 50 },
        { segment: 'pro', satisfaction: Math.random() * 2 + 3, count: Math.floor(Math.random() * 200) + 100 },
        { segment: 'basic', satisfaction: Math.random() * 2 + 3, count: Math.floor(Math.random() * 300) + 150 },
      ],
      qualityScore: Math.random() * 40 + 60, // 60-100
      metadata: {},
    };

    this.qualityMetrics.push(qualityMetric);
    return qualityMetric;
  }

  // Métodos de análisis y cálculo
  private async collectRealTimeMetrics(): Promise<void> {
    const currentPeriod = new Date().toISOString().split('T')[0];

    try {
      await Promise.all([
        this.collectRevenueMetrics(currentPeriod),
        this.collectUserMetrics(currentPeriod),
        this.collectEngagementMetrics(currentPeriod),
        this.collectPerformanceMetrics(currentPeriod),
        this.collectCostMetrics(currentPeriod),
        this.collectQualityMetrics(currentPeriod),
      ]);

      console.log('Real-time metrics collected successfully');
    } catch (error) {
      console.error('Error collecting real-time metrics:', error);
    }
  }

  private async calculateMetrics(): Promise<void> {
    // Calcular métricas derivadas
    this.calculateDerivedMetrics();
    
    // Verificar alertas
    if (this.config.alerting.enableAlerts) {
      this.checkAlerts();
    }

    console.log('Metrics calculated successfully');
  }

  private calculateDerivedMetrics(): void {
    // Calcular métricas derivadas basadas en datos recopilados
    const latestRevenue = this.revenueMetrics[this.revenueMetrics.length - 1];
    const latestUsers = this.userMetrics[this.userMetrics.length - 1];
    const latestConversion = this.conversionMetrics[this.conversionMetrics.length - 1];
    const latestQuality = this.qualityMetrics[this.qualityMetrics.length - 1];
    const latestCost = this.costMetrics[this.costMetrics.length - 1];

    if (latestRevenue) {
      const revenueMetric = this.metrics.get('revenue_growth');
      if (revenueMetric) {
        revenueMetric.value = latestRevenue.revenueGrowth;
        revenueMetric.calculatedAt = new Date().toISOString();
      }
    }

    if (latestUsers) {
      const retentionMetric = this.metrics.get('user_retention');
      if (retentionMetric) {
        retentionMetric.value = latestUsers.userRetention;
        retentionMetric.calculatedAt = new Date().toISOString();
      }
    }

    if (latestConversion) {
      const conversionMetric = this.metrics.get('conversion_rate');
      if (conversionMetric) {
        conversionMetric.value = latestConversion.conversionRate;
        conversionMetric.calculatedAt = new Date().toISOString();
      }
    }

    if (latestQuality) {
      const satisfactionMetric = this.metrics.get('customer_satisfaction');
      if (satisfactionMetric) {
        satisfactionMetric.value = latestQuality.customerSatisfaction;
        satisfactionMetric.calculatedAt = new Date().toISOString();
      }
    }

    if (latestCost) {
      const costMetric = this.metrics.get('cost_per_acquisition');
      if (costMetric) {
        costMetric.value = latestCost.costPerAcquisition;
        costMetric.calculatedAt = new Date().toISOString();
      }
    }
  }

  private checkAlerts(): void {
    this.metrics.forEach(metric => {
      const threshold = this.config.alerting.alertThresholds[metric.id];
      if (!threshold) return;

      if (metric.value <= threshold.critical) {
        this.triggerAlert(metric, 'critical');
      } else if (metric.value <= threshold.warning) {
        this.triggerAlert(metric, 'warning');
      }
    });
  }

  private triggerAlert(metric: BusinessMetric, level: 'warning' | 'critical'): void {
    console.log(`${level.toUpperCase()} ALERT: ${metric.name} is ${metric.value}${metric.unit}`);
    
    // En un entorno real, esto enviaría notificaciones
    if (this.config.alerting.notificationChannels.includes('email')) {
      console.log('Sending email alert');
    }
    if (this.config.alerting.notificationChannels.includes('slack')) {
      console.log('Sending Slack alert');
    }
  }

  private async generateAutomatedReports(): Promise<void> {
    console.log('Generating automated business reports...');
    
    // Generar reportes basados en la configuración
    const reportData = {
      period: new Date().toISOString().split('T')[0],
      revenue: this.revenueMetrics[this.revenueMetrics.length - 1],
      users: this.userMetrics[this.userMetrics.length - 1],
      engagement: this.engagementMetrics[this.engagementMetrics.length - 1],
      performance: this.performanceMetrics[this.performanceMetrics.length - 1],
      cost: this.costMetrics[this.costMetrics.length - 1],
      quality: this.qualityMetrics[this.qualityMetrics.length - 1],
    };

    console.log('Automated report generated:', reportData);
  }

  // Métodos de gestión de dashboards
  public async createDashboard(dashboard: Omit<BusinessDashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessDashboard> {
    const newDashboard: BusinessDashboard = {
      ...dashboard,
      id: this.generateDashboardId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.dashboards.set(newDashboard.id, newDashboard);
    return newDashboard;
  }

  public async updateDashboard(id: string, updates: Partial<BusinessDashboard>): Promise<boolean> {
    const dashboard = this.dashboards.get(id);
    if (!dashboard) return false;

    const updatedDashboard = { ...dashboard, ...updates, updatedAt: new Date().toISOString() };
    this.dashboards.set(id, updatedDashboard);
    return true;
  }

  public getDashboard(id: string): BusinessDashboard | undefined {
    return this.dashboards.get(id);
  }

  public getDashboards(): BusinessDashboard[] {
    return Array.from(this.dashboards.values());
  }

  // Métodos de utilidad
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDashboardId(): string {
    return `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getMetrics(): BusinessMetric[] {
    return Array.from(this.metrics.values());
  }

  public getRevenueMetrics(): RevenueMetric[] {
    return [...this.revenueMetrics];
  }

  public getUserMetrics(): UserMetric[] {
    return [...this.userMetrics];
  }

  public getConversionMetrics(): ConversionMetric[] {
    return [...this.conversionMetrics];
  }

  public getEngagementMetrics(): EngagementMetric[] {
    return [...this.engagementMetrics];
  }

  public getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  public getCostMetrics(): CostMetric[] {
    return [...this.costMetrics];
  }

  public getQualityMetrics(): QualityMetric[] {
    return [...this.qualityMetrics];
  }

  public getConfig(): BusinessMetricsConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<BusinessMetricsConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const businessMetrics = BusinessMetricsService.getInstance();

export default BusinessMetricsService;

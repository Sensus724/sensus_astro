/**
 * Configuración de monitoreo para Sensus
 * Define configuraciones para logging, métricas, alertas y monitoreo de rendimiento
 */

import type { MonitoringConfig } from '../utils/monitoring';
import type { AlertRule } from '../utils/alerting';

export const MONITORING_CONFIG: MonitoringConfig = {
  logging: {
    level: process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug' || 'info',
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
    enableRemote: process.env.ENABLE_REMOTE_LOGGING === 'true',
    remoteUrl: process.env.LOGGING_ENDPOINT || '/api/logs',
    batchSize: parseInt(process.env.LOG_BATCH_SIZE || '10'),
    flushInterval: parseInt(process.env.LOG_FLUSH_INTERVAL || '30000'),
  },
  metrics: {
    enableMetrics: process.env.ENABLE_METRICS !== 'false',
    enableCustomMetrics: process.env.ENABLE_CUSTOM_METRICS !== 'false',
    sampleRate: parseFloat(process.env.METRICS_SAMPLE_RATE || '1.0'),
    batchSize: parseInt(process.env.METRICS_BATCH_SIZE || '20'),
    flushInterval: parseInt(process.env.METRICS_FLUSH_INTERVAL || '60000'),
  },
  alerts: {
    enableAlerts: process.env.ENABLE_ALERTS !== 'false',
    rules: [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds 10 errors per minute',
        condition: 'level:error',
        threshold: 10,
        severity: 'high',
        enabled: true,
        channels: ['slack', 'discord'],
        cooldown: 15,
      },
      {
        id: 'slow-response-time',
        name: 'Slow Response Time',
        description: 'Alert when average response time exceeds 2 seconds',
        condition: 'response_time:gt:2000',
        threshold: 2000,
        severity: 'medium',
        enabled: true,
        channels: ['slack'],
        cooldown: 10,
      },
      {
        id: 'high-memory-usage',
        name: 'High Memory Usage',
        description: 'Alert when memory usage exceeds 80%',
        condition: 'memory:gt:80',
        threshold: 80,
        severity: 'high',
        enabled: true,
        channels: ['slack', 'discord'],
        cooldown: 5,
      },
      {
        id: 'low-core-web-vitals',
        name: 'Poor Core Web Vitals',
        description: 'Alert when Core Web Vitals are poor',
        condition: 'webvitals:poor',
        threshold: 0,
        severity: 'medium',
        enabled: true,
        channels: ['slack'],
        cooldown: 30,
      },
    ],
    channels: {
      slack: process.env.SLACK_WEBHOOK_URL,
      discord: process.env.DISCORD_WEBHOOK_URL,
      email: process.env.EMAIL_SMTP_URL,
      webhook: process.env.WEBHOOK_URL,
    },
  },
  performance: {
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
    enableCoreWebVitals: process.env.ENABLE_CORE_WEB_VITALS !== 'false',
    enableResourceTiming: process.env.ENABLE_RESOURCE_TIMING !== 'false',
    enableUserTiming: process.env.ENABLE_USER_TIMING !== 'false',
  },
  errors: {
    enableErrorTracking: process.env.ENABLE_ERROR_TRACKING !== 'false',
    enableCrashReporting: process.env.ENABLE_CRASH_REPORTING !== 'false',
    enableSourceMaps: process.env.ENABLE_SOURCE_MAPS !== 'false',
    sampleRate: parseFloat(process.env.ERROR_SAMPLE_RATE || '1.0'),
  },
};

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'critical-error',
    name: 'Critical Error',
    description: 'Alert when critical errors occur',
    source: 'application',
    metric: 'error.critical',
    condition: 'gt',
    threshold: 1,
    severity: 'critical',
    enabled: true,
    tags: { component: 'error-handling', priority: 'critical' },
    channels: ['slack', 'discord', 'email'],
    escalationPolicy: {
      id: 'critical-escalation',
      name: 'Critical Escalation Policy',
      levels: [
        { level: 1, delay: 0, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 5, channels: ['discord'], actions: ['notify', 'escalate'] },
        { level: 3, delay: 10, channels: ['email'], actions: ['notify', 'escalate', 'page'] },
      ],
      maxLevel: 3,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Alert when error rate exceeds threshold',
    source: 'application',
    metric: 'error.rate',
    condition: 'gt',
    threshold: 10,
    severity: 'high',
    enabled: true,
    tags: { component: 'error-handling', priority: 'high' },
    channels: ['slack', 'discord'],
    escalationPolicy: {
      id: 'high-escalation',
      name: 'High Escalation Policy',
      levels: [
        { level: 1, delay: 5, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 15, channels: ['discord'], actions: ['notify', 'escalate'] },
        { level: 3, delay: 30, channels: ['email'], actions: ['notify', 'escalate'] },
      ],
      maxLevel: 3,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'slow-response-time',
    name: 'Slow Response Time',
    description: 'Alert when average response time exceeds threshold',
    source: 'performance',
    metric: 'response.time',
    condition: 'gt',
    threshold: 2000,
    severity: 'medium',
    enabled: true,
    tags: { component: 'performance', priority: 'medium' },
    channels: ['slack'],
    escalationPolicy: {
      id: 'medium-escalation',
      name: 'Medium Escalation Policy',
      levels: [
        { level: 1, delay: 10, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 30, channels: ['discord'], actions: ['notify'] },
      ],
      maxLevel: 2,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high-memory-usage',
    name: 'High Memory Usage',
    description: 'Alert when memory usage exceeds threshold',
    source: 'system',
    metric: 'memory.usage',
    condition: 'gt',
    threshold: 80,
    severity: 'high',
    enabled: true,
    tags: { component: 'system', priority: 'high' },
    channels: ['slack', 'discord'],
    escalationPolicy: {
      id: 'high-escalation',
      name: 'High Escalation Policy',
      levels: [
        { level: 1, delay: 5, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 15, channels: ['discord'], actions: ['notify', 'escalate'] },
        { level: 3, delay: 30, channels: ['email'], actions: ['notify', 'escalate'] },
      ],
      maxLevel: 3,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'poor-core-web-vitals',
    name: 'Poor Core Web Vitals',
    description: 'Alert when Core Web Vitals are poor',
    source: 'performance',
    metric: 'webvitals.score',
    condition: 'lt',
    threshold: 0.5,
    severity: 'medium',
    enabled: true,
    tags: { component: 'performance', priority: 'medium' },
    channels: ['slack'],
    escalationPolicy: {
      id: 'medium-escalation',
      name: 'Medium Escalation Policy',
      levels: [
        { level: 1, delay: 10, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 30, channels: ['discord'], actions: ['notify'] },
      ],
      maxLevel: 2,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'low-battery',
    name: 'Low Battery',
    description: 'Alert when device battery is low',
    source: 'device',
    metric: 'battery.level',
    condition: 'lt',
    threshold: 20,
    severity: 'low',
    enabled: true,
    tags: { component: 'device', priority: 'low' },
    channels: ['slack'],
    escalationPolicy: {
      id: 'low-escalation',
      name: 'Low Escalation Policy',
      levels: [
        { level: 1, delay: 15, channels: ['slack'], actions: ['notify'] },
      ],
      maxLevel: 1,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'offline-mode',
    name: 'Offline Mode',
    description: 'Alert when application goes offline',
    source: 'network',
    metric: 'network.status',
    condition: 'eq',
    threshold: 0,
    severity: 'medium',
    enabled: true,
    tags: { component: 'network', priority: 'medium' },
    channels: ['slack'],
    escalationPolicy: {
      id: 'medium-escalation',
      name: 'Medium Escalation Policy',
      levels: [
        { level: 1, delay: 5, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 15, channels: ['discord'], actions: ['notify'] },
      ],
      maxLevel: 2,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'high-cpu-usage',
    name: 'High CPU Usage',
    description: 'Alert when CPU usage exceeds threshold',
    source: 'system',
    metric: 'cpu.usage',
    condition: 'gt',
    threshold: 90,
    severity: 'high',
    enabled: true,
    tags: { component: 'system', priority: 'high' },
    channels: ['slack', 'discord'],
    escalationPolicy: {
      id: 'high-escalation',
      name: 'High Escalation Policy',
      levels: [
        { level: 1, delay: 5, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 15, channels: ['discord'], actions: ['notify', 'escalate'] },
        { level: 3, delay: 30, channels: ['email'], actions: ['notify', 'escalate'] },
      ],
      maxLevel: 3,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'slow-database-query',
    name: 'Slow Database Query',
    description: 'Alert when database queries are slow',
    source: 'database',
    metric: 'db.query.time',
    condition: 'gt',
    threshold: 5000,
    severity: 'medium',
    enabled: true,
    tags: { component: 'database', priority: 'medium' },
    channels: ['slack'],
    escalationPolicy: {
      id: 'medium-escalation',
      name: 'Medium Escalation Policy',
      levels: [
        { level: 1, delay: 10, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 30, channels: ['discord'], actions: ['notify'] },
      ],
      maxLevel: 2,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'failed-authentication',
    name: 'Failed Authentication',
    description: 'Alert when authentication failures exceed threshold',
    source: 'security',
    metric: 'auth.failure',
    condition: 'gt',
    threshold: 5,
    severity: 'high',
    enabled: true,
    tags: { component: 'security', priority: 'high' },
    channels: ['slack', 'discord', 'email'],
    escalationPolicy: {
      id: 'high-escalation',
      name: 'High Escalation Policy',
      levels: [
        { level: 1, delay: 0, channels: ['slack'], actions: ['notify'] },
        { level: 2, delay: 5, channels: ['discord'], actions: ['notify', 'escalate'] },
        { level: 3, delay: 10, channels: ['email'], actions: ['notify', 'escalate', 'page'] },
      ],
      maxLevel: 3,
      enabled: true,
    },
    suppressionRules: [],
    cooldown: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MONITORING_ENDPOINTS = {
  logs: '/api/logs',
  metrics: '/api/metrics',
  alerts: '/api/alerts',
  health: '/api/health',
  status: '/api/status',
  dashboard: '/api/dashboard',
  config: '/api/config',
  stats: '/api/stats',
} as const;

export const MONITORING_INTERVALS = {
  logFlush: 30000, // 30 segundos
  metricsFlush: 60000, // 1 minuto
  healthCheck: 30000, // 30 segundos
  statusUpdate: 10000, // 10 segundos
  dashboardRefresh: 5000, // 5 segundos
  alertCheck: 1000, // 1 segundo
} as const;

export const MONITORING_THRESHOLDS = {
  errorRate: 10, // errores por minuto
  responseTime: 2000, // milisegundos
  memoryUsage: 80, // porcentaje
  cpuUsage: 90, // porcentaje
  diskUsage: 85, // porcentaje
  networkLatency: 1000, // milisegundos
  coreWebVitals: {
    lcp: 2500, // milisegundos
    fid: 100, // milisegundos
    cls: 0.1, // score
    fcp: 1800, // milisegundos
  },
} as const;

export const MONITORING_TAGS = {
  environment: process.env.NODE_ENV || 'development',
  version: process.env.VERSION || '1.0.0',
  service: 'sensus',
  component: 'frontend',
  region: process.env.REGION || 'us-east-1',
  instance: process.env.INSTANCE_ID || 'local',
} as const;

export default MONITORING_CONFIG;

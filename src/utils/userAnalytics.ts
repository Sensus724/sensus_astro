/**
 * Sistema de analytics de usuario para Sensus
 * Proporciona funcionalidades de tracking, análisis de comportamiento y métricas de usuario
 */

export interface UserEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'page_view' | 'click' | 'scroll' | 'form_submit' | 'download' | 'search' | 'custom';
  eventName: string;
  timestamp: string;
  page: string;
  url: string;
  referrer?: string;
  userAgent: string;
  ipAddress: string;
  properties: Record<string, any>;
  metadata: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  pageViews: number;
  events: number;
  pages: string[];
  referrer?: string;
  userAgent: string;
  ipAddress: string;
  device: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screen: {
      width: number;
      height: number;
    };
  };
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  metadata: Record<string, any>;
}

export interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  createdAt: string;
  lastSeen: string;
  totalSessions: number;
  totalEvents: number;
  totalPageViews: number;
  averageSessionDuration: number;
  favoritePages: string[];
  behavior: {
    frequency: 'new' | 'returning' | 'regular' | 'churned';
    engagement: 'low' | 'medium' | 'high' | 'very_high';
    segment: string;
  };
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  preferences?: Record<string, any>;
  metadata: Record<string, any>;
}

export interface PageAnalytics {
  page: string;
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  topReferrers: Array<{ referrer: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
  events: Array<{ event: string; count: number }>;
  conversionRate?: number;
  metadata: Record<string, any>;
}

export interface FunnelStep {
  id: string;
  name: string;
  page: string;
  order: number;
  views: number;
  conversions: number;
  conversionRate: number;
  dropOffRate: number;
  averageTimeToNext: number;
  metadata: Record<string, any>;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  totalConversions: number;
  overallConversionRate: number;
  averageTimeToConvert: number;
  createdAt: string;
  updatedAt: string;
}

export interface CohortAnalysis {
  cohort: string;
  period: string;
  users: number;
  retention: number[];
  revenue?: number[];
  engagement?: number[];
  metadata: Record<string, any>;
}

export interface UserAnalyticsConfig {
  tracking: {
    enablePageTracking: boolean;
    enableEventTracking: boolean;
    enableSessionTracking: boolean;
    enableUserTracking: boolean;
    enableHeatmaps: boolean;
    enableScrollTracking: boolean;
    enableClickTracking: boolean;
    enableFormTracking: boolean;
  };
  privacy: {
    enableIPAnonymization: boolean;
    enableUserConsent: boolean;
    enableDataRetention: boolean;
    retentionPeriod: number; // días
    enableOptOut: boolean;
  };
  performance: {
    enableSampling: boolean;
    sampleRate: number;
    enableBatching: boolean;
    batchSize: number;
    flushInterval: number;
  };
  features: {
    enableRealTime: boolean;
    enableSegmentation: boolean;
    enableCohortAnalysis: boolean;
    enableFunnelAnalysis: boolean;
    enableA/BTesting: boolean;
  };
}

export class UserAnalyticsService {
  private static instance: UserAnalyticsService;
  private events: UserEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private conversionFunnels: Map<string, ConversionFunnel> = new Map();
  private config: UserAnalyticsConfig;
  private currentSession?: UserSession;
  private eventBuffer: UserEvent[] = [];
  private flushTimer?: number;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultFunnels();
    this.initializeSession();
    this.setupEventListeners();
    this.startAutoFlush();
  }

  public static getInstance(): UserAnalyticsService {
    if (!UserAnalyticsService.instance) {
      UserAnalyticsService.instance = new UserAnalyticsService();
    }
    return UserAnalyticsService.instance;
  }

  private getDefaultConfig(): UserAnalyticsConfig {
    return {
      tracking: {
        enablePageTracking: true,
        enableEventTracking: true,
        enableSessionTracking: true,
        enableUserTracking: true,
        enableHeatmaps: false,
        enableScrollTracking: true,
        enableClickTracking: true,
        enableFormTracking: true,
      },
      privacy: {
        enableIPAnonymization: true,
        enableUserConsent: true,
        enableDataRetention: true,
        retentionPeriod: 2555, // 7 años
        enableOptOut: true,
      },
      performance: {
        enableSampling: true,
        sampleRate: 0.1, // 10%
        enableBatching: true,
        batchSize: 20,
        flushInterval: 30000, // 30 segundos
      },
      features: {
        enableRealTime: true,
        enableSegmentation: true,
        enableCohortAnalysis: true,
        enableFunnelAnalysis: true,
        enableA/BTesting: false,
      },
    };
  }

  private setupDefaultFunnels(): void {
    const funnels: ConversionFunnel[] = [
      {
        id: 'user-registration',
        name: 'User Registration',
        description: 'Funnel de registro de usuarios',
        steps: [
          {
            id: 'landing-page',
            name: 'Landing Page',
            page: '/',
            order: 1,
            views: 0,
            conversions: 0,
            conversionRate: 0,
            dropOffRate: 0,
            averageTimeToNext: 0,
            metadata: {},
          },
          {
            id: 'signup-page',
            name: 'Sign Up Page',
            page: '/signup',
            order: 2,
            views: 0,
            conversions: 0,
            conversionRate: 0,
            dropOffRate: 0,
            averageTimeToNext: 0,
            metadata: {},
          },
          {
            id: 'verification',
            name: 'Email Verification',
            page: '/verify',
            order: 3,
            views: 0,
            conversions: 0,
            conversionRate: 0,
            dropOffRate: 0,
            averageTimeToNext: 0,
            metadata: {},
          },
          {
            id: 'onboarding',
            name: 'Onboarding',
            page: '/onboarding',
            order: 4,
            views: 0,
            conversions: 0,
            conversionRate: 0,
            dropOffRate: 0,
            averageTimeToNext: 0,
            metadata: {},
          },
        ],
        totalConversions: 0,
        overallConversionRate: 0,
        averageTimeToConvert: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    funnels.forEach(funnel => this.conversionFunnels.set(funnel.id, funnel));
  }

  private initializeSession(): void {
    if (!this.config.tracking.enableSessionTracking) return;

    const sessionId = this.generateSessionId();
    this.currentSession = {
      id: sessionId,
      startTime: new Date().toISOString(),
      pageViews: 0,
      events: 0,
      pages: [],
      userAgent: navigator.userAgent,
      ipAddress: this.getAnonymizedIP(),
      device: this.getDeviceInfo(),
      location: this.getLocationInfo(),
      metadata: {},
    };

    this.sessions.set(sessionId, this.currentSession);
  }

  private setupEventListeners(): void {
    if (!this.config.tracking.enableEventTracking) return;

    // Page view tracking
    if (this.config.tracking.enablePageTracking) {
      this.trackPageView();
    }

    // Click tracking
    if (this.config.tracking.enableClickTracking) {
      document.addEventListener('click', (event) => {
        this.trackClick(event);
      });
    }

    // Scroll tracking
    if (this.config.tracking.enableScrollTracking) {
      let scrollTimeout: number;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScroll();
        }, 1000);
      });
    }

    // Form tracking
    if (this.config.tracking.enableFormTracking) {
      document.addEventListener('submit', (event) => {
        this.trackFormSubmit(event);
      });
    }

    // Session end tracking
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private startAutoFlush(): void {
    if (!this.config.performance.enableBatching) return;

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.performance.flushInterval);
  }

  // Métodos de tracking
  public trackEvent(eventName: string, properties: Record<string, any> = {}, eventType: UserEvent['eventType'] = 'custom'): void {
    if (!this.config.tracking.enableEventTracking) return;
    if (this.config.performance.enableSampling && Math.random() > this.config.performance.sampleRate) return;

    const event: UserEvent = {
      id: this.generateEventId(),
      userId: this.getCurrentUserId(),
      sessionId: this.currentSession?.id || this.generateSessionId(),
      eventType,
      eventName,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ipAddress: this.getAnonymizedIP(),
      properties,
      metadata: {},
    };

    this.addEvent(event);
  }

  public trackPageView(page?: string, properties: Record<string, any> = {}): void {
    if (!this.config.tracking.enablePageTracking) return;

    const pagePath = page || window.location.pathname;
    
    this.trackEvent('page_view', {
      page: pagePath,
      title: document.title,
      ...properties,
    }, 'page_view');

    // Actualizar sesión
    if (this.currentSession) {
      this.currentSession.pageViews++;
      if (!this.currentSession.pages.includes(pagePath)) {
        this.currentSession.pages.push(pagePath);
      }
    }
  }

  public trackClick(event: Event, properties: Record<string, any> = {}): void {
    if (!this.config.tracking.enableClickTracking) return;

    const target = event.target as HTMLElement;
    if (!target) return;

    this.trackEvent('click', {
      element: target.tagName,
      id: target.id,
      className: target.className,
      text: target.textContent?.substring(0, 100),
      href: (target as HTMLAnchorElement).href,
      ...properties,
    }, 'click');
  }

  public trackScroll(properties: Record<string, any> = {}): void {
    if (!this.config.tracking.enableScrollTracking) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.round((scrollTop / scrollHeight) * 100);

    this.trackEvent('scroll', {
      scrollTop,
      scrollPercentage,
      ...properties,
    }, 'scroll');
  }

  public trackFormSubmit(event: Event, properties: Record<string, any> = {}): void {
    if (!this.config.tracking.enableFormTracking) return;

    const form = event.target as HTMLFormElement;
    if (!form) return;

    this.trackEvent('form_submit', {
      formId: form.id,
      formAction: form.action,
      formMethod: form.method,
      fieldCount: form.elements.length,
      ...properties,
    }, 'form_submit');
  }

  public trackSearch(query: string, properties: Record<string, any> = {}): void {
    this.trackEvent('search', {
      query,
      ...properties,
    }, 'search');
  }

  public trackDownload(filename: string, properties: Record<string, any> = {}): void {
    this.trackEvent('download', {
      filename,
      ...properties,
    }, 'download');
  }

  // Métodos de análisis
  public getPageAnalytics(page: string, period: { start: string; end: string }): PageAnalytics {
    const pageEvents = this.events.filter(event => 
      event.page === page && 
      event.timestamp >= period.start && 
      event.timestamp <= period.end
    );

    const pageViews = pageEvents.filter(event => event.eventType === 'page_view');
    const uniqueViews = new Set(pageViews.map(event => event.sessionId)).size;

    // Calcular tiempo promedio en página
    const sessionTimes = this.calculateSessionTimes(pageEvents);
    const averageTimeOnPage = sessionTimes.length > 0 
      ? sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length 
      : 0;

    // Calcular tasa de rebote
    const bounceRate = this.calculateBounceRate(pageEvents);

    // Calcular tasa de salida
    const exitRate = this.calculateExitRate(pageEvents);

    // Top referrers
    const referrerCounts = new Map<string, number>();
    pageEvents.forEach(event => {
      if (event.referrer) {
        referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) || 0) + 1);
      }
    });
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top user agents
    const userAgentCounts = new Map<string, number>();
    pageEvents.forEach(event => {
      userAgentCounts.set(event.userAgent, (userAgentCounts.get(event.userAgent) || 0) + 1);
    });
    const topUserAgents = Array.from(userAgentCounts.entries())
      .map(([userAgent, count]) => ({ userAgent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top countries
    const countryCounts = new Map<string, number>();
    pageEvents.forEach(event => {
      const country = event.metadata.country || 'Unknown';
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    });
    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Eventos
    const eventCounts = new Map<string, number>();
    pageEvents.forEach(event => {
      eventCounts.set(event.eventName, (eventCounts.get(event.eventName) || 0) + 1);
    });
    const events = Array.from(eventCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count);

    return {
      page,
      views: pageViews.length,
      uniqueViews,
      averageTimeOnPage,
      bounceRate,
      exitRate,
      topReferrers,
      topUserAgents,
      topCountries,
      events,
      metadata: {},
    };
  }

  public getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  public getUserSessions(userId: string, period?: { start: string; end: string }): UserSession[] {
    let sessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId);

    if (period) {
      sessions = sessions.filter(session => 
        session.startTime >= period.start && 
        (session.endTime || new Date().toISOString()) <= period.end
      );
    }

    return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  public getConversionFunnel(funnelId: string, period: { start: string; end: string }): ConversionFunnel | null {
    const funnel = this.conversionFunnels.get(funnelId);
    if (!funnel) return null;

    // Calcular métricas del funnel
    const updatedFunnel = this.calculateFunnelMetrics(funnel, period);
    return updatedFunnel;
  }

  public getCohortAnalysis(cohort: string, period: { start: string; end: string }): CohortAnalysis {
    // Simular análisis de cohortes
    const users = Math.floor(Math.random() * 1000) + 100;
    const retention = Array.from({ length: 12 }, () => Math.random() * 100);

    return {
      cohort,
      period: period.start,
      users,
      retention,
      revenue: Array.from({ length: 12 }, () => Math.random() * 10000),
      engagement: Array.from({ length: 12 }, () => Math.random() * 100),
      metadata: {},
    };
  }

  // Métodos de utilidad
  private addEvent(event: UserEvent): void {
    this.events.push(event);

    // Actualizar sesión
    if (this.currentSession) {
      this.currentSession.events++;
    }

    // Agregar al buffer si está habilitado
    if (this.config.performance.enableBatching) {
      this.eventBuffer.push(event);
      
      if (this.eventBuffer.length >= this.config.performance.batchSize) {
        this.flushEvents();
      }
    } else {
      this.sendEvent(event);
    }
  }

  private flushEvents(): void {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];

    this.sendEvents(eventsToSend);
  }

  private sendEvent(event: UserEvent): void {
    // En un entorno real, esto enviaría el evento a un servicio de analytics
    console.log('Analytics event:', event);
  }

  private sendEvents(events: UserEvent[]): void {
    // En un entorno real, esto enviaría los eventos en lote
    console.log('Analytics events batch:', events);
  }

  private endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.duration = new Date(this.currentSession.endTime).getTime() - new Date(this.currentSession.startTime).getTime();

    // Actualizar perfil de usuario
    if (this.currentSession.userId) {
      this.updateUserProfile(this.currentSession.userId, this.currentSession);
    }
  }

  private updateUserProfile(userId: string, session: UserSession): void {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        id: userId,
        userId,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalSessions: 0,
        totalEvents: 0,
        totalPageViews: 0,
        averageSessionDuration: 0,
        favoritePages: [],
        behavior: {
          frequency: 'new',
          engagement: 'low',
          segment: 'new_user',
        },
        metadata: {},
      };
    }

    profile.totalSessions++;
    profile.totalEvents += session.events;
    profile.totalPageViews += session.pageViews;
    profile.lastSeen = new Date().toISOString();
    profile.averageSessionDuration = (profile.averageSessionDuration + (session.duration || 0)) / 2;

    // Actualizar páginas favoritas
    session.pages.forEach(page => {
      if (!profile.favoritePages.includes(page)) {
        profile.favoritePages.push(page);
      }
    });

    // Actualizar comportamiento
    profile.behavior = this.calculateUserBehavior(profile);

    this.userProfiles.set(userId, profile);
  }

  private calculateUserBehavior(profile: UserProfile): UserProfile['behavior'] {
    const daysSinceFirstSeen = (new Date().getTime() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const sessionsPerDay = profile.totalSessions / daysSinceFirstSeen;

    let frequency: UserProfile['behavior']['frequency'];
    if (daysSinceFirstSeen < 7) {
      frequency = 'new';
    } else if (sessionsPerDay > 0.5) {
      frequency = 'regular';
    } else if (sessionsPerDay > 0.1) {
      frequency = 'returning';
    } else {
      frequency = 'churned';
    }

    let engagement: UserProfile['behavior']['engagement'];
    const avgSessionDuration = profile.averageSessionDuration;
    if (avgSessionDuration > 600000) { // 10 minutos
      engagement = 'very_high';
    } else if (avgSessionDuration > 300000) { // 5 minutos
      engagement = 'high';
    } else if (avgSessionDuration > 60000) { // 1 minuto
      engagement = 'medium';
    } else {
      engagement = 'low';
    }

    let segment = 'new_user';
    if (frequency === 'regular' && engagement === 'high') {
      segment = 'power_user';
    } else if (frequency === 'returning' && engagement === 'medium') {
      segment = 'regular_user';
    } else if (frequency === 'churned') {
      segment = 'churned_user';
    }

    return { frequency, engagement, segment };
  }

  private calculateSessionTimes(events: UserEvent[]): number[] {
    const sessionTimes: number[] = [];
    const sessionGroups = new Map<string, UserEvent[]>();

    events.forEach(event => {
      if (!sessionGroups.has(event.sessionId)) {
        sessionGroups.set(event.sessionId, []);
      }
      sessionGroups.get(event.sessionId)!.push(event);
    });

    sessionGroups.forEach(sessionEvents => {
      const sortedEvents = sessionEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      if (sortedEvents.length > 1) {
        const startTime = new Date(sortedEvents[0].timestamp).getTime();
        const endTime = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
        sessionTimes.push(endTime - startTime);
      }
    });

    return sessionTimes;
  }

  private calculateBounceRate(events: UserEvent[]): number {
    const sessionGroups = new Map<string, UserEvent[]>();
    events.forEach(event => {
      if (!sessionGroups.has(event.sessionId)) {
        sessionGroups.set(event.sessionId, []);
      }
      sessionGroups.get(event.sessionId)!.push(event);
    });

    const singlePageSessions = Array.from(sessionGroups.values())
      .filter(sessionEvents => sessionEvents.length === 1).length;

    return sessionGroups.size > 0 ? (singlePageSessions / sessionGroups.size) * 100 : 0;
  }

  private calculateExitRate(events: UserEvent[]): number {
    // Simular cálculo de tasa de salida
    return Math.random() * 100;
  }

  private calculateFunnelMetrics(funnel: ConversionFunnel, period: { start: string; end: string }): ConversionFunnel {
    const updatedFunnel = { ...funnel };
    
    // Simular cálculos de funnel
    updatedFunnel.steps.forEach((step, index) => {
      step.views = Math.floor(Math.random() * 1000) + 100;
      step.conversions = Math.floor(step.views * (0.1 + Math.random() * 0.3));
      step.conversionRate = (step.conversions / step.views) * 100;
      step.dropOffRate = index > 0 ? Math.random() * 50 : 0;
      step.averageTimeToNext = Math.random() * 300000; // 5 minutos
    });

    updatedFunnel.totalConversions = updatedFunnel.steps[updatedFunnel.steps.length - 1].conversions;
    updatedFunnel.overallConversionRate = (updatedFunnel.totalConversions / updatedFunnel.steps[0].views) * 100;
    updatedFunnel.averageTimeToConvert = updatedFunnel.steps.reduce((sum, step) => sum + step.averageTimeToNext, 0);

    return updatedFunnel;
  }

  private getCurrentUserId(): string | undefined {
    // En un entorno real, esto obtendría el ID del usuario actual
    return undefined;
  }

  private getAnonymizedIP(): string {
    if (this.config.privacy.enableIPAnonymization) {
      return '127.0.0.1'; // IP anonimizada
    }
    return '127.0.0.1'; // Simulado
  }

  private getDeviceInfo(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    const screen = {
      width: window.screen.width,
      height: window.screen.height,
    };

    let type: UserSession['device']['type'] = 'desktop';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      type = 'mobile';
    } else if (/iPad/.test(userAgent)) {
      type = 'tablet';
    }

    let os = 'Unknown';
    if (/Windows/.test(userAgent)) os = 'Windows';
    else if (/Mac/.test(userAgent)) os = 'macOS';
    else if (/Linux/.test(userAgent)) os = 'Linux';
    else if (/Android/.test(userAgent)) os = 'Android';
    else if (/iPhone|iPad/.test(userAgent)) os = 'iOS';

    let browser = 'Unknown';
    if (/Chrome/.test(userAgent)) browser = 'Chrome';
    else if (/Firefox/.test(userAgent)) browser = 'Firefox';
    else if (/Safari/.test(userAgent)) browser = 'Safari';
    else if (/Edge/.test(userAgent)) browser = 'Edge';

    return { type, os, browser, screen };
  }

  private getLocationInfo(): UserSession['location'] | undefined {
    // En un entorno real, esto obtendría la ubicación del usuario
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getEvents(): UserEvent[] {
    return [...this.events];
  }

  public getSessions(): UserSession[] {
    return Array.from(this.sessions.values());
  }

  public getUserProfiles(): UserProfile[] {
    return Array.from(this.userProfiles.values());
  }

  public getConversionFunnels(): ConversionFunnel[] {
    return Array.from(this.conversionFunnels.values());
  }

  public getConfig(): UserAnalyticsConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<UserAnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const userAnalytics = UserAnalyticsService.getInstance();

export default UserAnalyticsService;

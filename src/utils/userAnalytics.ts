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
  email?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastActive: string;
  totalSessions: number;
  totalEvents: number;
  totalPageViews: number;
  averageSessionDuration: number;
  preferredDevice: 'desktop' | 'mobile' | 'tablet';
  preferredBrowser: string;
  preferredOS: string;
  location?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  segments: string[];
  customProperties: Record<string, any>;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: {
    name: string;
    event: string;
    page?: string;
    properties?: Record<string, any>;
  }[];
  conversionRate: number;
  totalConversions: number;
  totalUsers: number;
  averageTimeToConvert: number;
}

export interface CohortAnalysis {
  cohort: string;
  period: {
    start: string;
    end: string;
  };
  users: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  revenue?: number;
  averageLifetimeValue?: number;
}

export interface PageAnalytics {
  page: string;
  period: {
    start: string;
    end: string;
  };
  views: number;
  uniqueViews: number;
  averageTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  topReferrers: Array<{
    referrer: string;
    views: number;
    percentage: number;
  }>;
  topUserAgents: Array<{
    userAgent: string;
    views: number;
    percentage: number;
  }>;
}

export interface UserAnalyticsConfig {
  tracking: {
    enableEventTracking: boolean;
    enablePageTracking: boolean;
    enableClickTracking: boolean;
    enableScrollTracking: boolean;
    enableFormTracking: boolean;
    enableSessionTracking: boolean;
  };
  performance: {
    enableBatching: boolean;
    enableSampling: boolean;
    sampleRate: number;
    batchSize: number;
    flushInterval: number;
  };
  features: {
    enableRealTime: boolean;
    enableSegmentation: boolean;
    enableCohortAnalysis: boolean;
    enableFunnelAnalysis: boolean;
    enableABTesting: boolean;
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
  private flushTimer?: NodeJS.Timeout;

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
        enableEventTracking: true,
        enablePageTracking: true,
        enableClickTracking: true,
        enableScrollTracking: true,
        enableFormTracking: true,
        enableSessionTracking: true,
      },
      performance: {
        enableBatching: true,
        enableSampling: false,
        sampleRate: 1.0,
        batchSize: 10,
        flushInterval: 5000,
      },
      features: {
        enableRealTime: true,
        enableSegmentation: true,
        enableCohortAnalysis: true,
        enableFunnelAnalysis: true,
        enableABTesting: false,
      },
    };
  }

  private setupDefaultFunnels(): void {
    const funnels: ConversionFunnel[] = [
      {
        id: 'evaluation-funnel',
        name: 'Evaluación de Ansiedad',
        steps: [
          { name: 'Inicio', event: 'page_view', page: '/evaluacion' },
          { name: 'Pregunta 1', event: 'form_submit', properties: { step: 1 } },
          { name: 'Pregunta 2', event: 'form_submit', properties: { step: 2 } },
          { name: 'Pregunta 3', event: 'form_submit', properties: { step: 3 } },
          { name: 'Resultado', event: 'page_view', page: '/resultado' },
        ],
        conversionRate: 0,
        totalConversions: 0,
        totalUsers: 0,
        averageTimeToConvert: 0,
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
      ipAddress: 'unknown',
      device: this.getDeviceInfo(),
      metadata: {},
    };

    this.sessions.set(sessionId, this.currentSession);
  }

  private setupEventListeners(): void {
    if (!this.config.tracking.enableEventTracking) return;

    // Page view tracking
    if (this.config.tracking.enablePageTracking) {
      window.addEventListener('load', () => {
        this.trackPageView();
      });

      window.addEventListener('popstate', () => {
        this.trackPageView();
      });
    }

    // Click tracking
    if (this.config.tracking.enableClickTracking) {
      document.addEventListener('click', (event) => {
        this.trackClick(event);
      });
    }

    // Scroll tracking
    if (this.config.tracking.enableScrollTracking) {
      let scrollTimeout: NodeJS.Timeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          this.trackScroll();
        }, 100);
      });
    }

    // Form tracking
    if (this.config.tracking.enableFormTracking) {
      document.addEventListener('submit', (event) => {
        this.trackFormSubmit(event);
      });
    }
  }

  private startAutoFlush(): void {
    if (!this.config.performance.enableBatching) return;

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.performance.flushInterval);
  }

  public trackEvent(eventName: string, properties: Record<string, any> = {}, eventType: UserEvent['eventType'] = 'custom'): void {
    if (!this.config.tracking.enableEventTracking) return;

    if (this.config.performance.enableSampling && Math.random() > this.config.performance.sampleRate) return;

    const event: UserEvent = {
      id: this.generateEventId(),
      sessionId: this.currentSession?.id || 'unknown',
      eventType,
      eventName,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      ipAddress: 'unknown',
      properties,
      metadata: {
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    this.addEvent(event);
  }

  public trackPageView(page?: string, properties: Record<string, any> = {}): void {
    if (!this.config.tracking.enablePageTracking) return;

    const pagePath = page || window.location.pathname;

    if (this.currentSession) {
      this.currentSession.pageViews++;
      this.currentSession.pages.push(pagePath);
    }

    this.trackEvent('page_view', {
      page: pagePath,
      ...properties,
    }, 'page_view');
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
      scrollHeight,
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

  public getUserProfile(userId: string): UserProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  public getUserSessions(userId: string, period?: { start: string; end: string }): UserSession[] {
    const sessions = Array.from(this.sessions.values()).filter(session => session.userId === userId);
    
    if (period) {
      return sessions.filter(session => {
        const sessionTime = new Date(session.startTime);
        const startTime = new Date(period.start);
        const endTime = new Date(period.end);
        return sessionTime >= startTime && sessionTime <= endTime;
      });
    }
    
    return sessions;
  }

  public getConversionFunnel(funnelId: string, period: { start: string; end: string }): ConversionFunnel | null {
    const funnel = this.conversionFunnels.get(funnelId);
    if (!funnel) return null;

    // Calcular métricas del funnel para el período especificado
    const funnelEvents = this.events.filter(event => {
      const eventTime = new Date(event.timestamp);
      const startTime = new Date(period.start);
      const endTime = new Date(period.end);
      return eventTime >= startTime && eventTime <= endTime;
    });

    // Implementar lógica de cálculo de conversión
    return {
      ...funnel,
      conversionRate: 0.75, // Placeholder
      totalConversions: 150, // Placeholder
      totalUsers: 200, // Placeholder
      averageTimeToConvert: 300000, // 5 minutos en ms
    };
  }

  public getCohortAnalysis(cohort: string, period: { start: string; end: string }): CohortAnalysis {
    return {
      cohort,
      period,
      users: 100, // Placeholder
      retention: {
        day1: 0.85,
        day7: 0.65,
        day30: 0.45,
      },
      revenue: 5000, // Placeholder
      averageLifetimeValue: 50, // Placeholder
    };
  }

  public getPageAnalytics(page: string, period: { start: string; end: string }): PageAnalytics {
    const pageEvents = this.events.filter(event => {
      const eventTime = new Date(event.timestamp);
      const startTime = new Date(period.start);
      const endTime = new Date(period.end);
      return event.page === page && eventTime >= startTime && eventTime <= endTime;
    });

    return {
      page,
      period,
      views: pageEvents.length,
      uniqueViews: new Set(pageEvents.map(e => e.sessionId)).size,
      averageTimeOnPage: 120000, // 2 minutos en ms
      bounceRate: 0.35,
      exitRate: 0.25,
      topReferrers: [
        { referrer: 'google.com', views: 50, percentage: 0.4 },
        { referrer: 'direct', views: 30, percentage: 0.24 },
        { referrer: 'facebook.com', views: 20, percentage: 0.16 },
      ],
      topUserAgents: [
        { userAgent: 'Chrome', views: 80, percentage: 0.64 },
        { userAgent: 'Firefox', views: 25, percentage: 0.2 },
        { userAgent: 'Safari', views: 20, percentage: 0.16 },
      ],
    };
  }

  private addEvent(event: UserEvent): void {
    this.events.push(event);
    this.eventBuffer.push(event);

    if (this.currentSession) {
      this.currentSession.events++;
    }

    if (this.eventBuffer.length >= this.config.performance.batchSize) {
      this.flushEvents();
    }
  }

  private flushEvents(): void {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];
    this.sendEvents(eventsToSend);
  }

  private sendEvent(event: UserEvent): void {
    // Enviar evento individual
    console.log('Analytics event:', event);
  }

  private sendEvents(events: UserEvent[]): void {
    // Enviar lote de eventos
    console.log('Analytics events batch:', events);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceInfo(): UserSession['device'] {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);

    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
    if (isMobile) deviceType = 'mobile';
    else if (isTablet) deviceType = 'tablet';

    return {
      type: deviceType,
      os: this.getOS(userAgent),
      browser: this.getBrowser(userAgent),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    };
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Exportar instancia singleton
export const userAnalytics = UserAnalyticsService.getInstance();

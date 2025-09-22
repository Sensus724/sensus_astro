/**
 * Configuración de producción para Sensus
 * Define todas las configuraciones específicas para el entorno de producción
 */

export interface ProductionConfig {
  app: {
    name: string;
    version: string;
    environment: 'production';
    url: string;
    apiUrl: string;
    cdnUrl: string;
  };
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  analytics: {
    googleAnalytics: {
      trackingId: string;
      enabled: boolean;
    };
    hotjar: {
      siteId: string;
      enabled: boolean;
    };
    mixpanel: {
      token: string;
      enabled: boolean;
    };
  };
  performance: {
    enableServiceWorker: boolean;
    enablePreloading: boolean;
    enableCompression: boolean;
    enableCaching: boolean;
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
  };
  security: {
    enableCSP: boolean;
    enableHSTS: boolean;
    enableCORS: boolean;
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
  };
  monitoring: {
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableUserTracking: boolean;
    enableCrashReporting: boolean;
  };
  features: {
    enablePWA: boolean;
    enableNotifications: boolean;
    enableOfflineMode: boolean;
    enableDarkMode: boolean;
    enableBetaFeatures: boolean;
  };
  integrations: {
    stripe: {
      publicKey: string;
      enabled: boolean;
    };
    sendgrid: {
      apiKey: string;
      enabled: boolean;
    };
    slack: {
      webhookUrl: string;
      enabled: boolean;
    };
    discord: {
      webhookUrl: string;
      enabled: boolean;
    };
  };
  cdn: {
    enableCDN: boolean;
    cdnUrl: string;
    enableImageOptimization: boolean;
    enableAssetVersioning: boolean;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    enableConsoleLogging: boolean;
    enableRemoteLogging: boolean;
    remoteLoggingUrl: string;
  };
}

export const PRODUCTION_CONFIG: ProductionConfig = {
  app: {
    name: 'Sensus',
    version: '1.0.0',
    environment: 'production',
    url: 'https://sensus.app',
    apiUrl: 'https://api.sensus.app',
    cdnUrl: 'https://cdn.sensus.app'
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'sensus-app.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'sensus-app',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'sensus-app.appspot.com',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
  },
  analytics: {
    googleAnalytics: {
      trackingId: process.env.GA_TRACKING_ID || '',
      enabled: true
    },
    hotjar: {
      siteId: process.env.HOTJAR_SITE_ID || '',
      enabled: true
    },
    mixpanel: {
      token: process.env.MIXPANEL_TOKEN || '',
      enabled: true
    }
  },
  performance: {
    enableServiceWorker: true,
    enablePreloading: true,
    enableCompression: true,
    enableCaching: true,
    cacheStrategy: 'balanced'
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableCORS: true,
    enableRateLimiting: true,
    maxRequestsPerMinute: 100
  },
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableUserTracking: true,
    enableCrashReporting: true
  },
  features: {
    enablePWA: true,
    enableNotifications: true,
    enableOfflineMode: true,
    enableDarkMode: true,
    enableBetaFeatures: false
  },
  integrations: {
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY || '',
      enabled: true
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      enabled: true
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
      enabled: true
    },
    discord: {
      webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
      enabled: true
    }
  },
  cdn: {
    enableCDN: true,
    cdnUrl: 'https://cdn.sensus.app',
    enableImageOptimization: true,
    enableAssetVersioning: true
  },
  logging: {
    level: 'info',
    enableConsoleLogging: false,
    enableRemoteLogging: true,
    remoteLoggingUrl: 'https://logs.sensus.app/api/logs'
  }
};

export class ProductionConfigManager {
  private config: ProductionConfig;

  constructor(config: ProductionConfig = PRODUCTION_CONFIG) {
    this.config = config;
  }

  getConfig(): ProductionConfig {
    return this.config;
  }

  updateConfig(updates: Partial<ProductionConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar configuración de Firebase
    if (!this.config.firebase.apiKey) {
      errors.push('Firebase API key is required');
    }
    if (!this.config.firebase.projectId) {
      errors.push('Firebase project ID is required');
    }

    // Validar URLs
    try {
      new URL(this.config.app.url);
      new URL(this.config.app.apiUrl);
    } catch (error) {
      errors.push('Invalid app URLs');
    }

    // Validar configuración de analytics
    if (this.config.analytics.googleAnalytics.enabled && !this.config.analytics.googleAnalytics.trackingId) {
      errors.push('Google Analytics tracking ID is required when enabled');
    }

    // Validar configuración de integraciones
    if (this.config.integrations.stripe.enabled && !this.config.integrations.stripe.publicKey) {
      errors.push('Stripe public key is required when enabled');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configJson: string): void {
    try {
      const importedConfig = JSON.parse(configJson);
      this.config = { ...PRODUCTION_CONFIG, ...importedConfig };
    } catch (error) {
      console.error('Error importing production config:', error);
    }
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      FIREBASE_API_KEY: this.config.firebase.apiKey,
      FIREBASE_AUTH_DOMAIN: this.config.firebase.authDomain,
      FIREBASE_PROJECT_ID: this.config.firebase.projectId,
      FIREBASE_STORAGE_BUCKET: this.config.firebase.storageBucket,
      FIREBASE_MESSAGING_SENDER_ID: this.config.firebase.messagingSenderId,
      FIREBASE_APP_ID: this.config.firebase.appId,
      FIREBASE_MEASUREMENT_ID: this.config.firebase.measurementId,
      GA_TRACKING_ID: this.config.analytics.googleAnalytics.trackingId,
      HOTJAR_SITE_ID: this.config.analytics.hotjar.siteId,
      MIXPANEL_TOKEN: this.config.analytics.mixpanel.token,
      STRIPE_PUBLIC_KEY: this.config.integrations.stripe.publicKey,
      SENDGRID_API_KEY: this.config.integrations.sendgrid.apiKey,
      SLACK_WEBHOOK_URL: this.config.integrations.slack.webhookUrl,
      DISCORD_WEBHOOK_URL: this.config.integrations.discord.webhookUrl
    };
  }
}

export default ProductionConfigManager;

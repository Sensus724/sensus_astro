/**
 * Sistema de alertas avanzado para Sensus
 * Proporciona funcionalidades de alertas, notificaciones y escalación
 */

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  source: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
  condition?: string;
  tags: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  suppressedUntil?: string;
  suppressedBy?: string;
  suppressionReason?: string;
  escalationLevel: number;
  maxEscalationLevel: number;
  nextEscalationAt?: string;
  channels: string[];
  metadata: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  source: string;
  metric?: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  tags: Record<string, string>;
  channels: string[];
  escalationPolicy: EscalationPolicy;
  suppressionRules: SuppressionRule[];
  cooldown: number; // minutos
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  levels: EscalationLevel[];
  maxLevel: number;
  enabled: boolean;
}

export interface EscalationLevel {
  level: number;
  delay: number; // minutos
  channels: string[];
  actions: string[];
  conditions?: string;
}

export interface SuppressionRule {
  id: string;
  name: string;
  condition: string;
  duration: number; // minutos
  enabled: boolean;
  reason: string;
}

export interface AlertChannel {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'email' | 'webhook' | 'sms' | 'push';
  config: Record<string, any>;
  enabled: boolean;
  testMode: boolean;
}

export interface AlertTemplate {
  id: string;
  name: string;
  type: 'slack' | 'discord' | 'email' | 'webhook' | 'sms' | 'push';
  template: string;
  variables: string[];
  enabled: boolean;
}

export interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  suppressed: number;
  bySeverity: Record<string, number>;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
  averageResolutionTime: number;
  escalationRate: number;
}

export class AlertingService {
  private static instance: AlertingService;
  private alerts: Alert[] = [];
  private rules: AlertRule[] = [];
  private channels: AlertChannel[] = [];
  private templates: AlertTemplate[] = [];
  private maxAlerts: number = 1000;
  private escalationTimers: Map<string, number> = new Map();
  private suppressionTimers: Map<string, number> = new Map();

  private constructor() {
    this.setupDefaultChannels();
    this.setupDefaultTemplates();
    this.setupDefaultRules();
  }

  public static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService();
    }
    return AlertingService.instance;
  }

  private setupDefaultChannels(): void {
    this.channels = [
      {
        id: 'console',
        name: 'Console',
        type: 'webhook',
        config: { url: 'console' },
        enabled: true,
        testMode: false,
      },
      {
        id: 'slack-default',
        name: 'Slack Default',
        type: 'slack',
        config: { webhookUrl: process.env.SLACK_WEBHOOK_URL || '' },
        enabled: false,
        testMode: false,
      },
      {
        id: 'discord-default',
        name: 'Discord Default',
        type: 'discord',
        config: { webhookUrl: process.env.DISCORD_WEBHOOK_URL || '' },
        enabled: false,
        testMode: false,
      },
    ];
  }

  private setupDefaultTemplates(): void {
    this.templates = [
      {
        id: 'slack-alert',
        name: 'Slack Alert Template',
        type: 'slack',
        template: `🚨 *{{title}}*
*Severity:* {{severity}}
*Source:* {{source}}
*Description:* {{description}}
*Time:* {{timestamp}}
*Tags:* {{tags}}`,
        variables: ['title', 'severity', 'source', 'description', 'timestamp', 'tags'],
        enabled: true,
      },
      {
        id: 'discord-alert',
        name: 'Discord Alert Template',
        type: 'discord',
        template: `🚨 **{{title}}**
**Severity:** {{severity}}
**Source:** {{source}}
**Description:** {{description}}
**Time:** {{timestamp}}
**Tags:** {{tags}}`,
        variables: ['title', 'severity', 'source', 'description', 'timestamp', 'tags'],
        enabled: true,
      },
      {
        id: 'email-alert',
        name: 'Email Alert Template',
        type: 'email',
        template: `Subject: [{{severity}}] {{title}}

Alert Details:
- Title: {{title}}
- Severity: {{severity}}
- Source: {{source}}
- Description: {{description}}
- Time: {{timestamp}}
- Tags: {{tags}}

Please investigate this alert immediately.`,
        variables: ['title', 'severity', 'source', 'description', 'timestamp', 'tags'],
        enabled: true,
      },
    ];
  }

  private setupDefaultRules(): void {
    this.rules = [
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
        tags: { component: 'error-handling' },
        channels: ['console'],
        escalationPolicy: {
          id: 'default-escalation',
          name: 'Default Escalation',
          levels: [
            { level: 1, delay: 5, channels: ['console'], actions: ['notify'] },
            { level: 2, delay: 15, channels: ['slack-default'], actions: ['notify', 'escalate'] },
            { level: 3, delay: 30, channels: ['discord-default'], actions: ['notify', 'escalate', 'page'] },
          ],
          maxLevel: 3,
          enabled: true,
        },
        suppressionRules: [],
        cooldown: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  // Métodos de gestión de alertas
  public createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'escalationLevel' | 'maxEscalationLevel'>): Alert {
    const alert: Alert = {
      ...alertData,
      id: this.generateAlertId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escalationLevel: 0,
      maxEscalationLevel: 3,
    };

    this.alerts.push(alert);

    // Verificar reglas de supresión
    if (this.shouldSuppressAlert(alert)) {
      this.suppressAlert(alert.id, 'Suppression rule matched', 'system');
      return alert;
    }

    // Enviar alerta
    this.sendAlert(alert);

    // Configurar escalación
    this.setupEscalation(alert);

    // Limitar tamaño del buffer
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    return alert;
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status !== 'active') return false;

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = acknowledgedBy;
    alert.updatedAt = new Date().toISOString();

    // Cancelar escalación
    this.cancelEscalation(alertId);

    return true;
  }

  public resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status === 'resolved') return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;
    alert.updatedAt = new Date().toISOString();

    // Cancelar escalación
    this.cancelEscalation(alertId);

    return true;
  }

  public suppressAlert(alertId: string, reason: string, suppressedBy: string, duration: number = 60): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'suppressed';
    alert.suppressedUntil = new Date(Date.now() + duration * 60 * 1000).toISOString();
    alert.suppressedBy = suppressedBy;
    alert.suppressionReason = reason;
    alert.updatedAt = new Date().toISOString();

    // Cancelar escalación
    this.cancelEscalation(alertId);

    // Configurar timer para reactivar
    const timer = setTimeout(() => {
      this.unsuppressAlert(alertId);
    }, duration * 60 * 1000);

    this.suppressionTimers.set(alertId, timer as any);

    return true;
  }

  public unsuppressAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status !== 'suppressed') return false;

    alert.status = 'active';
    alert.suppressedUntil = undefined;
    alert.suppressedBy = undefined;
    alert.suppressionReason = undefined;
    alert.updatedAt = new Date().toISOString();

    // Limpiar timer
    const timer = this.suppressionTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.suppressionTimers.delete(alertId);
    }

    // Reenviar alerta
    this.sendAlert(alert);

    return true;
  }

  // Métodos de gestión de reglas
  public addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  public updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.rules[index] = { ...this.rules[index], ...updates, updatedAt: new Date().toISOString() };
    return true;
  }

  public removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index === -1) return false;

    this.rules.splice(index, 1);
    return true;
  }

  public evaluateRules(metric: { name: string; value: number; tags: Record<string, string> }): void {
    this.rules.forEach(rule => {
      if (!rule.enabled) return;
      if (rule.metric && rule.metric !== metric.name) return;

      // Verificar cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldown * 60 * 1000;
        if (Date.now() - new Date(rule.lastTriggered).getTime() < cooldownMs) {
          return;
        }
      }

      // Verificar condición
      if (this.evaluateCondition(rule.condition, metric.value, rule.threshold)) {
        this.triggerRule(rule, metric);
        rule.lastTriggered = new Date().toISOString();
      }
    });
  }

  private evaluateCondition(condition: string, value: number, threshold: number): boolean {
    switch (condition) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return value === threshold;
      case 'gte':
        return value >= threshold;
      case 'lte':
        return value <= threshold;
      default:
        return false;
    }
  }

  private triggerRule(rule: AlertRule, metric: { name: string; value: number; tags: Record<string, string> }): void {
    const alert = this.createAlert({
      title: rule.name,
      description: rule.description,
      severity: rule.severity,
      status: 'active',
      source: rule.source,
      metric: rule.metric,
      threshold: rule.threshold,
      currentValue: metric.value,
      condition: rule.condition,
      tags: { ...rule.tags, ...metric.tags },
      channels: rule.channels,
      metadata: { ruleId: rule.id, metric },
    });
  }

  // Métodos de gestión de canales
  public addChannel(channel: AlertChannel): void {
    this.channels.push(channel);
  }

  public updateChannel(channelId: string, updates: Partial<AlertChannel>): boolean {
    const index = this.channels.findIndex(c => c.id === channelId);
    if (index === -1) return false;

    this.channels[index] = { ...this.channels[index], ...updates };
    return true;
  }

  public removeChannel(channelId: string): boolean {
    const index = this.channels.findIndex(c => c.id === channelId);
    if (index === -1) return false;

    this.channels.splice(index, 1);
    return true;
  }

  public testChannel(channelId: string): Promise<boolean> {
    const channel = this.channels.find(c => c.id === channelId);
    if (!channel) return Promise.resolve(false);

    const testAlert: Alert = {
      id: 'test-alert',
      title: 'Test Alert',
      description: 'This is a test alert to verify channel configuration',
      severity: 'low',
      status: 'active',
      source: 'test',
      tags: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escalationLevel: 0,
      maxEscalationLevel: 0,
      channels: [channelId],
      metadata: {},
    };

    return this.sendAlertToChannel(channel, testAlert);
  }

  // Métodos de gestión de plantillas
  public addTemplate(template: AlertTemplate): void {
    this.templates.push(template);
  }

  public updateTemplate(templateId: string, updates: Partial<AlertTemplate>): boolean {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return false;

    this.templates[index] = { ...this.templates[index], ...updates };
    return true;
  }

  public removeTemplate(templateId: string): boolean {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    return true;
  }

  // Métodos de envío
  private async sendAlert(alert: Alert): Promise<void> {
    for (const channelId of alert.channels) {
      const channel = this.channels.find(c => c.id === channelId);
      if (channel && channel.enabled) {
        try {
          await this.sendAlertToChannel(channel, alert);
        } catch (error) {
          console.error(`Failed to send alert to channel ${channelId}:`, error);
        }
      }
    }
  }

  private async sendAlertToChannel(channel: AlertChannel, alert: Alert): Promise<boolean> {
    const template = this.templates.find(t => t.type === channel.type && t.enabled);
    if (!template) {
      console.error(`No template found for channel type ${channel.type}`);
      return false;
    }

    const message = this.renderTemplate(template.template, alert);
    
    switch (channel.type) {
      case 'slack':
        return this.sendSlackAlert(channel, message, alert);
      case 'discord':
        return this.sendDiscordAlert(channel, message, alert);
      case 'email':
        return this.sendEmailAlert(channel, message, alert);
      case 'webhook':
        return this.sendWebhookAlert(channel, message, alert);
      case 'sms':
        return this.sendSMSAlert(channel, message, alert);
      case 'push':
        return this.sendPushAlert(channel, message, alert);
      default:
        console.error(`Unsupported channel type: ${channel.type}`);
        return false;
    }
  }

  private renderTemplate(template: string, alert: Alert): string {
    let rendered = template;
    
    // Reemplazar variables básicas
    rendered = rendered.replace(/\{\{title\}\}/g, alert.title);
    rendered = rendered.replace(/\{\{severity\}\}/g, alert.severity);
    rendered = rendered.replace(/\{\{source\}\}/g, alert.source);
    rendered = rendered.replace(/\{\{description\}\}/g, alert.description);
    rendered = rendered.replace(/\{\{timestamp\}\}/g, new Date(alert.createdAt).toLocaleString());
    rendered = rendered.replace(/\{\{tags\}\}/g, Object.entries(alert.tags).map(([k, v]) => `${k}:${v}`).join(', '));
    
    // Reemplazar variables adicionales
    Object.entries(alert.metadata).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(value));
    });

    return rendered;
  }

  private async sendSlackAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    try {
      const response = await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          attachments: [
            {
              color: this.getSeverityColor(alert.severity),
              fields: [
                { title: 'Alert ID', value: alert.id, short: true },
                { title: 'Severity', value: alert.severity, short: true },
                { title: 'Source', value: alert.source, short: true },
                { title: 'Created', value: new Date(alert.createdAt).toLocaleString(), short: true },
              ],
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
      return false;
    }
  }

  private async sendDiscordAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    try {
      const response = await fetch(channel.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          embeds: [
            {
              color: this.getSeverityColor(alert.severity),
              fields: [
                { name: 'Alert ID', value: alert.id, inline: true },
                { name: 'Severity', value: alert.severity, inline: true },
                { name: 'Source', value: alert.source, inline: true },
                { name: 'Created', value: new Date(alert.createdAt).toLocaleString(), inline: true },
              ],
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send Discord alert:', error);
      return false;
    }
  }

  private async sendEmailAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    // Implementar envío de email
    console.log('Email alert:', message);
    return true;
  }

  private async sendWebhookAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    try {
      if (channel.config.url === 'console') {
        console.log('Webhook alert:', message, alert);
        return true;
      }

      const response = await fetch(channel.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, alert }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
      return false;
    }
  }

  private async sendSMSAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    // Implementar envío de SMS
    console.log('SMS alert:', message);
    return true;
  }

  private async sendPushAlert(channel: AlertChannel, message: string, alert: Alert): Promise<boolean> {
    // Implementar notificaciones push
    console.log('Push alert:', message);
    return true;
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#ff0000';
      case 'high':
        return '#ff6600';
      case 'medium':
        return '#ffaa00';
      case 'low':
        return '#00aa00';
      default:
        return '#666666';
    }
  }

  // Métodos de escalación
  private setupEscalation(alert: Alert): void {
    const rule = this.rules.find(r => r.id === alert.metadata.ruleId);
    if (!rule || !rule.escalationPolicy.enabled) return;

    const escalationLevel = rule.escalationPolicy.levels.find(l => l.level === alert.escalationLevel + 1);
    if (!escalationLevel) return;

    const timer = setTimeout(() => {
      this.escalateAlert(alert.id);
    }, escalationLevel.delay * 60 * 1000);

    this.escalationTimers.set(alert.id, timer as any);
    alert.nextEscalationAt = new Date(Date.now() + escalationLevel.delay * 60 * 1000).toISOString();
  }

  private escalateAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.status !== 'active') return;

    const rule = this.rules.find(r => r.id === alert.metadata.ruleId);
    if (!rule) return;

    alert.escalationLevel++;
    alert.updatedAt = new Date().toISOString();

    // Enviar alerta escalada
    this.sendAlert(alert);

    // Configurar siguiente escalación
    this.setupEscalation(alert);
  }

  private cancelEscalation(alertId: string): void {
    const timer = this.escalationTimers.get(alertId);
    if (timer) {
      clearTimeout(timer);
      this.escalationTimers.delete(alertId);
    }

    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.nextEscalationAt = undefined;
    }
  }

  // Métodos de supresión
  private shouldSuppressAlert(alert: Alert): boolean {
    const rule = this.rules.find(r => r.id === alert.metadata.ruleId);
    if (!rule) return false;

    return rule.suppressionRules.some(suppression => {
      if (!suppression.enabled) return false;
      return this.evaluateSuppressionCondition(suppression.condition, alert);
    });
  }

  private evaluateSuppressionCondition(condition: string, alert: Alert): boolean {
    // Implementar lógica de evaluación de condiciones de supresión
    // Por simplicidad, solo verificamos si es un test
    return condition.includes('test') && alert.tags.test === 'true';
  }

  // Métodos de consulta
  public getAlerts(filter?: {
    status?: string;
    severity?: string;
    source?: string;
    startTime?: string;
    endTime?: string;
    limit?: number;
    offset?: number;
  }): Alert[] {
    let filteredAlerts = [...this.alerts];

    if (filter) {
      if (filter.status) {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filter.status);
      }
      if (filter.severity) {
        filteredAlerts = filteredAlerts.filter(alert => alert.severity === filter.severity);
      }
      if (filter.source) {
        filteredAlerts = filteredAlerts.filter(alert => alert.source === filter.source);
      }
      if (filter.startTime) {
        filteredAlerts = filteredAlerts.filter(alert => alert.createdAt >= filter.startTime!);
      }
      if (filter.endTime) {
        filteredAlerts = filteredAlerts.filter(alert => alert.createdAt <= filter.endTime!);
      }
      if (filter.limit) {
        filteredAlerts = filteredAlerts.slice(0, filter.limit);
      }
      if (filter.offset) {
        filteredAlerts = filteredAlerts.slice(filter.offset);
      }
    }

    return filteredAlerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getStats(): AlertStats {
    const alerts = this.alerts;
    const total = alerts.length;
    
    const active = alerts.filter(a => a.status === 'active').length;
    const acknowledged = alerts.filter(a => a.status === 'acknowledged').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const suppressed = alerts.filter(a => a.status === 'suppressed').length;

    const bySeverity = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySource = alerts.reduce((acc, alert) => {
      acc[alert.source] = (acc[alert.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = alerts.reduce((acc, alert) => {
      acc[alert.status] = (acc[alert.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
    const averageResolutionTime = resolvedAlerts.length > 0 
      ? resolvedAlerts.reduce((sum, alert) => {
          const created = new Date(alert.createdAt).getTime();
          const resolved = new Date(alert.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedAlerts.length / (1000 * 60) // minutos
      : 0;

    const escalatedAlerts = alerts.filter(a => a.escalationLevel > 0);
    const escalationRate = total > 0 ? (escalatedAlerts.length / total) * 100 : 0;

    return {
      total,
      active,
      acknowledged,
      resolved,
      suppressed,
      bySeverity,
      bySource,
      byStatus,
      averageResolutionTime,
      escalationRate,
    };
  }

  // Métodos de utilidad
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos de limpieza
  public destroy(): void {
    // Limpiar timers de escalación
    this.escalationTimers.forEach(timer => clearTimeout(timer));
    this.escalationTimers.clear();

    // Limpiar timers de supresión
    this.suppressionTimers.forEach(timer => clearTimeout(timer));
    this.suppressionTimers.clear();
  }
}

// Instancia singleton
export const alerting = AlertingService.getInstance();

export default AlertingService;

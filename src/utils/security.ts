/**
 * Sistema de seguridad avanzado para Sensus
 * Proporciona funcionalidades de autenticación, autorización y seguridad
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  metadata: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: string[];
  enabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  level: number;
  enabled: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'permission_denied' | 'suspicious_activity' | 'data_access' | 'data_modification';
  userId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  resource?: string;
  action?: string;
  result: 'success' | 'failure' | 'warning';
  message: string;
  metadata: Record<string, any>;
  timestamp: string;
}

export interface SecurityConfig {
  authentication: {
    enableMultiFactor: boolean;
    enableBiometric: boolean;
    enableSocialLogin: boolean;
    sessionTimeout: number; // minutos
    maxLoginAttempts: number;
    lockoutDuration: number; // minutos
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
      maxAge: number; // días
    };
  };
  authorization: {
    enableRBAC: boolean;
    enableABAC: boolean;
    enableDynamicPermissions: boolean;
    defaultRole: string;
  };
  security: {
    enableRateLimiting: boolean;
    enableCSP: boolean;
    enableHSTS: boolean;
    enableCSRF: boolean;
    enableXSSProtection: boolean;
    enableClickjackingProtection: boolean;
    enableContentSniffingProtection: boolean;
  };
  monitoring: {
    enableSecurityLogging: boolean;
    enableAnomalyDetection: boolean;
    enableThreatDetection: boolean;
    alertThresholds: {
      failedLogins: number;
      suspiciousActivity: number;
      dataAccess: number;
    };
  };
}

export class SecurityService {
  private static instance: SecurityService;
  private users: Map<string, User> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lastAttempt: number; lockedUntil?: number }> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.setupDefaultRoles();
    this.setupDefaultPermissions();
    this.setupDefaultUsers();
    this.startSecurityMonitoring();
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  private getDefaultConfig(): SecurityConfig {
    return {
      authentication: {
        enableMultiFactor: true,
        enableBiometric: false,
        enableSocialLogin: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          maxAge: 90,
        },
      },
      authorization: {
        enableRBAC: true,
        enableABAC: false,
        enableDynamicPermissions: true,
        defaultRole: 'user',
      },
      security: {
        enableRateLimiting: true,
        enableCSP: true,
        enableHSTS: true,
        enableCSRF: true,
        enableXSSProtection: true,
        enableClickjackingProtection: true,
        enableContentSniffingProtection: true,
      },
      monitoring: {
        enableSecurityLogging: true,
        enableAnomalyDetection: true,
        enableThreatDetection: true,
        alertThresholds: {
          failedLogins: 3,
          suspiciousActivity: 5,
          dataAccess: 100,
        },
      },
    };
  }

  private setupDefaultRoles(): void {
    const roles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['*'],
        level: 100,
        enabled: true,
      },
      {
        id: 'moderator',
        name: 'Moderator',
        description: 'Content moderation access',
        permissions: ['content:read', 'content:moderate', 'user:read'],
        level: 50,
        enabled: true,
      },
      {
        id: 'user',
        name: 'User',
        description: 'Standard user access',
        permissions: ['content:read', 'profile:read', 'profile:update'],
        level: 10,
        enabled: true,
      },
      {
        id: 'guest',
        name: 'Guest',
        description: 'Limited access',
        permissions: ['content:read'],
        level: 1,
        enabled: true,
      },
    ];

    roles.forEach(role => this.roles.set(role.id, role));
  }

  private setupDefaultPermissions(): void {
    const permissions: Permission[] = [
      {
        id: 'content:read',
        name: 'Read Content',
        description: 'Read application content',
        resource: 'content',
        action: 'read',
        enabled: true,
      },
      {
        id: 'content:create',
        name: 'Create Content',
        description: 'Create new content',
        resource: 'content',
        action: 'create',
        enabled: true,
      },
      {
        id: 'content:update',
        name: 'Update Content',
        description: 'Update existing content',
        resource: 'content',
        action: 'update',
        enabled: true,
      },
      {
        id: 'content:delete',
        name: 'Delete Content',
        description: 'Delete content',
        resource: 'content',
        action: 'delete',
        enabled: true,
      },
      {
        id: 'content:moderate',
        name: 'Moderate Content',
        description: 'Moderate user content',
        resource: 'content',
        action: 'moderate',
        enabled: true,
      },
      {
        id: 'user:read',
        name: 'Read Users',
        description: 'Read user information',
        resource: 'user',
        action: 'read',
        enabled: true,
      },
      {
        id: 'user:update',
        name: 'Update Users',
        description: 'Update user information',
        resource: 'user',
        action: 'update',
        enabled: true,
      },
      {
        id: 'user:delete',
        name: 'Delete Users',
        description: 'Delete users',
        resource: 'user',
        action: 'delete',
        enabled: true,
      },
      {
        id: 'profile:read',
        name: 'Read Profile',
        description: 'Read own profile',
        resource: 'profile',
        action: 'read',
        enabled: true,
      },
      {
        id: 'profile:update',
        name: 'Update Profile',
        description: 'Update own profile',
        resource: 'profile',
        action: 'update',
        enabled: true,
      },
      {
        id: 'admin:access',
        name: 'Admin Access',
        description: 'Access admin panel',
        resource: 'admin',
        action: 'access',
        enabled: true,
      },
      {
        id: 'monitoring:access',
        name: 'Monitoring Access',
        description: 'Access monitoring dashboard',
        resource: 'monitoring',
        action: 'access',
        enabled: true,
      },
    ];

    permissions.forEach(permission => this.permissions.set(permission.id, permission));
  }

  private setupDefaultUsers(): void {
    const users: User[] = [
      {
        id: 'admin-1',
        email: 'admin@sensus.com',
        name: 'Administrator',
        role: 'admin',
        permissions: ['*'],
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      },
      {
        id: 'user-1',
        email: 'user@sensus.com',
        name: 'Test User',
        role: 'user',
        permissions: ['content:read', 'profile:read', 'profile:update'],
        isActive: true,
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      },
    ];

    users.forEach(user => this.users.set(user.id, user));
  }

  private startSecurityMonitoring(): void {
    // Monitorear actividad sospechosa
    setInterval(() => {
      this.detectAnomalies();
    }, 60000); // Cada minuto

    // Limpiar sesiones expiradas
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 300000); // Cada 5 minutos

    // Limpiar intentos de login
    setInterval(() => {
      this.cleanupLoginAttempts();
    }, 600000); // Cada 10 minutos
  }

  // Métodos de autenticación
  public async authenticate(email: string, password: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; user?: User; session?: AuthSession; error?: string }> {
    try {
      // Verificar rate limiting
      if (this.isRateLimited(ipAddress)) {
        this.logSecurityEvent('failed_login', undefined, ipAddress, userAgent, 'authentication', 'login', 'failure', 'Rate limit exceeded');
        return { success: false, error: 'Rate limit exceeded' };
      }

      // Verificar bloqueo de cuenta
      if (this.isAccountLocked(email)) {
        this.logSecurityEvent('failed_login', undefined, ipAddress, userAgent, 'authentication', 'login', 'failure', 'Account locked');
        return { success: false, error: 'Account is locked' };
      }

      // Buscar usuario
      const user = Array.from(this.users.values()).find(u => u.email === email);
      if (!user) {
        this.recordFailedLogin(email, ipAddress);
        this.logSecurityEvent('failed_login', undefined, ipAddress, userAgent, 'authentication', 'login', 'failure', 'User not found');
        return { success: false, error: 'Invalid credentials' };
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        this.logSecurityEvent('failed_login', user.id, ipAddress, userAgent, 'authentication', 'login', 'failure', 'Account inactive');
        return { success: false, error: 'Account is inactive' };
      }

      // Verificar contraseña (simulado)
      const isValidPassword = await this.verifyPassword(password, user);
      if (!isValidPassword) {
        this.recordFailedLogin(email, ipAddress);
        this.logSecurityEvent('failed_login', user.id, ipAddress, userAgent, 'authentication', 'login', 'failure', 'Invalid password');
        return { success: false, error: 'Invalid credentials' };
      }

      // Crear sesión
      const session = await this.createSession(user.id, ipAddress, userAgent);
      
      // Actualizar último login
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      this.users.set(user.id, user);

      // Limpiar intentos fallidos
      this.loginAttempts.delete(email);

      // Log de éxito
      this.logSecurityEvent('login', user.id, ipAddress, userAgent, 'authentication', 'login', 'success', 'Login successful');

      return { success: true, user, session };
    } catch (error) {
      this.logSecurityEvent('failed_login', undefined, ipAddress, userAgent, 'authentication', 'login', 'failure', `Authentication error: ${error.message}`);
      return { success: false, error: 'Authentication failed' };
    }
  }

  public async logout(sessionId: string, ipAddress: string, userAgent: string): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) return false;

      // Marcar sesión como inactiva
      session.isActive = false;
      this.sessions.set(sessionId, session);

      // Log de logout
      this.logSecurityEvent('logout', session.userId, ipAddress, userAgent, 'authentication', 'logout', 'success', 'Logout successful');

      return true;
    } catch (error) {
      this.logSecurityEvent('logout', undefined, ipAddress, userAgent, 'authentication', 'logout', 'failure', `Logout error: ${error.message}`);
      return false;
    }
  }

  public async refreshToken(sessionId: string, refreshToken: string): Promise<{ success: boolean; session?: AuthSession; error?: string }> {
    try {
      const session = this.sessions.get(sessionId);
      if (!session || !session.isActive || session.refreshToken !== refreshToken) {
        return { success: false, error: 'Invalid refresh token' };
      }

      // Verificar si la sesión ha expirado
      if (new Date(session.expiresAt) < new Date()) {
        session.isActive = false;
        this.sessions.set(sessionId, session);
        return { success: false, error: 'Session expired' };
      }

      // Generar nuevo token
      session.token = this.generateToken();
      session.expiresAt = new Date(Date.now() + this.config.authentication.sessionTimeout * 60 * 1000).toISOString();
      session.lastActivity = new Date().toISOString();
      this.sessions.set(sessionId, session);

      return { success: true, session };
    } catch (error) {
      return { success: false, error: 'Token refresh failed' };
    }
  }

  // Métodos de autorización
  public async authorize(userId: string, resource: string, action: string, context?: Record<string, any>): Promise<boolean> {
    try {
      const user = this.users.get(userId);
      if (!user || !user.isActive) return false;

      // Verificar permisos
      const hasPermission = this.checkPermission(user, resource, action, context);
      
      // Log de autorización
      this.logSecurityEvent(
        hasPermission ? 'data_access' : 'permission_denied',
        userId,
        this.getCurrentIP(),
        this.getCurrentUserAgent(),
        resource,
        action,
        hasPermission ? 'success' : 'failure',
        hasPermission ? 'Access granted' : 'Access denied'
      );

      return hasPermission;
    } catch (error) {
      this.logSecurityEvent('permission_denied', userId, this.getCurrentIP(), this.getCurrentUserAgent(), resource, action, 'failure', `Authorization error: ${error.message}`);
      return false;
    }
  }

  public async checkRole(userId: string, requiredRole: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) return false;

    const userRole = this.roles.get(user.role);
    const requiredRoleObj = this.roles.get(requiredRole);
    
    if (!userRole || !requiredRoleObj) return false;

    return userRole.level >= requiredRoleObj.level;
  }

  public async getUserPermissions(userId: string): Promise<string[]> {
    const user = this.users.get(userId);
    if (!user || !user.isActive) return [];

    if (user.permissions.includes('*')) {
      return Array.from(this.permissions.keys());
    }

    return user.permissions;
  }

  // Métodos de gestión de usuarios
  public async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateUserId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    
    this.logSecurityEvent('data_modification', user.id, this.getCurrentIP(), this.getCurrentUserAgent(), 'user', 'create', 'success', 'User created');
    
    return user;
  }

  public async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(userId, updatedUser);
    
    this.logSecurityEvent('data_modification', userId, this.getCurrentIP(), this.getCurrentUserAgent(), 'user', 'update', 'success', 'User updated');
    
    return true;
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    this.users.delete(userId);
    
    // Invalidar todas las sesiones del usuario
    Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .forEach(session => {
        session.isActive = false;
        this.sessions.set(session.id, session);
      });
    
    this.logSecurityEvent('data_modification', userId, this.getCurrentIP(), this.getCurrentUserAgent(), 'user', 'delete', 'success', 'User deleted');
    
    return true;
  }

  // Métodos de gestión de sesiones
  public async createSession(userId: string, ipAddress: string, userAgent: string): Promise<AuthSession> {
    const session: AuthSession = {
      id: this.generateSessionId(),
      userId,
      token: this.generateToken(),
      refreshToken: this.generateRefreshToken(),
      expiresAt: new Date(Date.now() + this.config.authentication.sessionTimeout * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress,
      userAgent,
      isActive: true,
      metadata: {},
    };

    this.sessions.set(session.id, session);
    return session;
  }

  public async validateSession(sessionId: string, token: string): Promise<{ valid: boolean; user?: User; session?: AuthSession }> {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive || session.token !== token) {
      return { valid: false };
    }

    // Verificar expiración
    if (new Date(session.expiresAt) < new Date()) {
      session.isActive = false;
      this.sessions.set(sessionId, session);
      return { valid: false };
    }

    // Actualizar última actividad
    session.lastActivity = new Date().toISOString();
    this.sessions.set(sessionId, session);

    const user = this.users.get(session.userId);
    return { valid: true, user, session };
  }

  // Métodos de seguridad
  public async validatePassword(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const policy = this.config.authentication.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  public async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    // Simular generación de 2FA
    const secret = this.generateSecret();
    const qrCode = `otpauth://totp/Sensus:${userId}?secret=${secret}&issuer=Sensus`;
    
    this.logSecurityEvent('data_modification', userId, this.getCurrentIP(), this.getCurrentUserAgent(), 'user', 'enable_2fa', 'success', 'Two-factor authentication enabled');
    
    return { secret, qrCode };
  }

  public async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    // Simular verificación de 2FA
    const isValid = token.length === 6 && /^\d+$/.test(token);
    
    this.logSecurityEvent('login', userId, this.getCurrentIP(), this.getCurrentUserAgent(), 'authentication', 'verify_2fa', isValid ? 'success' : 'failure', `2FA verification ${isValid ? 'successful' : 'failed'}`);
    
    return isValid;
  }

  // Métodos de monitoreo de seguridad
  private detectAnomalies(): void {
    if (!this.config.monitoring.enableAnomalyDetection) return;

    // Detectar múltiples sesiones desde diferentes IPs
    const userSessions = new Map<string, Set<string>>();
    Array.from(this.sessions.values())
      .filter(session => session.isActive)
      .forEach(session => {
        if (!userSessions.has(session.userId)) {
          userSessions.set(session.userId, new Set());
        }
        userSessions.get(session.userId)!.add(session.ipAddress);
      });

    userSessions.forEach((ips, userId) => {
      if (ips.size > 3) {
        this.logSecurityEvent('suspicious_activity', userId, 'multiple', 'multiple', 'security', 'anomaly', 'warning', `Multiple IP addresses detected: ${ips.size}`);
      }
    });

    // Detectar actividad fuera del horario normal
    const now = new Date();
    const hour = now.getHours();
    if (hour < 6 || hour > 22) {
      Array.from(this.sessions.values())
        .filter(session => session.isActive && new Date(session.lastActivity).getHours() === hour)
        .forEach(session => {
          this.logSecurityEvent('suspicious_activity', session.userId, session.ipAddress, session.userAgent, 'security', 'anomaly', 'warning', `Activity detected outside normal hours: ${hour}:00`);
        });
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    Array.from(this.sessions.values())
      .filter(session => new Date(session.expiresAt) < now)
      .forEach(session => {
        session.isActive = false;
        this.sessions.set(session.id, session);
      });
  }

  private cleanupLoginAttempts(): void {
    const now = Date.now();
    Array.from(this.loginAttempts.entries())
      .filter(([_, data]) => now - data.lastAttempt > 3600000) // 1 hora
      .forEach(([email, _]) => this.loginAttempts.delete(email));
  }

  // Métodos de utilidad
  private checkPermission(user: User, resource: string, action: string, context?: Record<string, any>): boolean {
    // Verificar permisos wildcard
    if (user.permissions.includes('*')) return true;

    // Verificar permiso específico
    const permissionId = `${resource}:${action}`;
    if (user.permissions.includes(permissionId)) return true;

    // Verificar permisos del rol
    const role = this.roles.get(user.role);
    if (role && role.permissions.includes(permissionId)) return true;

    return false;
  }

  private recordFailedLogin(email: string, ipAddress: string): void {
    const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();

    if (attempts.count >= this.config.authentication.maxLoginAttempts) {
      attempts.lockedUntil = Date.now() + this.config.authentication.lockoutDuration * 60 * 1000;
    }

    this.loginAttempts.set(email, attempts);
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email);
    if (!attempts) return false;

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return true;
    }

    return false;
  }

  private isRateLimited(ipAddress: string): boolean {
    if (!this.config.security.enableRateLimiting) return false;

    const limiter = this.rateLimiters.get(ipAddress) || { count: 0, resetTime: Date.now() + 60000 };
    
    if (Date.now() > limiter.resetTime) {
      limiter.count = 0;
      limiter.resetTime = Date.now() + 60000;
    }

    limiter.count++;
    this.rateLimiters.set(ipAddress, limiter);

    return limiter.count > 10; // 10 intentos por minuto
  }

  private async verifyPassword(password: string, user: User): Promise<boolean> {
    // Simular verificación de contraseña
    // En un entorno real, esto usaría bcrypt o similar
    return password.length >= 6;
  }

  private logSecurityEvent(
    type: SecurityEvent['type'],
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    resource?: string,
    action?: string,
    result?: SecurityEvent['result'],
    message?: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.config.monitoring.enableSecurityLogging) return;

    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      userId,
      sessionId: undefined,
      ipAddress: ipAddress || this.getCurrentIP(),
      userAgent: userAgent || this.getCurrentUserAgent(),
      resource,
      action,
      result: result || 'success',
      message: message || '',
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    this.securityEvents.push(event);

    // Limitar tamaño del buffer
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }
  }

  private getCurrentIP(): string {
    return '127.0.0.1'; // Simulado
  }

  private getCurrentUserAgent(): string {
    return navigator.userAgent || 'Unknown';
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRefreshToken(): string {
    return `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSecret(): string {
    return `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos públicos de consulta
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  public getSessions(): AuthSession[] {
    return Array.from(this.sessions.values());
  }

  public getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents];
  }

  public getConfig(): SecurityConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Instancia singleton
export const security = SecurityService.getInstance();

export default SecurityService;

/**
 * Utilidades PWA para Sensus
 * Funciones helper para manejar funcionalidades PWA
 */

import { PWA_CONFIG } from '../config/pwa';

// Tipos para PWA
export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWANotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export interface PWACacheInfo {
  name: string;
  size: number;
  keys: string[];
}

// Clase principal para manejar PWA
export class PWAUtils {
  private static instance: PWAUtils;
  private deferredPrompt: PWAInstallPrompt | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;

  private constructor() {
    this.init();
  }

  public static getInstance(): PWAUtils {
    if (!PWAUtils.instance) {
      PWAUtils.instance = new PWAUtils();
    }
    return PWAUtils.instance;
  }

  private init() {
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private setupEventListeners() {
    // Escuchar evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as unknown as PWAInstallPrompt;
      this.dispatchEvent('installprompt', { available: true });
    });

    // Escuchar evento appinstalled
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.dispatchEvent('installed', { success: true });
    });

    // Escuchar cambios de conectividad
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.dispatchEvent('online', { status: 'online' });
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.dispatchEvent('offline', { status: 'offline' });
    });
  }

  private checkInstallStatus() {
    this.isInstalled = this.isPWAInstalled();
  }

  private isPWAInstalled(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  private dispatchEvent(eventName: string, detail: any) {
    const event = new CustomEvent(`pwa:${eventName}`, { detail });
    window.dispatchEvent(event);
  }

  // Métodos públicos
  public async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('PWA: No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  public canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  public isInstalledApp(): boolean {
    return this.isInstalled;
  }

  public isOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async getServiceWorkerInfo() {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;

      return {
        scope: registration.scope,
        state: registration.active?.state || 'unknown',
        scriptURL: registration.active?.scriptURL || 'unknown',
        updateAvailable: registration.waiting !== null,
      };
    } catch (error) {
      console.error('Error getting Service Worker info:', error);
      return null;
    }
  }

  public async getCacheInfo(): Promise<PWACacheInfo[]> {
    if (!('caches' in window)) return [];

    try {
      const cacheNames = await caches.keys();
      const cacheInfo: PWACacheInfo[] = [];

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        let size = 0;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            size += blob.size;
          }
        }

        cacheInfo.push({
          name: cacheName,
          size,
          keys: keys.map(key => key.url),
        });
      }

      return cacheInfo;
    } catch (error) {
      console.error('Error getting cache info:', error);
      return [];
    }
  }

  public async clearCache(): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      this.dispatchEvent('cachecleared', { success: true });
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      this.dispatchEvent('cachecleared', { success: false, error });
      return false;
    }
  }

  public async showNotification(options: PWANotificationOptions): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return false;
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('PWA: Notification permission denied');
        return false;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || PWA_CONFIG.NOTIFICATIONS.icon,
        badge: options.badge || PWA_CONFIG.NOTIFICATIONS.badge,
        tag: options.tag || PWA_CONFIG.NOTIFICATIONS.tag,
        requireInteraction: options.requireInteraction || PWA_CONFIG.NOTIFICATIONS.requireInteraction,
        // actions: options.actions || PWA_CONFIG.NOTIFICATIONS.actions, // Comentado temporalmente
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch (error) {
      console.error('PWA: Error showing notification:', error);
      return false;
    }
  }

  public async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  public getNotificationPermission(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }

    return Notification.permission;
  }

  public async syncData(data: any[]): Promise<boolean> {
    if (!this.isOnline) {
      console.warn('PWA: Cannot sync data while offline');
      return false;
    }

    try {
      // Implementar lógica de sincronización
      console.log('PWA: Syncing data', data);
      
      // Simular sincronización
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.dispatchEvent('datasync', { success: true, count: data.length });
      return true;
    } catch (error) {
      console.error('PWA: Error syncing data:', error);
      this.dispatchEvent('datasync', { success: false, error });
      return false;
    }
  }

  public async storeOfflineData(key: string, data: any): Promise<boolean> {
    try {
      const pendingData = this.getOfflineData();
      pendingData.push({ key, data, timestamp: Date.now() });
      localStorage.setItem(PWA_CONFIG.SYNC.storageKey, JSON.stringify(pendingData));
      return true;
    } catch (error) {
      console.error('PWA: Error storing offline data:', error);
      return false;
    }
  }

  public getOfflineData(): any[] {
    try {
      const data = localStorage.getItem(PWA_CONFIG.SYNC.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('PWA: Error getting offline data:', error);
      return [];
    }
  }

  public clearOfflineData(): boolean {
    try {
      localStorage.removeItem(PWA_CONFIG.SYNC.storageKey);
      return true;
    } catch (error) {
      console.error('PWA: Error clearing offline data:', error);
      return false;
    }
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      cache: 'caches' in window,
    };
  }

  public isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  public isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  public isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  public getInstallInstructions(): string {
    if (this.isIOS()) {
      return `
        <div class="pwa-instructions">
          <h3>Instalar en iOS:</h3>
          <ol>
            <li>Toca el botón "Compartir" en Safari</li>
            <li>Selecciona "Agregar a pantalla de inicio"</li>
            <li>Toca "Agregar"</li>
          </ol>
        </div>
      `;
    } else if (this.isAndroid()) {
      return `
        <div class="pwa-instructions">
          <h3>Instalar en Android:</h3>
          <ol>
            <li>Toca el menú del navegador (⋮)</li>
            <li>Selecciona "Agregar a pantalla de inicio"</li>
            <li>Toca "Agregar"</li>
          </ol>
        </div>
      `;
    } else {
      return `
        <div class="pwa-instructions">
          <h3>Instalar en Desktop:</h3>
          <ol>
            <li>Busca el ícono de instalación en la barra de direcciones</li>
            <li>Haz clic en "Instalar"</li>
            <li>Confirma la instalación</li>
          </ol>
        </div>
      `;
    }
  }
}

// Instancia singleton
export const pwaUtils = PWAUtils.getInstance();

// Funciones de conveniencia
export const installPWA = () => pwaUtils.install();
export const canInstallPWA = () => pwaUtils.canInstall();
export const isPWAInstalled = () => pwaUtils.isInstalledApp();
export const isOnline = () => pwaUtils.isOnlineStatus();
export const getServiceWorkerInfo = () => pwaUtils.getServiceWorkerInfo();
export const getCacheInfo = () => pwaUtils.getCacheInfo();
export const clearCache = () => pwaUtils.clearCache();
export const showNotification = (options: PWANotificationOptions) => pwaUtils.showNotification(options);
export const requestNotificationPermission = () => pwaUtils.requestNotificationPermission();
export const getNotificationPermission = () => pwaUtils.getNotificationPermission();
export const syncData = (data: any[]) => pwaUtils.syncData(data);
export const storeOfflineData = (key: string, data: any) => pwaUtils.storeOfflineData(key, data);
export const getOfflineData = () => pwaUtils.getOfflineData();
export const clearOfflineData = () => pwaUtils.clearOfflineData();
export const formatBytes = (bytes: number) => pwaUtils.formatBytes(bytes);
export const getDeviceInfo = () => pwaUtils.getDeviceInfo();
export const isMobile = () => pwaUtils.isMobile();
export const isIOS = () => pwaUtils.isIOS();
export const isAndroid = () => pwaUtils.isAndroid();
export const getInstallInstructions = () => pwaUtils.getInstallInstructions();

export default pwaUtils;

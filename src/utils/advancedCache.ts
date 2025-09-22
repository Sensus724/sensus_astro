/**
 * Sistema de caché avanzado para Sensus
 * Caché multi-nivel con estrategias inteligentes y gestión automática
 */

export interface CacheConfig {
  maxSize: number;
  maxAge: number;
  strategy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  compression: boolean;
  encryption: boolean;
  persistence: boolean;
  levels: ('memory' | 'localStorage' | 'indexedDB' | 'serviceWorker')[];
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  compressed?: boolean;
  encrypted?: boolean;
  ttl?: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalSize: number;
  entryCount: number;
  evictions: number;
  compressionRatio: number;
}

export interface CacheLevel {
  name: string;
  capacity: number;
  currentSize: number;
  hitRate: number;
  accessTime: number;
}

class AdvancedCache {
  private config: CacheConfig;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats;
  private levels: CacheLevel[] = [];
  private compressionWorker: Worker | null = null;
  private encryptionKey: string | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      strategy: 'LRU',
      compression: true,
      encryption: false,
      persistence: true,
      levels: ['memory', 'localStorage', 'indexedDB'],
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
      evictions: 0,
      compressionRatio: 0,
    };

    this.init();
  }

  private async init() {
    // Inicializar niveles de caché
    await this.initializeLevels();
    
    // Configurar compresión
    if (this.config.compression) {
      await this.setupCompression();
    }
    
    // Configurar encriptación
    if (this.config.encryption) {
      await this.setupEncryption();
    }
    
    // Configurar persistencia
    if (this.config.persistence) {
      await this.setupPersistence();
    }
    
    // Configurar limpieza automática
    this.setupAutoCleanup();
    
    // Configurar monitoreo
    this.setupMonitoring();
  }

  private async initializeLevels() {
    // Nivel 1: Memoria (más rápido)
    this.levels.push({
      name: 'memory',
      capacity: this.config.maxSize * 0.1, // 10% del total
      currentSize: 0,
      hitRate: 0,
      accessTime: 1, // 1ms
    });

    // Nivel 2: localStorage (medio)
    if (this.config.levels.includes('localStorage')) {
      this.levels.push({
        name: 'localStorage',
        capacity: this.config.maxSize * 0.2, // 20% del total
        currentSize: 0,
        hitRate: 0,
        accessTime: 5, // 5ms
      });
    }

    // Nivel 3: IndexedDB (lento pero grande)
    if (this.config.levels.includes('indexedDB')) {
      this.levels.push({
        name: 'indexedDB',
        capacity: this.config.maxSize * 0.7, // 70% del total
        currentSize: 0,
        hitRate: 0,
        accessTime: 50, // 50ms
      });
    }

    // Nivel 4: Service Worker (red)
    if (this.config.levels.includes('serviceWorker')) {
      this.levels.push({
        name: 'serviceWorker',
        capacity: this.config.maxSize * 2, // 200% del total
        currentSize: 0,
        hitRate: 0,
        accessTime: 100, // 100ms
      });
    }
  }

  private async setupCompression() {
    // Crear worker para compresión
    if ('Worker' in window) {
      const compressionCode = `
        self.onmessage = function(e) {
          const { data, type } = e.data;
          
          if (type === 'compress') {
            try {
              // Compresión simple (implementar algoritmo real)
              const compressed = JSON.stringify(data);
              self.postMessage({ success: true, data: compressed });
            } catch (error) {
              self.postMessage({ success: false, error: error.message });
            }
          } else if (type === 'decompress') {
            try {
              const decompressed = JSON.parse(data);
              self.postMessage({ success: true, data: decompressed });
            } catch (error) {
              self.postMessage({ success: false, error: error.message });
            }
          }
        };
      `;
      
      const blob = new Blob([compressionCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    }
  }

  private async setupEncryption() {
    // Generar clave de encriptación
    if ('crypto' in window) {
      const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
      
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      this.encryptionKey = Array.from(new Uint8Array(exportedKey))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  private async setupPersistence() {
    // Cargar caché persistente
    await this.loadPersistentCache();
    
    // Configurar guardado automático
    setInterval(() => {
      this.savePersistentCache();
    }, 30000); // Cada 30 segundos
  }

  private setupAutoCleanup() {
    // Limpieza automática cada 5 minutos
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  private setupMonitoring() {
    // Monitoreo de estadísticas cada minuto
    setInterval(() => {
      this.updateStats();
    }, 60000);
  }

  // Métodos públicos
  public async get<T>(key: string): Promise<T | null> {
    try {
      // Buscar en niveles de caché
      for (const level of this.levels) {
        const entry = await this.getFromLevel(level.name, key);
        if (entry) {
          this.stats.hits++;
          this.updateAccessStats(entry);
          return this.deserializeEntry(entry);
        }
      }

      this.stats.misses++;
      return null;

    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const entry = await this.createEntry(key, value, ttl);
      
      // Determinar nivel óptimo
      const level = this.selectOptimalLevel(entry);
      
      // Guardar en nivel seleccionado
      await this.setInLevel(level.name, key, entry);
      
      // Actualizar estadísticas
      this.updateStats();

    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  public async delete(key: string): Promise<boolean> {
    try {
      let deleted = false;
      
      // Eliminar de todos los niveles
      for (const level of this.levels) {
        if (await this.deleteFromLevel(level.name, key)) {
          deleted = true;
        }
      }
      
      return deleted;

    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  public async clear(): Promise<void> {
    try {
      // Limpiar todos los niveles
      for (const level of this.levels) {
        await this.clearLevel(level.name);
      }
      
      // Resetear estadísticas
      this.stats = {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalSize: 0,
        entryCount: 0,
        evictions: 0,
        compressionRatio: 0,
      };

    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  public async has(key: string): Promise<boolean> {
    for (const level of this.levels) {
      if (await this.hasInLevel(level.name, key)) {
        return true;
      }
    }
    return false;
  }

  public getStats(): CacheStats {
    return { ...this.stats };
  }

  public getLevels(): CacheLevel[] {
    return [...this.levels];
  }

  public async optimize(): Promise<void> {
    // Optimizar caché
    await this.reorganizeCache();
    await this.compressCache();
    await this.cleanup();
  }

  // Métodos privados
  private async createEntry<T>(key: string, value: T, ttl?: number): Promise<CacheEntry<T>> {
    const serialized = this.serializeValue(value);
    const size = this.calculateSize(serialized);
    
    let compressed = serialized;
    if (this.config.compression && size > 1024) { // Comprimir si > 1KB
      compressed = await this.compress(serialized);
    }
    
    let encrypted = compressed;
    if (this.config.encryption) {
      encrypted = await this.encrypt(compressed);
    }

    return {
      key,
      value: encrypted,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccess: Date.now(),
      size: this.calculateSize(encrypted),
      compressed: compressed !== serialized,
      encrypted: this.config.encryption,
      ttl: ttl || this.config.maxAge,
    };
  }

  private selectOptimalLevel(entry: CacheEntry): CacheLevel {
    // Seleccionar nivel basado en tamaño y frecuencia de acceso
    if (entry.size < 1024) { // < 1KB
      return this.levels[0]; // Memoria
    } else if (entry.size < 10240) { // < 10KB
      return this.levels[1] || this.levels[0]; // localStorage o memoria
    } else {
      return this.levels[2] || this.levels[1] || this.levels[0]; // IndexedDB o siguiente disponible
    }
  }

  private async getFromLevel(levelName: string, key: string): Promise<CacheEntry | null> {
    switch (levelName) {
      case 'memory':
        return this.memoryCache.get(key) || null;
      
      case 'localStorage':
        return this.getFromLocalStorage(key);
      
      case 'indexedDB':
        return await this.getFromIndexedDB(key);
      
      case 'serviceWorker':
        return await this.getFromServiceWorker(key);
      
      default:
        return null;
    }
  }

  private async setInLevel(levelName: string, key: string, entry: CacheEntry): Promise<void> {
    switch (levelName) {
      case 'memory':
        this.memoryCache.set(key, entry);
        break;
      
      case 'localStorage':
        await this.setInLocalStorage(key, entry);
        break;
      
      case 'indexedDB':
        await this.setInIndexedDB(key, entry);
        break;
      
      case 'serviceWorker':
        await this.setInServiceWorker(key, entry);
        break;
    }
  }

  private async deleteFromLevel(levelName: string, key: string): Promise<boolean> {
    switch (levelName) {
      case 'memory':
        return this.memoryCache.delete(key);
      
      case 'localStorage':
        return this.deleteFromLocalStorage(key);
      
      case 'indexedDB':
        return await this.deleteFromIndexedDB(key);
      
      case 'serviceWorker':
        return await this.deleteFromServiceWorker(key);
      
      default:
        return false;
    }
  }

  private async hasInLevel(levelName: string, key: string): Promise<boolean> {
    const entry = await this.getFromLevel(levelName, key);
    return entry !== null && !this.isExpired(entry);
  }

  private async clearLevel(levelName: string): Promise<void> {
    switch (levelName) {
      case 'memory':
        this.memoryCache.clear();
        break;
      
      case 'localStorage':
        this.clearLocalStorage();
        break;
      
      case 'indexedDB':
        await this.clearIndexedDB();
        break;
      
      case 'serviceWorker':
        await this.clearServiceWorker();
        break;
    }
  }

  private serializeValue(value: any): string {
    return JSON.stringify(value);
  }

  private deserializeEntry<T>(entry: CacheEntry): T {
    let value = entry.value;
    
    if (entry.encrypted) {
      value = this.decrypt(value);
    }
    
    if (entry.compressed) {
      value = this.decompress(value);
    }
    
    return JSON.parse(value);
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length * 2; // Aproximación en bytes
  }

  private isExpired(entry: CacheEntry): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private updateAccessStats(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccess = Date.now();
  }

  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    
    this.stats.totalSize = Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    this.stats.entryCount = this.memoryCache.size;
  }

  private async cleanup(): Promise<void> {
    // Limpiar entradas expiradas
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        this.stats.evictions++;
      }
    }
    
    // Aplicar estrategia de evicción
    await this.applyEvictionStrategy();
  }

  private async applyEvictionStrategy(): Promise<void> {
    const currentSize = Array.from(this.memoryCache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    if (currentSize > this.config.maxSize) {
      const entries = Array.from(this.memoryCache.entries());
      
      switch (this.config.strategy) {
        case 'LRU':
          entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
          break;
        case 'LFU':
          entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
          break;
        case 'FIFO':
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
          break;
        case 'TTL':
          entries.sort((a, b) => (a[1].ttl || 0) - (b[1].ttl || 0));
          break;
      }
      
      // Eliminar entradas hasta reducir el tamaño
      let sizeToRemove = currentSize - this.config.maxSize;
      for (const [key, entry] of entries) {
        this.memoryCache.delete(key);
        this.stats.evictions++;
        sizeToRemove -= entry.size;
        if (sizeToRemove <= 0) break;
      }
    }
  }

  private async reorganizeCache(): Promise<void> {
    // Reorganizar caché moviendo entradas frecuentemente accedidas a niveles más rápidos
    const entries = Array.from(this.memoryCache.entries());
    
    // Mover entradas de alto acceso a memoria
    const highAccessEntries = entries
      .filter(([_, entry]) => entry.accessCount > 10)
      .sort((a, b) => b[1].accessCount - a[1].accessCount);
    
    for (const [key, entry] of highAccessEntries) {
      // Mover a nivel más rápido si es posible
      const optimalLevel = this.selectOptimalLevel(entry);
      if (optimalLevel.name !== 'memory') {
        await this.setInLevel(optimalLevel.name, key, entry);
        this.memoryCache.delete(key);
      }
    }
  }

  private async compressCache(): Promise<void> {
    // Comprimir entradas grandes
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!entry.compressed && entry.size > 1024) {
        const compressed = await this.compress(entry.value);
        if (compressed.length < entry.value.length) {
          entry.value = compressed;
          entry.compressed = true;
          entry.size = this.calculateSize(compressed);
        }
      }
    }
  }

  private async compress(data: string): Promise<string> {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          this.compressionWorker?.removeEventListener('message', handler);
          if (e.data.success) {
            resolve(e.data.data);
          } else {
            reject(new Error(e.data.error));
          }
        };
        
        this.compressionWorker?.addEventListener('message', handler);
        this.compressionWorker?.postMessage({ type: 'compress', data });
      });
    }
    
    // Fallback: compresión simple
    return data;
  }

  private decompress(data: string): string {
    if (this.compressionWorker) {
      return new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          this.compressionWorker?.removeEventListener('message', handler);
          if (e.data.success) {
            resolve(e.data.data);
          } else {
            reject(new Error(e.data.error));
          }
        };
        
        this.compressionWorker?.addEventListener('message', handler);
        this.compressionWorker?.postMessage({ type: 'decompress', data });
      });
    }
    
    // Fallback: descompresión simple
    return data;
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) return data;
    
    // Implementar encriptación real
    return data;
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) return data;
    
    // Implementar desencriptación real
    return data;
  }

  // Métodos de localStorage
  private getFromLocalStorage(key: string): CacheEntry | null {
    try {
      const data = localStorage.getItem(`cache_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  private async setInLocalStorage(key: string, entry: CacheEntry): Promise<void> {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      // localStorage lleno, limpiar entradas antiguas
      this.cleanupLocalStorage();
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    }
  }

  private deleteFromLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(`cache_${key}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  private clearLocalStorage(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => localStorage.removeItem(key));
  }

  private cleanupLocalStorage(): void {
    const cacheKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .map(key => ({
        key,
        timestamp: JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Eliminar el 25% más antiguo
    const toRemove = Math.ceil(cacheKeys.length * 0.25);
    cacheKeys.slice(0, toRemove).forEach(({ key }) => {
      localStorage.removeItem(key);
    });
  }

  // Métodos de IndexedDB
  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    // Implementar acceso a IndexedDB
    return null;
  }

  private async setInIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    // Implementar guardado en IndexedDB
  }

  private async deleteFromIndexedDB(key: string): Promise<boolean> {
    // Implementar eliminación de IndexedDB
    return false;
  }

  private async clearIndexedDB(): Promise<void> {
    // Implementar limpieza de IndexedDB
  }

  // Métodos de Service Worker
  private async getFromServiceWorker(key: string): Promise<CacheEntry | null> {
    // Implementar acceso a Service Worker cache
    return null;
  }

  private async setInServiceWorker(key: string, entry: CacheEntry): Promise<void> {
    // Implementar guardado en Service Worker cache
  }

  private async deleteFromServiceWorker(key: string): Promise<boolean> {
    // Implementar eliminación de Service Worker cache
    return false;
  }

  private async clearServiceWorker(): Promise<void> {
    // Implementar limpieza de Service Worker cache
  }

  // Métodos de persistencia
  private async loadPersistentCache(): Promise<void> {
    // Cargar caché persistente al inicializar
  }

  private async savePersistentCache(): Promise<void> {
    // Guardar caché persistente
  }

  public destroy(): void {
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
  }
}

// Instancia singleton
let advancedCacheInstance: AdvancedCache | null = null;

export function getAdvancedCache(): AdvancedCache {
  if (!advancedCacheInstance) {
    advancedCacheInstance = new AdvancedCache();
  }
  return advancedCacheInstance;
}

// Funciones de conveniencia
export const cacheGet = <T>(key: string): Promise<T | null> => 
  getAdvancedCache().get<T>(key);
export const cacheSet = <T>(key: string, value: T, ttl?: number): Promise<void> => 
  getAdvancedCache().set(key, value, ttl);
export const cacheDelete = (key: string): Promise<boolean> => 
  getAdvancedCache().delete(key);
export const cacheClear = (): Promise<void> => 
  getAdvancedCache().clear();
export const cacheHas = (key: string): Promise<boolean> => 
  getAdvancedCache().has(key);
export const cacheStats = (): CacheStats => 
  getAdvancedCache().getStats();
export const cacheOptimize = (): Promise<void> => 
  getAdvancedCache().optimize();

export default AdvancedCache;

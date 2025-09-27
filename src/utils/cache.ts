/**
 * Sistema de caché inteligente para optimizar rendimiento
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

class SmartCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Obtener item del caché
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Incrementar contador de hits
    item.hits++;
    return item.data;
  }

  /**
   * Guardar item en el caché
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Si el caché está lleno, eliminar el menos usado
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    });
  }

  /**
   * Eliminar item del caché
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const items = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: items.reduce((sum, item) => sum + item.hits, 0),
      averageHits: items.length > 0 ? items.reduce((sum, item) => sum + item.hits, 0) / items.length : 0,
      hitRate: this.calculateHitRate()
    };
  }

  /**
   * Eliminar items expirados
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Eliminar el item menos usado
   */
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastHits = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.hits < leastHits) {
        leastHits = item.hits;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  /**
   * Calcular tasa de aciertos
   */
  private calculateHitRate(): number {
    const items = Array.from(this.cache.values());
    const totalHits = items.reduce((sum, item) => sum + item.hits, 0);
    const totalRequests = items.length + totalHits;
    
    return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  }
}

// Instancia global del caché
export const cache = new SmartCache();

// Funciones de utilidad para caché con fetch
export async function cachedFetch<T>(
  url: string, 
  options?: RequestInit, 
  ttl?: number
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options || {})}`;
  
  // Intentar obtener del caché
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Si no está en caché, hacer la petición
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Guardar en caché
  cache.set(cacheKey, data, ttl);
  
  return data;
}

// Función para caché de datos de usuario
export function cacheUserData<T>(userId: string, data: T, ttl?: number): void {
  cache.set(`user:${userId}`, data, ttl);
}

export function getCachedUserData<T>(userId: string): T | null {
  return cache.get<T>(`user:${userId}`);
}

// Función para caché de configuraciones
export function cacheConfig<T>(key: string, data: T): void {
  cache.set(`config:${key}`, data, 30 * 60 * 1000); // 30 minutos
}

export function getCachedConfig<T>(key: string): T | null {
  return cache.get<T>(`config:${key}`);
}

// Limpiar caché automáticamente cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

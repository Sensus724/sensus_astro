import Redis from 'ioredis';
import { logger } from '../utils/logger.util';

/**
 * Servicio de caché Redis para optimización de rendimiento
 */
class CacheService {
  private redis: Redis | null = null;
  private isConnected = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('connect', () => {
          this.isConnected = true;
          logger.info('Redis conectado exitosamente');
        });

        this.redis.on('error', (error) => {
          this.isConnected = false;
          logger.error('Error de Redis:', error);
        });

        await this.redis.connect();
      } else {
        logger.warn('REDIS_URL no configurado, usando caché en memoria');
      }
    } catch (error) {
      logger.error('Error inicializando Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Obtener valor del caché
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected || !this.redis) {
        return null;
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error obteniendo caché para key ${key}:`, error);
      return null;
    }
  }

  /**
   * Guardar valor en el caché
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const serializedValue = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      logger.error(`Error guardando caché para key ${key}:`, error);
      return false;
    }
  }

  /**
   * Eliminar valor del caché
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Error eliminando caché para key ${key}:`, error);
      return false;
    }
  }

  /**
   * Eliminar múltiples claves
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected || !this.redis) {
        return 0;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      return await this.redis.del(...keys);
    } catch (error) {
      logger.error(`Error eliminando patrón ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Verificar si una clave existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected || !this.redis) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error verificando existencia de key ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtener TTL de una clave
   */
  async getTTL(key: string): Promise<number> {
    try {
      if (!this.isConnected || !this.redis) {
        return -1;
      }

      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Error obteniendo TTL para key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Incrementar contador
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      if (!this.isConnected || !this.redis) {
        return 0;
      }

      return await this.redis.incrby(key, amount);
    } catch (error) {
      logger.error(`Error incrementando key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  async getStats(): Promise<any> {
    try {
      if (!this.isConnected || !this.redis) {
        return { connected: false };
      }

      const info = await this.redis.info('memory');
      const keyspace = await this.redis.info('keyspace');
      
      return {
        connected: true,
        memory: this.parseRedisInfo(info),
        keyspace: this.parseRedisInfo(keyspace)
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de Redis:', error);
      return { connected: false, error: (error as Error).message };
    }
  }

  /**
   * Limpiar caché por patrón
   */
  async clearPattern(pattern: string): Promise<number> {
    return await this.deletePattern(pattern);
  }

  /**
   * Caché para datos de usuario
   */
  async cacheUserData(userId: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
    return await this.set(`user:${userId}`, data, ttlSeconds);
  }

  async getCachedUserData<T>(userId: string): Promise<T | null> {
    return await this.get<T>(`user:${userId}`);
  }

  /**
   * Caché para sesiones
   */
  async cacheSession(sessionId: string, data: any, ttlSeconds: number = 1800): Promise<boolean> {
    return await this.set(`session:${sessionId}`, data, ttlSeconds);
  }

  async getCachedSession<T>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  /**
   * Caché para configuraciones
   */
  async cacheConfig(key: string, data: any, ttlSeconds: number = 1800): Promise<boolean> {
    return await this.set(`config:${key}`, data, ttlSeconds);
  }

  async getCachedConfig<T>(key: string): Promise<T | null> {
    return await this.get<T>(`config:${key}`);
  }

  /**
   * Parsear información de Redis
   */
  private parseRedisInfo(info: string): any {
    const result: any = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = value;
      }
    }
    
    return result;
  }

  /**
   * Cerrar conexión
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
    }
  }
}

// Instancia singleton
export const cacheService = new CacheService();

// Middleware para caché de respuestas
export function cacheMiddleware(ttlSeconds: number = 300) {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    const cacheKey = `response:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

    // Intentar obtener del caché
    const cachedResponse = await cacheService.get(cacheKey);
    if (cachedResponse) {
      res.set('X-Cache', 'HIT');
      return res.json(cachedResponse);
    }

    // Interceptar respuesta
    res.send = function(data: any) {
      // Guardar en caché solo si es exitosa
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, ttlSeconds);
      }
      res.set('X-Cache', 'MISS');
      originalSend.call(this, data);
    };

    next();
  };
}

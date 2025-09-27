import FirebaseService from './firebase.service';
import { logger } from '../utils/logger.util';
import { cacheService } from './cache.service';

/**
 * Servicio de optimización de base de datos
 */
class DatabaseOptimizationService {
  private queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtener datos de usuario con caché
   */
  async getUserData(userId: string, useCache: boolean = true): Promise<any> {
    const cacheKey = `user_data:${userId}`;
    
    if (useCache) {
      // Intentar obtener del caché Redis
      const cachedData = await cacheService.getCachedUserData(cacheKey);
      if (cachedData) {
        logger.info(`Datos de usuario ${userId} obtenidos del caché`);
        return cachedData;
      }
    }

    try {
      const db = FirebaseService.getFirestore();
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // Guardar en caché
      if (useCache) {
        await cacheService.cacheUserData(cacheKey, userData, 3600); // 1 hora
      }

      logger.info(`Datos de usuario ${userId} obtenidos de Firestore`);
      return userData;
    } catch (error) {
      logger.error(`Error obteniendo datos de usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener entradas del diario con paginación y caché
   */
  async getDiaryEntries(
    userId: string, 
    limit: number = 10, 
    startAfter?: any,
    useCache: boolean = true
  ): Promise<{ entries: any[]; lastDoc: any }> {
    const cacheKey = `diary_entries:${userId}:${limit}:${startAfter?.id || 'first'}`;
    
    if (useCache) {
      const cachedData = await cacheService.get<{ entries: any[]; lastDoc: any }>(cacheKey);
      if (cachedData) {
        logger.info(`Entradas del diario para ${userId} obtenidas del caché`);
        return cachedData;
      }
    }

    try {
      const db = FirebaseService.getFirestore();
      let query = db.collection('diary_entries')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit);

      if (startAfter) {
        query = query.startAfter(startAfter);
      }

      const snapshot = await query.get();
      const entries = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      const result = {
        entries,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };

      // Guardar en caché por 5 minutos
      if (useCache) {
        await cacheService.set(cacheKey, result, 300);
      }

      logger.info(`${entries.length} entradas del diario obtenidas para ${userId}`);
      return result;
    } catch (error) {
      logger.error(`Error obteniendo entradas del diario para ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener evaluaciones con caché
   */
  async getEvaluations(
    userId: string, 
    limit: number = 10,
    useCache: boolean = true
  ): Promise<any[]> {
    const cacheKey = `evaluations:${userId}:${limit}`;
    
    if (useCache) {
      const cachedData = await cacheService.get<any[]>(cacheKey);
      if (cachedData) {
        logger.info(`Evaluaciones para ${userId} obtenidas del caché`);
        return cachedData;
      }
    }

    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('evaluations')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const evaluations = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      }));

      // Guardar en caché por 10 minutos
      if (useCache) {
        await cacheService.set(cacheKey, evaluations, 600);
      }

      logger.info(`${evaluations.length} evaluaciones obtenidas para ${userId}`);
      return evaluations;
    } catch (error) {
      logger.error(`Error obteniendo evaluaciones para ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuario con caché
   */
  async getUserStats(userId: string, useCache: boolean = true): Promise<any> {
    const cacheKey = `user_stats:${userId}`;
    
    if (useCache) {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(`Estadísticas de usuario ${userId} obtenidas del caché`);
        return cachedData;
      }
    }

    try {
      // Obtener conteos en paralelo
      const [diaryCount, evaluationCount, lastEntry] = await Promise.all([
        this.getDiaryEntriesCount(userId),
        this.getEvaluationsCount(userId),
        this.getLastDiaryEntry(userId)
      ]);

      const stats = {
        totalDiaryEntries: diaryCount,
        totalEvaluations: evaluationCount,
        lastEntryDate: lastEntry?.createdAt || null,
        streak: await this.calculateStreak(userId),
        averageMood: await this.calculateAverageMood(userId)
      };

      // Guardar en caché por 30 minutos
      if (useCache) {
        await cacheService.set(cacheKey, stats, 1800);
      }

      logger.info(`Estadísticas calculadas para ${userId}`);
      return stats;
    } catch (error) {
      logger.error(`Error calculando estadísticas para ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener conteo de entradas del diario
   */
  private async getDiaryEntriesCount(userId: string): Promise<number> {
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', userId)
        .get();
      
      return snapshot.size;
    } catch (error) {
      logger.error(`Error obteniendo conteo de entradas para ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Obtener conteo de evaluaciones
   */
  private async getEvaluationsCount(userId: string): Promise<number> {
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('evaluations')
        .where('userId', '==', userId)
        .get();
      
      return snapshot.size;
    } catch (error) {
      logger.error(`Error obteniendo conteo de evaluaciones para ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Obtener última entrada del diario
   */
  private async getLastDiaryEntry(userId: string): Promise<any> {
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      logger.error(`Error obteniendo última entrada para ${userId}:`, error);
      return null;
    }
  }

  /**
   * Calcular racha de días consecutivos
   */
  private async calculateStreak(userId: string): Promise<number> {
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      if (snapshot.empty) {
        return 0;
      }

      let streak = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      for (const doc of snapshot.docs) {
        const entryDate = doc.data().createdAt.toDate();
        entryDate.setHours(0, 0, 0, 0);

        if (entryDate.getTime() === currentDate.getTime()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (entryDate.getTime() < currentDate.getTime()) {
          break;
        }
      }

      return streak;
    } catch (error) {
      logger.error(`Error calculando racha para ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Calcular promedio de estado de ánimo
   */
  private async calculateAverageMood(userId: string): Promise<number> {
    try {
      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('evaluations')
        .where('userId', '==', userId)
        .get();

      if (snapshot.empty) {
        return 0;
      }

      let totalMood = 0;
      let count = 0;

      snapshot.docs.forEach((doc: any) => {
        const data = doc.data();
        if (data.mood && typeof data.mood === 'number') {
          totalMood += data.mood;
          count++;
        }
      });

      return count > 0 ? Math.round((totalMood / count) * 10) / 10 : 0;
    } catch (error) {
      logger.error(`Error calculando promedio de estado de ánimo para ${userId}:`, error);
      return 0;
    }
  }

  /**
   * Limpiar caché de usuario
   */
  async clearUserCache(userId: string): Promise<void> {
    const patterns = [
      `user_data:${userId}`,
      `diary_entries:${userId}:*`,
      `evaluations:${userId}:*`,
      `user_stats:${userId}`
    ];

    for (const pattern of patterns) {
      await cacheService.deletePattern(pattern);
    }

    logger.info(`Caché limpiado para usuario ${userId}`);
  }

  /**
   * Obtener métricas de rendimiento
   */
  async getPerformanceMetrics(): Promise<any> {
    try {
      const cacheStats = await cacheService.getStats();
      
      return {
        cache: cacheStats,
        queryCache: {
          size: this.queryCache.size,
          hitRate: this.calculateQueryCacheHitRate()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error obteniendo métricas de rendimiento:', error);
      return { error: (error as Error).message };
    }
  }

  /**
   * Calcular tasa de aciertos del caché de consultas
   */
  private calculateQueryCacheHitRate(): number {
    const entries = Array.from(this.queryCache.values());
    const totalHits = entries.reduce((sum, entry) => sum + (entry.data ? 1 : 0), 0);
    return entries.length > 0 ? (totalHits / entries.length) * 100 : 0;
  }
}

export const databaseOptimizationService = new DatabaseOptimizationService();

import FirebaseService from './firebase.service';
import { DiaryEntry, CreateDiaryEntryRequest, UpdateDiaryEntryRequest, DiaryEntryResponse, DiaryStats, DiaryFilters } from '../models/diary.model';
import { logger } from '../utils/logger.util';
import encryptionUtil from '../utils/encryption.util';
import { Timestamp } from 'firebase-admin/firestore';

class DiaryService {
  private db = FirebaseService.getFirestore();

  async createDiaryEntry(userId: string, data: CreateDiaryEntryRequest): Promise<DiaryEntry> {
    try {
      // Validar datos de entrada
      const validatedData = data;

      const diaryEntry: DiaryEntry = {
        id: '', // Se asignará automáticamente
        userId,
        date: Timestamp.now(),
        mood: validatedData.mood,
        moodScore: validatedData.moodScore,
        content: encryptionUtil.encrypt(validatedData.content), // Encriptar contenido
        tags: validatedData.tags || [],
        exerciseType: validatedData.exerciseType || 'none',
        exerciseDuration: validatedData.exerciseDuration || 0,
        exerciseEffectiveness: validatedData.exerciseEffectiveness || 0,
        anxietyLevel: validatedData.anxietyLevel || 5,
        anxietyTriggers: validatedData.anxietyTriggers || [],
        reflection: validatedData.reflection ? encryptionUtil.encrypt(validatedData.reflection) : '',
        insights: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isEncrypted: true,
        version: 1,
        location: validatedData.location
      };

      const docRef = await this.db.collection('diary_entries').add(diaryEntry);
      
      // Actualizar estadísticas del usuario
      await this.updateUserStats(userId, 'diary_entry');
      
      logger.info(`Entrada del diario creada para usuario ${userId}`);
      return { ...diaryEntry, id: docRef.id };
    } catch (error) {
      logger.error(`Error creando entrada del diario para usuario ${userId}:`, error);
      throw new Error('No se pudo crear la entrada del diario');
    }
  }

  async getDiaryEntries(userId: string, filters: DiaryFilters = {}): Promise<DiaryEntry[]> {
    try {
      let query = this.db
        .collection('diary_entries')
        .where('userId', '==', userId);

      // Aplicar filtros
      if (filters.mood && filters.mood.length > 0) {
        query = query.where('mood', 'in', filters.mood);
      }

      if (filters.exerciseType && filters.exerciseType.length > 0) {
        query = query.where('exerciseType', 'in', filters.exerciseType);
      }

      if (filters.dateFrom) {
        query = query.where('date', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('date', '<=', filters.dateTo);
      }

      if (filters.anxietyLevelMin !== undefined) {
        query = query.where('anxietyLevel', '>=', filters.anxietyLevelMin);
      }

      if (filters.anxietyLevelMax !== undefined) {
        query = query.where('anxietyLevel', '<=', filters.anxietyLevelMax);
      }

      // Ordenar por fecha descendente
      query = query.orderBy('date', 'desc');

      // Aplicar límite y offset
      if (filters.offset) {
        query = query.offset(filters.offset);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      } else {
        query = query.limit(50); // Límite por defecto
      }

      const snapshot = await query.get();
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DiaryEntry[];

      // Filtrar por etiquetas si es necesario
      if (filters.tags && filters.tags.length > 0) {
        return entries.filter(entry => 
          filters.tags!.some(tag => entry.tags.includes(tag))
        );
      }

      return entries;
    } catch (error) {
      logger.error(`Error obteniendo entradas del diario para usuario ${userId}:`, error);
      throw new Error('No se pudieron obtener las entradas del diario');
    }
  }

  async getDiaryEntryById(userId: string, entryId: string): Promise<DiaryEntry | null> {
    try {
      const doc = await this.db
        .collection('diary_entries')
        .doc(entryId)
        .get();

      if (!doc.exists || doc.data()?.userId !== userId) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as DiaryEntry;
    } catch (error) {
      logger.error(`Error obteniendo entrada del diario ${entryId}:`, error);
      throw new Error('No se pudo obtener la entrada del diario');
    }
  }

  async updateDiaryEntry(userId: string, entryId: string, data: UpdateDiaryEntryRequest): Promise<DiaryEntry | null> {
    try {
      const entry = await this.getDiaryEntryById(userId, entryId);
      if (!entry) {
        return null;
      }

      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      // Actualizar campos si se proporcionan
      if (data.mood !== undefined) updateData.mood = data.mood;
      if (data.moodScore !== undefined) updateData.moodScore = data.moodScore;
      if (data.content !== undefined) updateData.content = encryptionUtil.encrypt(data.content);
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.exerciseType !== undefined) updateData.exerciseType = data.exerciseType;
      if (data.exerciseDuration !== undefined) updateData.exerciseDuration = data.exerciseDuration;
      if (data.exerciseEffectiveness !== undefined) updateData.exerciseEffectiveness = data.exerciseEffectiveness;
      if (data.anxietyLevel !== undefined) updateData.anxietyLevel = data.anxietyLevel;
      if (data.anxietyTriggers !== undefined) updateData.anxietyTriggers = data.anxietyTriggers;
      if (data.reflection !== undefined) updateData.reflection = encryptionUtil.encrypt(data.reflection);
      if (data.location !== undefined) updateData.location = data.location;

      await this.db
        .collection('diary_entries')
        .doc(entryId)
        .update(updateData);

      const updatedEntry = await this.getDiaryEntryById(userId, entryId);
      logger.info(`Entrada del diario actualizada: ${entryId}`);
      
      return updatedEntry;
    } catch (error) {
      logger.error(`Error actualizando entrada del diario ${entryId}:`, error);
      throw new Error('No se pudo actualizar la entrada del diario');
    }
  }

  async deleteDiaryEntry(userId: string, entryId: string): Promise<boolean> {
    try {
      const entry = await this.getDiaryEntryById(userId, entryId);
      if (!entry) {
        return false;
      }

      await this.db
        .collection('diary_entries')
        .doc(entryId)
        .delete();

      // Actualizar estadísticas del usuario
      await this.updateUserStats(userId, 'diary_entry_deleted');
      
      logger.info(`Entrada del diario eliminada: ${entryId}`);
      return true;
    } catch (error) {
      logger.error(`Error eliminando entrada del diario ${entryId}:`, error);
      throw new Error('No se pudo eliminar la entrada del diario');
    }
  }

  async getDiaryStats(userId: string): Promise<DiaryStats> {
    try {
      const entries = await this.getDiaryEntries(userId, { limit: 1000 });
      
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          averageMood: 0,
          averageAnxietyLevel: 0,
          mostUsedTags: [],
          exerciseFrequency: [],
          moodTrend: [],
          streak: 0,
          lastEntry: null
        };
      }

      // Calcular estadísticas
      const totalEntries = entries.length;
      const averageMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0) / totalEntries;
      const averageAnxietyLevel = entries.reduce((sum, entry) => sum + entry.anxietyLevel, 0) / totalEntries;

      // Etiquetas más usadas
      const tagCount: { [key: string]: number } = {};
      entries.forEach(entry => {
        entry.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });
      const mostUsedTags = Object.entries(tagCount)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Frecuencia de ejercicios
      const exerciseCount: { [key: string]: number } = {};
      entries.forEach(entry => {
        if (entry.exerciseType !== 'none') {
          exerciseCount[entry.exerciseType] = (exerciseCount[entry.exerciseType] || 0) + 1;
        }
      });
      const exerciseFrequency = Object.entries(exerciseCount)
        .map(([type, count]) => ({ type: type as any, count }))
        .sort((a, b) => b.count - a.count);

      // Tendencia de estado de ánimo (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEntries = entries.filter(entry => 
        entry.date.toDate() >= thirtyDaysAgo
      ).sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());

      const moodTrend = recentEntries.map(entry => ({
        date: entry.date.toDate().toISOString().split('T')[0],
        mood: entry.moodScore,
        anxiety: entry.anxietyLevel
      }));

      // Calcular racha actual
      const streak = this.calculateStreak(entries);

      return {
        totalEntries,
        averageMood: Math.round(averageMood * 10) / 10,
        averageAnxietyLevel: Math.round(averageAnxietyLevel * 10) / 10,
        mostUsedTags,
        exerciseFrequency,
        moodTrend,
        streak,
        lastEntry: entries[0]?.date.toDate().toISOString() || null
      };
    } catch (error) {
      logger.error(`Error calculando estadísticas del diario para usuario ${userId}:`, error);
      throw new Error('No se pudieron calcular las estadísticas del diario');
    }
  }

  private calculateStreak(entries: DiaryEntry[]): number {
    if (entries.length === 0) return 0;

    const sortedEntries = entries.sort((a, b) => 
      b.date.toDate().getTime() - a.date.toDate().getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date.toDate());
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private async updateUserStats(userId: string, action: string): Promise<void> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return;

      const userData = userDoc.data();
      const stats = userData?.stats || {};
      
      switch (action) {
        case 'diary_entry':
          stats.totalDiaryEntries = (stats.totalDiaryEntries || 0) + 1;
          stats.lastDiaryEntry = Timestamp.now();
          break;
        case 'diary_entry_deleted':
          stats.totalDiaryEntries = Math.max((stats.totalDiaryEntries || 0) - 1, 0);
          break;
      }
      
      await userRef.update({ stats });
    } catch (error) {
      logger.error(`Error actualizando estadísticas del usuario ${userId}:`, error);
    }
  }

  // Convertir DiaryEntry a DiaryEntryResponse para API
  formatDiaryEntryResponse(entry: DiaryEntry): DiaryEntryResponse {
    return {
      id: entry.id,
      userId: entry.userId,
      date: entry.date.toDate().toISOString(),
      mood: entry.mood,
      moodScore: entry.moodScore,
      content: entry.isEncrypted ? encryptionUtil.decrypt(entry.content) : entry.content,
      tags: entry.tags,
      exerciseType: entry.exerciseType,
      exerciseDuration: entry.exerciseDuration,
      exerciseEffectiveness: entry.exerciseEffectiveness,
      anxietyLevel: entry.anxietyLevel,
      anxietyTriggers: entry.anxietyTriggers,
      reflection: entry.isEncrypted ? encryptionUtil.decrypt(entry.reflection) : entry.reflection,
      insights: entry.insights,
      createdAt: entry.createdAt.toDate().toISOString(),
      updatedAt: entry.updatedAt.toDate().toISOString(),
      isEncrypted: entry.isEncrypted,
      version: entry.version,
      location: entry.location
    };
  }
}

export default new DiaryService();

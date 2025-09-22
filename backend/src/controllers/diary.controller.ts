import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import FirebaseService from '../services/firebase.service';

class DiaryController {
  // Crear nueva entrada del diario
  async createEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { content, mood, tags, date } = req.body;

      // Validación básica
      if (!content || !mood) {
        res.status(400).json({
          success: false,
          error: 'Campos requeridos faltantes',
          message: 'Content y mood son obligatorios'
        });
        return;
      }

      const diaryEntry = {
        userId,
        content,
        mood: parseInt(mood),
        tags: tags || [],
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const db = FirebaseService.getFirestore();
      const docRef = await db.collection('diary_entries').add(diaryEntry);

      logger.info(`Nueva entrada del diario creada: ${docRef.id} para usuario: ${userId}`);

      res.status(201).json({
        success: true,
        data: {
          id: docRef.id,
          ...diaryEntry
        },
        message: 'Entrada del diario creada exitosamente'
      });

    } catch (error) {
      logger.error('Error creando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo crear la entrada del diario'
      });
    }
  }

  // Obtener entradas del diario
  async getEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { limit = 10, offset = 0, startDate, endDate } = req.query;

      const db = FirebaseService.getFirestore();
      let query = db.collection('diary_entries')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));

      // Filtros opcionales
      if (startDate) {
        query = query.where('date', '>=', startDate);
      }
      if (endDate) {
        query = query.where('date', '<=', endDate);
      }

      const snapshot = await query.get();
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      logger.info(`Entradas del diario obtenidas para usuario: ${userId}, cantidad: ${entries.length}`);

      res.status(200).json({
        success: true,
        data: entries,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: entries.length
        }
      });

    } catch (error) {
      logger.error('Error obteniendo entradas del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las entradas del diario'
      });
    }
  }

  // Obtener estadísticas del diario
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { period = '30d' } = req.query;

      const db = FirebaseService.getFirestore();
      const now = new Date();
      const startDate = new Date(now.getTime() - (parseInt(period as string) * 24 * 60 * 60 * 1000));

      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', userId)
        .where('date', '>=', startDate.toISOString())
        .get();

      const entries = snapshot.docs.map(doc => doc.data());
      
      // Calcular estadísticas
      const totalEntries = entries.length;
      const avgMood = entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries || 0;
      const moodDistribution = entries.reduce((acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1;
        return acc;
      }, {});

      logger.info(`Estadísticas del diario calculadas para usuario: ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          totalEntries,
          avgMood: Math.round(avgMood * 100) / 100,
          moodDistribution,
          period: period
        }
      });

    } catch (error) {
      logger.error('Error calculando estadísticas del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron calcular las estadísticas'
      });
    }
  }

  // Buscar entradas del diario
  async searchEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { q, tags, mood, limit = 10 } = req.query;

      if (!q && !tags && !mood) {
        res.status(400).json({
          success: false,
          error: 'Parámetros de búsqueda requeridos',
          message: 'Debe proporcionar al menos un criterio de búsqueda'
        });
        return;
      }

      const db = FirebaseService.getFirestore();
      let query = db.collection('diary_entries').where('userId', '==', userId);

      // Filtros
      if (mood) {
        query = query.where('mood', '==', parseInt(mood as string));
      }

      const snapshot = await query.limit(parseInt(limit as string)).get();
      let entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filtros adicionales en memoria
      if (q) {
        const searchTerm = (q as string).toLowerCase();
        entries = entries.filter(entry => 
          entry.content.toLowerCase().includes(searchTerm)
        );
      }

      if (tags) {
        const searchTags = (tags as string).split(',');
        entries = entries.filter(entry => 
          searchTags.some(tag => entry.tags.includes(tag))
        );
      }

      logger.info(`Búsqueda en diario realizada para usuario: ${userId}, resultados: ${entries.length}`);

      res.status(200).json({
        success: true,
        data: entries,
        query: { q, tags, mood, limit }
      });

    } catch (error) {
      logger.error('Error buscando en el diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda'
      });
    }
  }

  // Obtener entrada específica
  async getEntryById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { entryId } = req.params;

      const db = FirebaseService.getFirestore();
      const doc = await db.collection('diary_entries').doc(entryId).get();

      if (!doc.exists) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe'
        });
        return;
      }

      const entry = doc.data();
      if (entry.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos para acceder a esta entrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: doc.id,
          ...entry
        }
      });

    } catch (error) {
      logger.error('Error obteniendo entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la entrada'
      });
    }
  }

  // Actualizar entrada del diario
  async updateEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { entryId } = req.params;
      const { content, mood, tags } = req.body;

      const db = FirebaseService.getFirestore();
      const docRef = db.collection('diary_entries').doc(entryId);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe'
        });
        return;
      }

      const entry = doc.data();
      if (entry.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos para modificar esta entrada'
        });
        return;
      }

      const updateData = {
        ...(content && { content }),
        ...(mood && { mood: parseInt(mood) }),
        ...(tags && { tags }),
        updatedAt: new Date().toISOString()
      };

      await docRef.update(updateData);

      logger.info(`Entrada del diario actualizada: ${entryId} por usuario: ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          id: entryId,
          ...updateData
        },
        message: 'Entrada del diario actualizada exitosamente'
      });

    } catch (error) {
      logger.error('Error actualizando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar la entrada'
      });
    }
  }

  // Eliminar entrada del diario
  async deleteEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      const { entryId } = req.params;

      const db = FirebaseService.getFirestore();
      const docRef = db.collection('diary_entries').doc(entryId);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe'
        });
        return;
      }

      const entry = doc.data();
      if (entry.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos para eliminar esta entrada'
        });
        return;
      }

      await docRef.delete();

      logger.info(`Entrada del diario eliminada: ${entryId} por usuario: ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Entrada del diario eliminada exitosamente'
      });

    } catch (error) {
      logger.error('Error eliminando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo eliminar la entrada'
      });
    }
  }
}

export default new DiaryController();
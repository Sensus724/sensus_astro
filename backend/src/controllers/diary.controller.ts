import { Request, Response } from 'express';
import diaryService from '../services/diary.service';
import { logger } from '../utils/logger.util';
import { CreateDiaryEntryRequest, UpdateDiaryEntryRequest, DiaryFilters } from '../models/diary.model';

class DiaryController {
  // Crear nueva entrada del diario
  async createEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const data: CreateDiaryEntryRequest = req.body;
      const entry = await diaryService.createDiaryEntry(userId, data);
      const response = diaryService.formatDiaryEntryResponse(entry);

      logger.info(`Entrada del diario creada para usuario ${userId}`);
      res.status(201).json({
        success: true,
        data: response,
        message: 'Entrada del diario creada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener entradas del diario con filtros
  async getEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const filters: DiaryFilters = {
        mood: req.query.mood ? (req.query.mood as string).split(',') as any : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        exerciseType: req.query.exerciseType ? (req.query.exerciseType as string).split(',') as any : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        anxietyLevelMin: req.query.anxietyLevelMin ? parseInt(req.query.anxietyLevelMin as string) : undefined,
        anxietyLevelMax: req.query.anxietyLevelMax ? parseInt(req.query.anxietyLevelMax as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const entries = await diaryService.getDiaryEntries(userId, filters);
      const responses = entries.map(entry => diaryService.formatDiaryEntryResponse(entry));

      res.status(200).json({
        success: true,
        data: responses,
        count: responses.length,
        message: 'Entradas del diario obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo entradas del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener entrada específica del diario
  async getEntryById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { entryId } = req.params;
      const entry = await diaryService.getDiaryEntryById(userId, entryId);

      if (!entry) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe o no tienes permisos para acceder a ella'
        });
        return;
      }

      const response = diaryService.formatDiaryEntryResponse(entry);

      res.status(200).json({
        success: true,
        data: response,
        message: 'Entrada del diario obtenida exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar entrada del diario
  async updateEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { entryId } = req.params;
      const data: UpdateDiaryEntryRequest = req.body;

      const updatedEntry = await diaryService.updateDiaryEntry(userId, entryId, data);

      if (!updatedEntry) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe o no tienes permisos para modificarla'
        });
        return;
      }

      const response = diaryService.formatDiaryEntryResponse(updatedEntry);

      logger.info(`Entrada del diario actualizada: ${entryId}`);
      res.status(200).json({
        success: true,
        data: response,
        message: 'Entrada del diario actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Eliminar entrada del diario
  async deleteEntry(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { entryId } = req.params;
      const deleted = await diaryService.deleteDiaryEntry(userId, entryId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Entrada no encontrada',
          message: 'La entrada del diario no existe o no tienes permisos para eliminarla'
        });
        return;
      }

      logger.info(`Entrada del diario eliminada: ${entryId}`);
      res.status(200).json({
        success: true,
        message: 'Entrada del diario eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando entrada del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener estadísticas del diario
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const stats = await diaryService.getDiaryStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas del diario obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Buscar entradas del diario
  async searchEntries(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { query, limit = 20 } = req.query;
      
      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Query requerido',
          message: 'Debes proporcionar un término de búsqueda'
        });
        return;
      }

      // Obtener todas las entradas del usuario (limitado para búsqueda)
      const entries = await diaryService.getDiaryEntries(userId, { 
        limit: parseInt(limit as string) || 20 
      });

      // Filtrar entradas que contengan el término de búsqueda
      const searchResults = entries.filter(entry => {
        const content = entry.isEncrypted ? 
          // En un caso real, necesitarías desencriptar para buscar
          entry.content : 
          entry.content.toLowerCase();
        
        const reflection = entry.isEncrypted ? 
          entry.reflection : 
          entry.reflection.toLowerCase();

        const searchTerm = query.toLowerCase();
        
        return content.includes(searchTerm) || 
               reflection.includes(searchTerm) ||
               entry.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      });

      const responses = searchResults.map(entry => diaryService.formatDiaryEntryResponse(entry));

      res.status(200).json({
        success: true,
        data: responses,
        count: responses.length,
        query: query,
        message: `Se encontraron ${responses.length} entradas`
      });
    } catch (error) {
      logger.error('Error buscando entradas del diario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default new DiaryController();

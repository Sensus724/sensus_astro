import { Request, Response } from 'express';
import evaluationService from '../services/evaluation.service';
import { logger } from '../utils/logger.util';
import { CreateEvaluationRequest, EvaluationFilters } from '../models/evaluation.model';

class EvaluationController {
  // Crear nueva evaluación
  async createEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const data: CreateEvaluationRequest = req.body;
      const evaluation = await evaluationService.createEvaluation(userId, data);
      const response = evaluationService.formatEvaluationResponse(evaluation);

      logger.info(`Evaluación creada para usuario ${userId}: ${data.testType}`);
      res.status(201).json({
        success: true,
        data: response,
        message: 'Evaluación completada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener evaluaciones con filtros
  async getEvaluations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const filters: EvaluationFilters = {
        testType: req.query.testType ? (req.query.testType as string).split(',') as any : undefined,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        scoreMin: req.query.scoreMin ? parseInt(req.query.scoreMin as string) : undefined,
        scoreMax: req.query.scoreMax ? parseInt(req.query.scoreMax as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const evaluations = await evaluationService.getEvaluations(userId, filters);
      const responses = evaluations.map(evaluation => 
        evaluationService.formatEvaluationResponse(evaluation)
      );

      res.status(200).json({
        success: true,
        data: responses,
        count: responses.length,
        message: 'Evaluaciones obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener evaluación específica
  async getEvaluationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { evaluationId } = req.params;
      const evaluation = await evaluationService.getEvaluationById(userId, evaluationId);

      if (!evaluation) {
        res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada',
          message: 'La evaluación no existe o no tienes permisos para acceder a ella'
        });
        return;
      }

      const response = evaluationService.formatEvaluationResponse(evaluation);

      res.status(200).json({
        success: true,
        data: response,
        message: 'Evaluación obtenida exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener evaluaciones por tipo de test
  async getEvaluationsByTestType(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { testType } = req.params;
      
      if (!['gad7', 'phq9', 'pss', 'wellness', 'selfesteem'].includes(testType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de test inválido',
          message: 'El tipo de test debe ser uno de: gad7, phq9, pss, wellness, selfesteem'
        });
        return;
      }

      const evaluations = await evaluationService.getEvaluationsByTestType(userId, testType as any);
      const responses = evaluations.map(evaluation => 
        evaluationService.formatEvaluationResponse(evaluation)
      );

      res.status(200).json({
        success: true,
        data: responses,
        count: responses.length,
        testType: testType,
        message: `Evaluaciones de ${testType} obtenidas exitosamente`
      });
    } catch (error) {
      logger.error('Error obteniendo evaluaciones por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener estadísticas de evaluaciones
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const stats = await evaluationService.getEvaluationStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas de evaluaciones obtenidas exitosamente'
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener última evaluación de un tipo específico
  async getLatestEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { testType } = req.params;
      
      if (!['gad7', 'phq9', 'pss', 'wellness', 'selfesteem'].includes(testType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de test inválido',
          message: 'El tipo de test debe ser uno de: gad7, phq9, pss, wellness, selfesteem'
        });
        return;
      }

      const evaluations = await evaluationService.getEvaluationsByTestType(userId, testType as any);
      
      if (evaluations.length === 0) {
        res.status(404).json({
          success: false,
          error: 'No hay evaluaciones',
          message: `No se encontraron evaluaciones de tipo ${testType}`
        });
        return;
      }

      const latestEvaluation = evaluations[0]; // Ya están ordenadas por fecha descendente
      const response = evaluationService.formatEvaluationResponse(latestEvaluation);

      res.status(200).json({
        success: true,
        data: response,
        message: `Última evaluación de ${testType} obtenida exitosamente`
      });
    } catch (error) {
      logger.error('Error obteniendo última evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Comparar evaluaciones (última vs anterior)
  async compareEvaluations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const { testType } = req.params;
      
      if (!['gad7', 'phq9', 'pss', 'wellness', 'selfesteem'].includes(testType)) {
        res.status(400).json({
          success: false,
          error: 'Tipo de test inválido',
          message: 'El tipo de test debe ser uno de: gad7, phq9, pss, wellness, selfesteem'
        });
        return;
      }

      const evaluations = await evaluationService.getEvaluationsByTestType(userId, testType as any);
      
      if (evaluations.length < 2) {
        res.status(404).json({
          success: false,
          error: 'Evaluaciones insuficientes',
          message: 'Se necesitan al menos 2 evaluaciones para hacer la comparación'
        });
        return;
      }

      const latest = evaluations[0];
      const previous = evaluations[1];

      const isLowerBetter = ['gad7', 'phq9', 'pss'].includes(testType);
      const scoreDifference = latest.score - previous.score;
      const improvement = isLowerBetter ? -scoreDifference : scoreDifference;
      const improvementPercentage = (improvement / previous.score) * 100;

      const comparison = {
        latest: evaluationService.formatEvaluationResponse(latest),
        previous: evaluationService.formatEvaluationResponse(previous),
        comparison: {
          scoreDifference,
          improvement,
          improvementPercentage: Math.round(improvementPercentage * 100) / 100,
          isImprovement: isLowerBetter ? scoreDifference < 0 : scoreDifference > 0,
          daysBetween: Math.floor(
            (latest.completedAt.toDate().getTime() - previous.completedAt.toDate().getTime()) / 
            (1000 * 60 * 60 * 24)
          )
        }
      };

      res.status(200).json({
        success: true,
        data: comparison,
        message: `Comparación de evaluaciones de ${testType} obtenida exitosamente`
      });
    } catch (error) {
      logger.error('Error comparando evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

export default new EvaluationController();

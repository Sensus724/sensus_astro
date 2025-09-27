import { Request, Response } from 'express';
import { logger } from '../utils/logger.util';
import FirebaseService from '../services/firebase.service';

class EvaluationController {
  // Crear nueva evaluación GAD-7
  async createEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { answers, totalScore, date } = req.body;

      // Validación de respuestas GAD-7
      if (!answers || !Array.isArray(answers) || answers.length !== 7) {
        res.status(400).json({
          success: false,
          error: 'Respuestas inválidas',
          message: 'Debe proporcionar exactamente 7 respuestas para el GAD-7'
        });
        return;
      }

      // Validar que las respuestas estén en el rango correcto (0-3)
      const validAnswers = answers.every(answer => 
        typeof answer === 'number' && answer >= 0 && answer <= 3
      );

      if (!validAnswers) {
        res.status(400).json({
          success: false,
          error: 'Respuestas inválidas',
          message: 'Las respuestas deben estar entre 0 y 3'
        });
        return;
      }

      // Calcular puntuación total
      const calculatedScore = answers.reduce((sum, answer) => sum + answer, 0);
      
      if (totalScore && totalScore !== calculatedScore) {
        res.status(400).json({
          success: false,
          error: 'Puntuación inconsistente',
          message: 'La puntuación total no coincide con las respuestas'
        });
        return;
      }

      // Determinar nivel de ansiedad
      let anxietyLevel = 'mínima';
      let recommendation = 'Continúa con tus actividades normales';
      
      if (calculatedScore >= 15) {
        anxietyLevel = 'severa';
        recommendation = 'Es recomendable buscar ayuda profesional inmediatamente';
      } else if (calculatedScore >= 10) {
        anxietyLevel = 'moderada';
        recommendation = 'Considera hablar con un profesional de la salud mental';
      } else if (calculatedScore >= 5) {
        anxietyLevel = 'leve';
        recommendation = 'Puedes beneficiarte de técnicas de relajación y mindfulness';
      }

      const evaluation = {
        userId,
        answers,
        totalScore: calculatedScore,
        anxietyLevel,
        recommendation,
        date: date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const db = FirebaseService.getFirestore();
      const docRef = await db.collection('evaluations').add(evaluation);

      logger.info(`Nueva evaluación GAD-7 creada: ${docRef.id} para usuario: ${userId}, puntuación: ${calculatedScore}`);

      res.status(201).json({
        success: true,
        data: {
          id: docRef.id,
          ...evaluation
        },
        message: 'Evaluación completada exitosamente'
      });

    } catch (error) {
      logger.error('Error creando evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo completar la evaluación'
      });
    }
  }

  // Obtener evaluaciones del usuario
  async getEvaluations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { limit = 10, offset = 0, startDate, endDate } = req.query;

      const db = FirebaseService.getFirestore();
      let query = db.collection('evaluations')
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
      const evaluations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      logger.info(`Evaluaciones obtenidas para usuario: ${userId}, cantidad: ${evaluations.length}`);

      res.status(200).json({
        success: true,
        data: evaluations,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: evaluations.length
        }
      });

    } catch (error) {
      logger.error('Error obteniendo evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las evaluaciones'
      });
    }
  }

  // Obtener estadísticas de evaluaciones
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { period = '30d' } = req.query;

      const db = FirebaseService.getFirestore();
      const now = new Date();
      const startDate = new Date(now.getTime() - (parseInt(period as string) * 24 * 60 * 60 * 1000));

      const snapshot = await db.collection('evaluations')
        .where('userId', '==', userId)
        .where('date', '>=', startDate.toISOString())
        .get();

      const evaluations = snapshot.docs.map(doc => doc.data());
      
      // Calcular estadísticas
      const totalEvaluations = evaluations.length;
      const avgScore = evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / totalEvaluations || 0;
      
      const levelDistribution = evaluations.reduce((acc, evaluation) => {
        acc[evaluation.anxietyLevel] = (acc[evaluation.anxietyLevel] || 0) + 1;
        return acc;
      }, {});

      // Calcular tendencia
      const recentEvaluations = evaluations.slice(0, 3);
      const olderEvaluations = evaluations.slice(-3);
      const recentAvg = recentEvaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / recentEvaluations.length || 0;
      const olderAvg = olderEvaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / olderEvaluations.length || 0;
      const trend = recentAvg - olderAvg;

      logger.info(`Estadísticas de evaluaciones calculadas para usuario: ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          totalEvaluations,
          avgScore: Math.round(avgScore * 100) / 100,
          levelDistribution,
          trend: Math.round(trend * 100) / 100,
          trendDirection: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          period: period
        }
      });

    } catch (error) {
      logger.error('Error calculando estadísticas de evaluaciones:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron calcular las estadísticas'
      });
    }
  }

  // Obtener evaluación específica
  async getEvaluationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { evaluationId } = req.params;

      const db = FirebaseService.getFirestore();
      const doc = await db.collection('evaluations').doc(evaluationId).get();

      if (!doc.exists) {
        res.status(404).json({
          success: false,
          error: 'Evaluación no encontrada',
          message: 'La evaluación no existe'
        });
        return;
      }

      const evaluation = doc.data();
      if (evaluation && evaluation.userId !== userId) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos para acceder a esta evaluación'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: doc.id,
          ...evaluation
        }
      });

    } catch (error) {
      logger.error('Error obteniendo evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la evaluación'
      });
    }
  }

  // Obtener la última evaluación
  async getLatestEvaluation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const db = FirebaseService.getFirestore();
      const snapshot = await db.collection('evaluations')
        .where('userId', '==', userId)
        .orderBy('date', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        res.status(404).json({
          success: false,
          error: 'No hay evaluaciones',
          message: 'No se encontraron evaluaciones para este usuario'
        });
        return;
      }

      const doc = snapshot.docs[0];
      const evaluation = {
        id: doc.id,
        ...doc.data()
      };

      res.status(200).json({
        success: true,
        data: evaluation
      });

    } catch (error) {
      logger.error('Error obteniendo última evaluación:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la última evaluación'
      });
    }
  }
}

export default new EvaluationController();
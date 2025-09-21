import FirebaseService from './firebase.service';
import { Evaluation, CreateEvaluationRequest, UpdateEvaluationRequest, EvaluationResponse, EvaluationStats, EvaluationFilters, TestType } from '../models/evaluation.model';
import { logger } from '../utils/logger.util';
import { Timestamp } from 'firebase-admin/firestore';

class EvaluationService {
  private db = FirebaseService.getFirestore();

  async createEvaluation(userId: string, data: CreateEvaluationRequest): Promise<Evaluation> {
    try {
      // Validar datos de entrada
      const validatedData = data;

      // Validar respuestas específicas según el tipo de test
      this.validateTestAnswers(validatedData.testType, validatedData.answers);

      const evaluation: Evaluation = {
        id: '', // Se asignará automáticamente
        userId,
        testType: validatedData.testType,
        testVersion: validatedData.testVersion || '1.0',
        testName: validatedData.testName,
        answers: validatedData.answers,
        score: validatedData.score,
        maxScore: validatedData.maxScore,
        interpretation: this.generateInterpretation(validatedData.testType, validatedData.score, validatedData.maxScore),
        completedAt: Timestamp.now(),
        duration: validatedData.duration || 0,
        isAnonymous: validatedData.isAnonymous || false,
        metadata: {
          deviceType: 'desktop',
          browser: '',
          location: '',
          userAgent: '',
          ...validatedData.metadata
        }
      };

      const docRef = await this.db.collection('evaluations').add(evaluation);
      
      // Actualizar estadísticas del usuario
      await this.updateUserStats(userId, 'evaluation');
      
      logger.info(`Evaluación creada para usuario ${userId}: ${validatedData.testType}`);
      return { ...evaluation, id: docRef.id };
    } catch (error) {
      logger.error(`Error creando evaluación para usuario ${userId}:`, error);
      throw new Error('No se pudo crear la evaluación');
    }
  }

  async getEvaluations(userId: string, filters: EvaluationFilters = {}): Promise<Evaluation[]> {
    try {
      let query = this.db
        .collection('evaluations')
        .where('userId', '==', userId);

      // Aplicar filtros
      if (filters.testType && filters.testType.length > 0) {
        query = query.where('testType', 'in', filters.testType);
      }

      if (filters.dateFrom) {
        query = query.where('completedAt', '>=', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.where('completedAt', '<=', filters.dateTo);
      }

      if (filters.scoreMin !== undefined) {
        query = query.where('score', '>=', filters.scoreMin);
      }

      if (filters.scoreMax !== undefined) {
        query = query.where('score', '<=', filters.scoreMax);
      }

      // Ordenar por fecha de completado descendente
      query = query.orderBy('completedAt', 'desc');

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
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Evaluation[];
    } catch (error) {
      logger.error(`Error obteniendo evaluaciones para usuario ${userId}:`, error);
      throw new Error('No se pudieron obtener las evaluaciones');
    }
  }

  async getEvaluationById(userId: string, evaluationId: string): Promise<Evaluation | null> {
    try {
      const doc = await this.db
        .collection('evaluations')
        .doc(evaluationId)
        .get();

      if (!doc.exists || doc.data()?.userId !== userId) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as Evaluation;
    } catch (error) {
      logger.error(`Error obteniendo evaluación ${evaluationId}:`, error);
      throw new Error('No se pudo obtener la evaluación');
    }
  }

  async getEvaluationsByTestType(userId: string, testType: TestType): Promise<Evaluation[]> {
    try {
      const snapshot = await this.db
        .collection('evaluations')
        .where('userId', '==', userId)
        .where('testType', '==', testType)
        .orderBy('completedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Evaluation[];
    } catch (error) {
      logger.error(`Error obteniendo evaluaciones de tipo ${testType} para usuario ${userId}:`, error);
      throw new Error('No se pudieron obtener las evaluaciones');
    }
  }

  async getEvaluationStats(userId: string): Promise<EvaluationStats> {
    try {
      const evaluations = await this.getEvaluations(userId, { limit: 1000 });
      
      if (evaluations.length === 0) {
        return {
          totalEvaluations: 0,
          averageScore: 0,
          testTypeFrequency: [],
          scoreTrend: [],
          lastEvaluation: null,
          improvementRate: 0
        };
      }

      // Calcular estadísticas
      const totalEvaluations = evaluations.length;
      const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / totalEvaluations;

      // Frecuencia por tipo de test
      const testTypeCount: { [key: string]: number } = {};
      evaluations.forEach(evaluation => {
        testTypeCount[evaluation.testType] = (testTypeCount[evaluation.testType] || 0) + 1;
      });
      const testTypeFrequency = Object.entries(testTypeCount)
        .map(([type, count]) => ({ type: type as TestType, count }))
        .sort((a, b) => b.count - a.count);

      // Tendencia de puntuaciones (últimos 30 días)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEvaluations = evaluations.filter(evaluation => 
        evaluation.completedAt.toDate() >= thirtyDaysAgo
      ).sort((a, b) => a.completedAt.toDate().getTime() - b.completedAt.toDate().getTime());

      const scoreTrend = recentEvaluations.map(evaluation => ({
        date: evaluation.completedAt.toDate().toISOString().split('T')[0],
        score: evaluation.score,
        testType: evaluation.testType
      }));

      // Calcular tasa de mejora
      const improvementRate = this.calculateImprovementRate(evaluations);

      return {
        totalEvaluations,
        averageScore: Math.round(averageScore * 10) / 10,
        testTypeFrequency,
        scoreTrend,
        lastEvaluation: evaluations[0]?.completedAt.toDate().toISOString() || null,
        improvementRate
      };
    } catch (error) {
      logger.error(`Error calculando estadísticas de evaluaciones para usuario ${userId}:`, error);
      throw new Error('No se pudieron calcular las estadísticas de evaluaciones');
    }
  }

  private validateTestAnswers(testType: TestType, answers: number[]): void {
    switch (testType) {
      case 'gad7':
        if (answers.length !== 7) {
          throw new Error('GAD-7 requiere exactamente 7 respuestas');
        }
        break;
      case 'phq9':
        if (answers.length !== 9) {
          throw new Error('PHQ-9 requiere exactamente 9 respuestas');
        }
        break;
      case 'pss':
        if (answers.length !== 10) {
          throw new Error('PSS requiere exactamente 10 respuestas');
        }
        break;
      case 'wellness':
      case 'selfesteem':
        // Validaciones básicas para otros tests
        if (answers.length === 0) {
          throw new Error('Las respuestas no pueden estar vacías');
        }
        break;
    }
  }

  private generateInterpretation(testType: TestType, score: number, maxScore: number): Evaluation['interpretation'] {
    const percentage = (score / maxScore) * 100;
    
    switch (testType) {
      case 'gad7':
        return this.interpretGAD7(score);
      case 'phq9':
        return this.interpretPHQ9(score);
      case 'pss':
        return this.interpretPSS(score);
      case 'wellness':
        return this.interpretWellness(percentage);
      case 'selfesteem':
        return this.interpretSelfEsteem(percentage);
      default:
        return {
          level: 'unknown',
          description: 'Interpretación no disponible',
          recommendations: []
        };
    }
  }

  private interpretGAD7(score: number): Evaluation['interpretation'] {
    if (score <= 4) {
      return {
        level: 'minimal',
        description: 'Ansiedad mínima',
        recommendations: ['Mantén tus hábitos saludables', 'Continúa con el seguimiento regular'],
        riskLevel: 'low'
      };
    } else if (score <= 9) {
      return {
        level: 'mild',
        description: 'Ansiedad leve',
        recommendations: ['Practica técnicas de relajación', 'Considera ejercicios de respiración'],
        riskLevel: 'low'
      };
    } else if (score <= 14) {
      return {
        level: 'moderate',
        description: 'Ansiedad moderada',
        recommendations: ['Practica mindfulness diariamente', 'Considera buscar apoyo profesional'],
        riskLevel: 'medium'
      };
    } else {
      return {
        level: 'severe',
        description: 'Ansiedad severa',
        recommendations: ['Busca ayuda profesional inmediatamente', 'Considera terapia cognitivo-conductual'],
        riskLevel: 'high'
      };
    }
  }

  private interpretPHQ9(score: number): Evaluation['interpretation'] {
    if (score <= 4) {
      return {
        level: 'minimal',
        description: 'Depresión mínima',
        recommendations: ['Mantén actividades que disfrutes', 'Continúa con el seguimiento'],
        riskLevel: 'low'
      };
    } else if (score <= 9) {
      return {
        level: 'mild',
        description: 'Depresión leve',
        recommendations: ['Mantén rutinas saludables', 'Considera actividades sociales'],
        riskLevel: 'low'
      };
    } else if (score <= 14) {
      return {
        level: 'moderate',
        description: 'Depresión moderada',
        recommendations: ['Busca apoyo profesional', 'Considera terapia'],
        riskLevel: 'medium'
      };
    } else if (score <= 19) {
      return {
        level: 'moderately_severe',
        description: 'Depresión moderadamente severa',
        recommendations: ['Busca ayuda profesional urgente', 'Considera medicación'],
        riskLevel: 'high'
      };
    } else {
      return {
        level: 'severe',
        description: 'Depresión severa',
        recommendations: ['Busca ayuda profesional inmediatamente', 'Considera hospitalización'],
        riskLevel: 'high'
      };
    }
  }

  private interpretPSS(score: number): Evaluation['interpretation'] {
    if (score <= 13) {
      return {
        level: 'low',
        description: 'Estrés bajo',
        recommendations: ['Mantén tus estrategias actuales', 'Continúa con el bienestar'],
        riskLevel: 'low'
      };
    } else if (score <= 26) {
      return {
        level: 'medium',
        description: 'Estrés moderado',
        recommendations: ['Practica técnicas de relajación', 'Mantén rutinas saludables'],
        riskLevel: 'medium'
      };
    } else {
      return {
        level: 'high',
        description: 'Estrés alto',
        recommendations: ['Busca técnicas de manejo del estrés', 'Considera apoyo profesional'],
        riskLevel: 'high'
      };
    }
  }

  private interpretWellness(percentage: number): Evaluation['interpretation'] {
    if (percentage >= 80) {
      return {
        level: 'high',
        description: 'Excelente bienestar general',
        recommendations: ['Mantén tus hábitos saludables', 'Comparte tus estrategias con otros'],
        riskLevel: 'low'
      };
    } else if (percentage >= 60) {
      return {
        level: 'medium',
        description: 'Buen bienestar general',
        recommendations: ['Continúa con tus actividades positivas', 'Considera nuevas estrategias de bienestar'],
        riskLevel: 'low'
      };
    } else {
      return {
        level: 'low',
        description: 'Bienestar general mejorable',
        recommendations: ['Implementa rutinas de autocuidado', 'Considera buscar apoyo profesional'],
        riskLevel: 'medium'
      };
    }
  }

  private interpretSelfEsteem(percentage: number): Evaluation['interpretation'] {
    if (percentage >= 80) {
      return {
        level: 'high',
        description: 'Autoestima alta',
        recommendations: ['Mantén tu confianza', 'Ayuda a otros a desarrollar su autoestima'],
        riskLevel: 'low'
      };
    } else if (percentage >= 60) {
      return {
        level: 'medium',
        description: 'Autoestima moderada',
        recommendations: ['Practica la autocompasión', 'Celebra tus logros'],
        riskLevel: 'low'
      };
    } else {
      return {
        level: 'low',
        description: 'Autoestima baja',
        recommendations: ['Practica afirmaciones positivas', 'Considera terapia para trabajar la autoestima'],
        riskLevel: 'medium'
      };
    }
  }

  private calculateImprovementRate(evaluations: Evaluation[]): number {
    if (evaluations.length < 2) return 0;

    // Agrupar por tipo de test
    const testGroups: { [key: string]: Evaluation[] } = {};
    evaluations.forEach(evaluation => {
      if (!testGroups[evaluation.testType]) {
        testGroups[evaluation.testType] = [];
      }
      testGroups[evaluation.testType].push(evaluation);
    });

    let totalImprovement = 0;
    let testTypesWithImprovement = 0;

    Object.values(testGroups).forEach(testEvaluations => {
      if (testEvaluations.length >= 2) {
        const sorted = testEvaluations.sort((a, b) => 
          a.completedAt.toDate().getTime() - b.completedAt.toDate().getTime()
        );
        
        const firstScore = sorted[0].score;
        const lastScore = sorted[sorted.length - 1].score;
        
        // Para tests donde menor puntuación es mejor (como GAD-7, PHQ-9)
        const isLowerBetter = ['gad7', 'phq9', 'pss'].includes(sorted[0].testType);
        
        let improvement = 0;
        if (isLowerBetter) {
          improvement = ((firstScore - lastScore) / firstScore) * 100;
        } else {
          improvement = ((lastScore - firstScore) / firstScore) * 100;
        }
        
        totalImprovement += improvement;
        testTypesWithImprovement++;
      }
    });

    return testTypesWithImprovement > 0 ? totalImprovement / testTypesWithImprovement : 0;
  }

  private async updateUserStats(userId: string, action: string): Promise<void> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) return;

      const userData = userDoc.data();
      const stats = userData?.stats || {};
      
      if (action === 'evaluation') {
        stats.totalTests = (stats.totalTests || 0) + 1;
        stats.lastTestDate = Timestamp.now();
      }
      
      await userRef.update({ stats });
    } catch (error) {
      logger.error(`Error actualizando estadísticas del usuario ${userId}:`, error);
    }
  }

  // Convertir Evaluation a EvaluationResponse para API
  formatEvaluationResponse(evaluation: Evaluation): EvaluationResponse {
    return {
      id: evaluation.id,
      userId: evaluation.userId,
      testType: evaluation.testType,
      testVersion: evaluation.testVersion,
      testName: evaluation.testName,
      answers: evaluation.answers,
      score: evaluation.score,
      maxScore: evaluation.maxScore,
      interpretation: evaluation.interpretation,
      completedAt: evaluation.completedAt.toDate().toISOString(),
      duration: evaluation.duration,
      isAnonymous: evaluation.isAnonymous,
      metadata: evaluation.metadata
    };
  }
}

export default new EvaluationService();

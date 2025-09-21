import Joi from 'joi';
import { logger } from './logger.util';

// Esquemas de validación para el diario
export const diaryEntrySchema = Joi.object({
  mood: Joi.string().valid('calm', 'relaxed', 'neutral', 'anxious', 'overwhelmed').required(),
  moodScore: Joi.number().min(1).max(10).required(),
  content: Joi.string().min(1).max(2000).required(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  exerciseType: Joi.string().valid('breathing', 'meditation', 'progressive-relaxation', 'grounding', 'none').optional(),
  exerciseDuration: Joi.number().min(0).max(120).optional(),
  exerciseEffectiveness: Joi.number().min(1).max(5).optional(),
  anxietyLevel: Joi.number().min(1).max(10).optional(),
  anxietyTriggers: Joi.array().items(Joi.string().max(100)).optional(),
  reflection: Joi.string().max(1000).optional(),
  location: Joi.string().max(100).optional()
});

// Esquemas de validación para evaluaciones
export const evaluationSchema = Joi.object({
  testType: Joi.string().valid('gad7', 'phq9', 'pss', 'wellness', 'selfesteem').required(),
  testVersion: Joi.string().optional(),
  testName: Joi.string().max(100).required(),
  answers: Joi.array().items(Joi.number().min(0).max(4)).required(),
  score: Joi.number().min(0).required(),
  maxScore: Joi.number().min(1).required(),
  duration: Joi.number().min(0).max(3600).optional(),
  isAnonymous: Joi.boolean().optional(),
  metadata: Joi.object().optional()
});

// Esquemas de validación para usuarios
export const userSchema = Joi.object({
  email: Joi.string().email().required(),
  displayName: Joi.string().min(1).max(100).required(),
  photoURL: Joi.string().uri().optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    notifications: Joi.boolean().optional(),
    language: Joi.string().valid('es', 'en').optional(),
    timezone: Joi.string().optional(),
    reminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    weeklyReport: Joi.boolean().optional(),
    motivationalMessages: Joi.boolean().optional(),
    dataSharing: Joi.boolean().optional()
  }).optional(),
  privacy: Joi.object({
    shareData: Joi.boolean().optional(),
    anonymousMode: Joi.boolean().optional(),
    dataRetention: Joi.string().valid('1year', '2years', 'permanent').optional(),
    exportData: Joi.boolean().optional()
  }).optional()
});

// Esquemas de validación para actualización de usuarios
export const userUpdateSchema = Joi.object({
  displayName: Joi.string().min(1).max(100).optional(),
  photoURL: Joi.string().uri().optional(),
  preferences: Joi.object({
    theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    notifications: Joi.boolean().optional(),
    language: Joi.string().valid('es', 'en').optional(),
    timezone: Joi.string().optional(),
    reminderTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    weeklyReport: Joi.boolean().optional(),
    motivationalMessages: Joi.boolean().optional(),
    dataSharing: Joi.boolean().optional()
  }).optional(),
  privacy: Joi.object({
    shareData: Joi.boolean().optional(),
    anonymousMode: Joi.boolean().optional(),
    dataRetention: Joi.string().valid('1year', '2years', 'permanent').optional(),
    exportData: Joi.boolean().optional()
  }).optional()
});

// Funciones de validación específicas para tests
export const validateGAD7Answers = (answers: number[]): void => {
  if (answers.length !== 7) {
    throw new Error('GAD-7 requiere exactamente 7 respuestas');
  }
  if (answers.some(answer => answer < 0 || answer > 3)) {
    throw new Error('Las respuestas de GAD-7 deben estar entre 0 y 3');
  }
};

export const validatePHQ9Answers = (answers: number[]): void => {
  if (answers.length !== 9) {
    throw new Error('PHQ-9 requiere exactamente 9 respuestas');
  }
  if (answers.some(answer => answer < 0 || answer > 3)) {
    throw new Error('Las respuestas de PHQ-9 deben estar entre 0 y 3');
  }
};

export const validatePSSAnswers = (answers: number[]): void => {
  if (answers.length !== 10) {
    throw new Error('PSS requiere exactamente 10 respuestas');
  }
  if (answers.some(answer => answer < 0 || answer > 4)) {
    throw new Error('Las respuestas de PSS deben estar entre 0 y 4');
  }
};

// Función genérica de validación
export const validateData = (data: any, schema: Joi.ObjectSchema): any => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    logger.warn('Error de validación:', errorMessages);
    throw new Error(`Datos inválidos: ${errorMessages.join(', ')}`);
  }
  
  return value;
};

// Middleware de validación para Express
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      req.body = validateData(req.body, schema);
      next();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Error de validación',
        message: error instanceof Error ? error.message : 'Datos inválidos'
      });
    }
  };
};

// Validaciones específicas
export const validateDiaryEntry = validateRequest(diaryEntrySchema);
export const validateEvaluation = validateRequest(evaluationSchema);
export const validateUser = validateRequest(userSchema);
export const validateUserUpdate = validateRequest(userUpdateSchema);
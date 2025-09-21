import { Timestamp } from 'firebase-admin/firestore';

export type ExerciseType = 'breathing' | 'meditation' | 'progressive-relaxation' | 'grounding';

export interface ExerciseSession {
  id: string;
  userId: string;
  exerciseType: ExerciseType;
  exerciseName: string;
  duration: number;
  effectiveness: number;
  moodBefore: number;
  moodAfter: number;
  improvement: number;
  notes: string;
  tags: string[];
  isCompleted: boolean;
  completedAt: Timestamp;
  createdAt: Timestamp;
  deviceInfo: {
    platform: 'web' | 'mobile';
    userAgent: string;
  };
}

export interface CreateExerciseSessionRequest {
  exerciseType: ExerciseType;
  exerciseName: string;
  duration: number;
  effectiveness: number;
  moodBefore: number;
  moodAfter: number;
  notes?: string;
  tags?: string[];
}

export interface UpdateExerciseSessionRequest {
  effectiveness?: number;
  moodAfter?: number;
  notes?: string;
  tags?: string[];
  isCompleted?: boolean;
}

export interface ExerciseSessionResponse {
  id: string;
  userId: string;
  exerciseType: ExerciseType;
  exerciseName: string;
  duration: number;
  effectiveness: number;
  moodBefore: number;
  moodAfter: number;
  improvement: number;
  notes: string;
  tags: string[];
  isCompleted: boolean;
  completedAt: string;
  createdAt: string;
  deviceInfo: {
    platform: 'web' | 'mobile';
    userAgent: string;
  };
}

export interface ExerciseStats {
  totalSessions: number;
  averageDuration: number;
  averageEffectiveness: number;
  averageImprovement: number;
  exerciseTypeFrequency: Array<{ type: ExerciseType; count: number }>;
  effectivenessTrend: Array<{ date: string; effectiveness: number; type: ExerciseType }>;
  moodImprovementTrend: Array<{ date: string; improvement: number; type: ExerciseType }>;
  lastSession: string | null;
  currentStreak: number;
  longestStreak: number;
}

export interface ExerciseFilters {
  exerciseType?: ExerciseType[];
  dateFrom?: Date;
  dateTo?: Date;
  effectivenessMin?: number;
  effectivenessMax?: number;
  durationMin?: number;
  durationMax?: number;
  limit?: number;
  offset?: number;
}

// Definiciones específicas de ejercicios
export interface ExerciseDefinition {
  id: string;
  type: ExerciseType;
  name: string;
  description: string;
  instructions: string[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'anxiety' | 'stress' | 'mindfulness' | 'relaxation';
  tags: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BreathingExercise extends ExerciseDefinition {
  type: 'breathing';
  breathingPattern: {
    inhale: number;
    hold: number;
    exhale: number;
    cycles: number;
  };
}

export interface MeditationExercise extends ExerciseDefinition {
  type: 'meditation';
  meditationType: 'mindfulness' | 'loving-kindness' | 'body-scan' | 'breathing';
  guided: boolean;
  backgroundSound?: string;
}

export interface ProgressiveRelaxationExercise extends ExerciseDefinition {
  type: 'progressive-relaxation';
  muscleGroups: string[];
  tensionDuration: number;
  relaxationDuration: number;
}

export interface GroundingExercise extends ExerciseDefinition {
  type: 'grounding';
  groundingType: '5-4-3-2-1' | 'breathing' | 'sensory' | 'cognitive';
  steps: string[];
}

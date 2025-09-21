import { Timestamp } from 'firebase-admin/firestore';

export type TestType = 'gad7' | 'phq9' | 'pss' | 'wellness' | 'selfesteem';
export type TestLevel = 'minimal' | 'mild' | 'moderate' | 'severe' | 'moderately_severe' | 'low' | 'medium' | 'high' | 'unknown';

export interface TestInterpretation {
  level: TestLevel;
  description: string;
  recommendations: string[];
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface TestMetadata {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  location?: string;
  userAgent?: string;
}

export interface Evaluation {
  id: string;
  userId: string;
  testType: TestType;
  testVersion: string;
  testName: string;
  answers: number[];
  score: number;
  maxScore: number;
  interpretation: TestInterpretation;
  completedAt: Timestamp;
  duration: number;
  isAnonymous: boolean;
  metadata: TestMetadata;
}

export interface CreateEvaluationRequest {
  testType: TestType;
  testVersion?: string;
  testName: string;
  answers: number[];
  score: number;
  maxScore: number;
  duration?: number;
  isAnonymous?: boolean;
  metadata?: Partial<TestMetadata>;
}

export interface UpdateEvaluationRequest {
  testName?: string;
  answers?: number[];
  score?: number;
  maxScore?: number;
  duration?: number;
  isAnonymous?: boolean;
  metadata?: Partial<TestMetadata>;
}

export interface EvaluationResponse {
  id: string;
  userId: string;
  testType: TestType;
  testVersion: string;
  testName: string;
  answers: number[];
  score: number;
  maxScore: number;
  interpretation: TestInterpretation;
  completedAt: string;
  duration: number;
  isAnonymous: boolean;
  metadata: TestMetadata;
}

export interface EvaluationStats {
  totalEvaluations: number;
  averageScore: number;
  testTypeFrequency: Array<{ type: TestType; count: number }>;
  scoreTrend: Array<{ date: string; score: number; testType: TestType }>;
  lastEvaluation: string | null;
  improvementRate: number;
}

export interface EvaluationFilters {
  testType?: TestType[];
  dateFrom?: Date;
  dateTo?: Date;
  scoreMin?: number;
  scoreMax?: number;
  limit?: number;
  offset?: number;
}

// Esquemas específicos para cada test
export interface GAD7Evaluation extends Evaluation {
  testType: 'gad7';
  interpretation: {
    level: 'minimal' | 'mild' | 'moderate' | 'severe';
    description: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface PHQ9Evaluation extends Evaluation {
  testType: 'phq9';
  interpretation: {
    level: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
    description: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface PSSEvaluation extends Evaluation {
  testType: 'pss';
  interpretation: {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface WellnessEvaluation extends Evaluation {
  testType: 'wellness';
  interpretation: {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export interface SelfEsteemEvaluation extends Evaluation {
  testType: 'selfesteem';
  interpretation: {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}

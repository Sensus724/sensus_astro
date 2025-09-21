import { Timestamp } from 'firebase-admin/firestore';

export type MoodType = 'calm' | 'relaxed' | 'neutral' | 'anxious' | 'overwhelmed';
export type ExerciseType = 'breathing' | 'meditation' | 'progressive-relaxation' | 'grounding' | 'none';

export interface DiaryLocation {
  country?: string;
  region?: string;
  timezone?: string;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  date: Timestamp;
  mood: MoodType;
  moodScore: number;
  content: string;
  tags: string[];
  exerciseType: ExerciseType;
  exerciseDuration: number;
  exerciseEffectiveness: number;
  anxietyLevel: number;
  anxietyTriggers: string[];
  reflection: string;
  insights: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isEncrypted: boolean;
  version: number;
  location?: DiaryLocation;
}

export interface CreateDiaryEntryRequest {
  mood: MoodType;
  moodScore: number;
  content: string;
  tags?: string[];
  exerciseType?: ExerciseType;
  exerciseDuration?: number;
  exerciseEffectiveness?: number;
  anxietyLevel?: number;
  anxietyTriggers?: string[];
  reflection?: string;
  location?: DiaryLocation;
}

export interface UpdateDiaryEntryRequest {
  mood?: MoodType;
  moodScore?: number;
  content?: string;
  tags?: string[];
  exerciseType?: ExerciseType;
  exerciseDuration?: number;
  exerciseEffectiveness?: number;
  anxietyLevel?: number;
  anxietyTriggers?: string[];
  reflection?: string;
  location?: DiaryLocation;
}

export interface DiaryEntryResponse {
  id: string;
  userId: string;
  date: string;
  mood: MoodType;
  moodScore: number;
  content: string;
  tags: string[];
  exerciseType: ExerciseType;
  exerciseDuration: number;
  exerciseEffectiveness: number;
  anxietyLevel: number;
  anxietyTriggers: string[];
  reflection: string;
  insights: string[];
  createdAt: string;
  updatedAt: string;
  isEncrypted: boolean;
  version: number;
  location?: DiaryLocation;
}

export interface DiaryStats {
  totalEntries: number;
  averageMood: number;
  averageAnxietyLevel: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
  exerciseFrequency: Array<{ type: ExerciseType; count: number }>;
  moodTrend: Array<{ date: string; mood: number; anxiety: number }>;
  streak: number;
  lastEntry: string | null;
}

export interface DiaryFilters {
  mood?: MoodType[];
  tags?: string[];
  exerciseType?: ExerciseType[];
  dateFrom?: Date;
  dateTo?: Date;
  anxietyLevelMin?: number;
  anxietyLevelMax?: number;
  limit?: number;
  offset?: number;
}

import { Timestamp } from 'firebase-admin/firestore';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: 'es' | 'en';
  timezone: string;
  reminderTime: string;
  weeklyReport: boolean;
  motivationalMessages: boolean;
  dataSharing: boolean;
}

export interface UserStats {
  totalDiaryEntries: number;
  totalTests: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  lastDiaryEntry: Timestamp | null;
  lastTestDate: Timestamp | null;
  totalTimeSpent: number;
  favoriteActivities: string[];
  goals: string[];
  achievements: string[];
}

export interface UserPrivacy {
  shareData: boolean;
  anonymousMode: boolean;
  dataRetention: '1year' | '2years' | 'permanent';
  exportData: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'premium';
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  features: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  updatedAt: Timestamp;
  preferences: UserPreferences;
  stats: UserStats;
  privacy: UserPrivacy;
  subscription: UserSubscription;
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: Partial<UserPreferences>;
  privacy?: Partial<UserPrivacy>;
}

export interface UpdateUserRequest {
  displayName?: string;
  photoURL?: string;
  preferences?: Partial<UserPreferences>;
  privacy?: Partial<UserPrivacy>;
}

export interface UserResponse {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
  stats: UserStats;
  privacy: UserPrivacy;
  subscription: UserSubscription;
}

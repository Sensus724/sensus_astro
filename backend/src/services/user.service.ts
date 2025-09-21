import FirebaseService from './firebase.service';
import { User, CreateUserRequest, UpdateUserRequest, UserResponse } from '../models/user.model';
import { logger } from '../utils/logger.util';
import { Timestamp } from 'firebase-admin/firestore';

class UserService {
  private db = FirebaseService.getFirestore();

  async createUser(userId: string, data: CreateUserRequest): Promise<User> {
    try {
      // Validar datos de entrada
      const validatedData = data;

      const user: User = {
        uid: userId,
        email: validatedData.email,
        displayName: validatedData.displayName,
        photoURL: validatedData.photoURL || null,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'es',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          reminderTime: '20:00',
          weeklyReport: true,
          motivationalMessages: true,
          dataSharing: false,
          ...validatedData.preferences
        },
        stats: {
          totalDiaryEntries: 0,
          totalTests: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageMood: 5,
          lastDiaryEntry: null,
          lastTestDate: null,
          totalTimeSpent: 0,
          favoriteActivities: [],
          goals: [],
          achievements: []
        },
        privacy: {
          shareData: false,
          anonymousMode: false,
          dataRetention: '1year',
          exportData: true,
          ...validatedData.privacy
        },
        subscription: {
          plan: 'free',
          startDate: null,
          endDate: null,
          features: ['diary', 'evaluations', 'basic_analytics']
        }
      };

      await this.db.collection('users').doc(userId).set(user);
      logger.info(`Usuario creado: ${userId}`);
      
      return user;
    } catch (error) {
      logger.error(`Error creando usuario ${userId}:`, error);
      throw new Error('No se pudo crear el usuario');
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const doc = await this.db.collection('users').doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }

      return { ...doc.data() } as User;
    } catch (error) {
      logger.error(`Error obteniendo usuario ${userId}:`, error);
      throw new Error('No se pudo obtener el usuario');
    }
  }

  async updateUser(userId: string, data: UpdateUserRequest): Promise<User | null> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return null;
      }

      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };

      await this.db.collection('users').doc(userId).update(updateData);
      
      const updatedUser = await this.getUserById(userId);
      logger.info(`Usuario actualizado: ${userId}`);
      
      return updatedUser;
    } catch (error) {
      logger.error(`Error actualizando usuario ${userId}:`, error);
      throw new Error('No se pudo actualizar el usuario');
    }
  }

  async updateUserStats(userId: string, statsUpdate: Partial<User['stats']>): Promise<boolean> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return false;
      }

      const currentStats = userDoc.data()?.stats || {};
      const updatedStats = { ...currentStats, ...statsUpdate };

      await userRef.update({ 
        stats: updatedStats,
        updatedAt: Timestamp.now()
      });

      logger.info(`Estadísticas actualizadas para usuario ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error actualizando estadísticas del usuario ${userId}:`, error);
      return false;
    }
  }

  async updateLastLogin(userId: string): Promise<boolean> {
    try {
      await this.db.collection('users').doc(userId).update({
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      logger.info(`Último login actualizado para usuario ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error actualizando último login del usuario ${userId}:`, error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Verificar que el usuario existe
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      // Eliminar usuario
      await this.db.collection('users').doc(userId).delete();
      
      logger.info(`Usuario eliminado: ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error eliminando usuario ${userId}:`, error);
      throw new Error('No se pudo eliminar el usuario');
    }
  }

  async getUserStats(userId: string): Promise<User['stats'] | null> {
    try {
      const user = await this.getUserById(userId);
      return user?.stats || null;
    } catch (error) {
      logger.error(`Error obteniendo estadísticas del usuario ${userId}:`, error);
      return null;
    }
  }

  async getUserPreferences(userId: string): Promise<User['preferences'] | null> {
    try {
      const user = await this.getUserById(userId);
      return user?.preferences || null;
    } catch (error) {
      logger.error(`Error obteniendo preferencias del usuario ${userId}:`, error);
      return null;
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<User['preferences']>): Promise<boolean> {
    try {
      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return false;
      }

      const currentPreferences = userDoc.data()?.preferences || {};
      const updatedPreferences = { ...currentPreferences, ...preferences };

      await userRef.update({ 
        preferences: updatedPreferences,
        updatedAt: Timestamp.now()
      });

      logger.info(`Preferencias actualizadas para usuario ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error actualizando preferencias del usuario ${userId}:`, error);
      return false;
    }
  }

  // Convertir User a UserResponse para API
  formatUserResponse(user: User): UserResponse {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: user.createdAt.toDate().toISOString(),
      lastLoginAt: user.lastLoginAt.toDate().toISOString(),
      preferences: user.preferences,
      stats: user.stats,
      privacy: user.privacy,
      subscription: user.subscription
    };
  }
}

export default new UserService();

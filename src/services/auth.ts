/**
 * Servicio de Autenticación para Sensus
 * Manejo centralizado de autenticación con Firebase
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
  stats: {
    totalDiaryEntries: number;
    totalEvaluations: number;
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  subscription: {
    plan: 'free' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    startDate?: Date;
    endDate?: Date;
  };
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

class AuthService {
  private listeners: Array<(state: AuthState) => void> = [];
  private state: AuthState = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Escuchar cambios de autenticación
    auth.onAuthStateChanged(async (user) => {
      this.state.user = user;
      this.state.isAuthenticated = !!user;
      this.state.isLoading = false;

      if (user) {
        try {
          this.state.profile = await this.getUserProfile(user.uid);
          this.updateLastLogin(user.uid);
        } catch (error) {
          console.error('Error loading user profile:', error);
          this.state.profile = null;
        }
      } else {
        this.state.profile = null;
      }

      this.notifyListeners();
    });
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<UserCredential> {
    try {
      this.setLoading(true);
      this.clearError();

      const result = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      // Actualizar último login
      await this.updateLastLogin(result.user.uid);

      // Guardar preferencia de recordar
      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      return result;
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  async register(credentials: RegisterCredentials): Promise<UserCredential> {
    try {
      this.setLoading(true);
      this.clearError();

      // Crear usuario
      const result = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Actualizar perfil básico
      await updateProfile(result.user, {
        displayName: `${credentials.firstName} ${credentials.lastName}`,
      });

      // Crear perfil en Firestore
      const profile: UserProfile = {
        uid: result.user.uid,
        email: credentials.email,
        displayName: `${credentials.firstName} ${credentials.lastName}`,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        birthDate: credentials.birthDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'auto',
          notifications: true,
          newsletter: credentials.newsletter || false,
          language: 'es',
        },
        stats: {
          totalDiaryEntries: 0,
          totalEvaluations: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date(),
        },
        subscription: {
          plan: 'free',
          status: 'active',
        },
      };

      await this.createUserProfile(profile);

      return result;
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  async loginWithGoogle(): Promise<UserCredential> {
    try {
      this.setLoading(true);
      this.clearError();

      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);

      // Verificar si es un usuario nuevo
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        // Crear perfil para usuario nuevo
        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          birthDate: '', // Se pedirá después
          photoURL: result.user.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'auto',
            notifications: true,
            newsletter: false,
            language: 'es',
          },
          stats: {
            totalDiaryEntries: 0,
            totalEvaluations: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
          },
          subscription: {
            plan: 'free',
            status: 'active',
          },
        };

        await this.createUserProfile(profile);
      } else {
        // Actualizar último login para usuario existente
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  async loginWithApple(): Promise<UserCredential> {
    try {
      this.setLoading(true);
      this.clearError();

      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const result = await signInWithPopup(auth, provider);

      // Verificar si es un usuario nuevo
      const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        // Crear perfil para usuario nuevo
        const profile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '',
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          birthDate: '', // Se pedirá después
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'auto',
            notifications: true,
            newsletter: false,
            language: 'es',
          },
          stats: {
            totalDiaryEntries: 0,
            totalEvaluations: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date(),
          },
          subscription: {
            plan: 'free',
            status: 'active',
          },
        };

        await this.createUserProfile(profile);
      } else {
        // Actualizar último login para usuario existente
        await this.updateLastLogin(result.user.uid);
      }

      return result;
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  async logout(): Promise<void> {
    try {
      this.setLoading(true);
      await signOut(auth);
      
      // Limpiar datos locales
      localStorage.removeItem('rememberMe');
      sessionStorage.clear();
      
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      this.setLoading(true);
      this.clearError();

      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const authError = this.handleAuthError(error);
      this.setError(authError);
      throw authError;
    } finally {
      this.setLoading(false);
    }
  }

  // Métodos de perfil
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          stats: {
            ...data.stats,
            lastActivityDate: data.stats?.lastActivityDate?.toDate() || new Date(),
          },
          subscription: {
            ...data.subscription,
            startDate: data.subscription?.startDate?.toDate(),
            endDate: data.subscription?.endDate?.toDate(),
          },
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      if (this.state.profile) {
        this.state.profile = { ...this.state.profile, ...updates };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        stats: {
          ...profile.stats,
          lastActivityDate: serverTimestamp(),
        },
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateLastLogin(uid: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        lastLoginAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Métodos de utilidad
  private handleAuthError(error: any): AuthError {
    const errorMap: Record<string, { message: string; field?: string }> = {
      'auth/user-not-found': {
        message: 'No existe una cuenta con este correo electrónico',
        field: 'email',
      },
      'auth/wrong-password': {
        message: 'Contraseña incorrecta',
        field: 'password',
      },
      'auth/email-already-in-use': {
        message: 'Ya existe una cuenta con este correo electrónico',
        field: 'email',
      },
      'auth/weak-password': {
        message: 'La contraseña es muy débil',
        field: 'password',
      },
      'auth/invalid-email': {
        message: 'Correo electrónico inválido',
        field: 'email',
      },
      'auth/user-disabled': {
        message: 'Esta cuenta ha sido deshabilitada',
      },
      'auth/too-many-requests': {
        message: 'Demasiados intentos fallidos. Intenta más tarde',
      },
      'auth/network-request-failed': {
        message: 'Error de conexión. Verifica tu internet',
      },
      'auth/popup-closed-by-user': {
        message: 'Inicio de sesión cancelado',
      },
      'auth/cancelled-popup-request': {
        message: 'Inicio de sesión cancelado',
      },
    };

    const errorInfo = errorMap[error.code] || {
      message: 'Error de autenticación. Intenta nuevamente',
    };

    return {
      code: error.code,
      message: errorInfo.message,
      field: errorInfo.field,
    };
  }

  private setLoading(loading: boolean) {
    this.state.isLoading = loading;
    this.notifyListeners();
  }

  private setError(error: AuthError) {
    this.state.error = error;
    this.notifyListeners();
  }

  private clearError() {
    this.state.error = null;
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.state });
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Métodos públicos
  getState(): AuthState {
    return { ...this.state };
  }

  addListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar función para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  removeListener(listener: (state: AuthState) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  getCurrentUser(): User | null {
    return this.state.user;
  }

  getCurrentProfile(): UserProfile | null {
    return this.state.profile;
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  getError(): AuthError | null {
    return this.state.error;
  }
}

// Instancia singleton
let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService();
  }
  return authServiceInstance;
}

// Funciones de conveniencia
export const login = (credentials: LoginCredentials) => getAuthService().login(credentials);
export const register = (credentials: RegisterCredentials) => getAuthService().register(credentials);
export const loginWithGoogle = () => getAuthService().loginWithGoogle();
export const loginWithApple = () => getAuthService().loginWithApple();
export const logout = () => getAuthService().logout();
export const resetPassword = (email: string) => getAuthService().resetPassword(email);
export const getUserProfile = (uid: string) => getAuthService().getUserProfile(uid);
export const updateUserProfile = (uid: string, updates: Partial<UserProfile>) => 
  getAuthService().updateUserProfile(uid, updates);
export const getAuthState = () => getAuthService().getState();
export const addAuthListener = (listener: (state: AuthState) => void) => 
  getAuthService().addListener(listener);
export const isAuthenticated = () => getAuthService().isAuthenticated();
export const getCurrentUser = () => getAuthService().getCurrentUser();
export const getCurrentProfile = () => getAuthService().getCurrentProfile();

export default AuthService;

/**
 * Hook de autenticación para Sensus
 * Proporciona estado y métodos de autenticación reactivos
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  UserProfile,
  AuthError
} from '../services/auth';
import { getAuthService } from '../services/auth';

export interface UseAuthReturn {
  // Estado
  user: AuthState['user'];
  profile: AuthState['profile'];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  
  // Métodos de autenticación
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Métodos de perfil
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Utilidades
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>(() => getAuthService().getState());

  useEffect(() => {
    const removeListener = getAuthService().addListener((newState) => {
      setState(newState);
    });

    return removeListener;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await getAuthService().login(credentials);
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      await getAuthService().register(credentials);
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await getAuthService().loginWithGoogle();
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const loginWithApple = useCallback(async () => {
    try {
      await getAuthService().loginWithApple();
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await getAuthService().logout();
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await getAuthService().resetPassword(email);
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      await getAuthService().updateUserProfile(state.user.uid, updates);
    } catch (error) {
      // El error se maneja automáticamente en el servicio
      throw error;
    }
  }, [state.user]);

  const refreshProfile = useCallback(async () => {
    if (!state.user) {
      return;
    }

    try {
      const profile = await getAuthService().getUserProfile(state.user.uid);
      if (profile) {
        setState(prev => ({ ...prev, profile }));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [state.user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    user: state.user,
    profile: state.profile,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    
    // Métodos de autenticación
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    logout,
    resetPassword,
    
    // Métodos de perfil
    updateProfile,
    refreshProfile,
    
    // Utilidades
    clearError,
  };
}

// Hook simplificado para verificar autenticación
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const removeListener = getAuthService().addListener((state) => {
      setIsAuthenticated(state.isAuthenticated);
      setIsLoading(state.isLoading);
    });

    return removeListener;
  }, []);

  return { isAuthenticated, isLoading };
}

// Hook para obtener el perfil del usuario
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const removeListener = getAuthService().addListener((state) => {
      setProfile(state.profile);
      setIsLoading(state.isLoading);
    });

    return removeListener;
  }, []);

  return { profile, isLoading };
}

// Hook para proteger rutas
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthState();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirigir al login o mostrar modal
      if ((window as any).authModal) {
        (window as any).authModal.open('login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}

export default useAuth;

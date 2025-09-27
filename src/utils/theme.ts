/**
 * Utilidades de tema para Sensus
 * Manejo centralizado del sistema de temas claro/oscuro
 */

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  defaultTheme: Theme;
  storageKey: string;
  enableSystemTheme: boolean;
  enableTransitions: boolean;
  transitionDuration: number;
}

export interface ThemeChangeEvent {
  theme: Theme;
  previousTheme: Theme;
  timestamp: number;
  source: 'user' | 'system' | 'programmatic';
}

// Configuración por defecto
const DEFAULT_CONFIG: ThemeConfig = {
  defaultTheme: 'auto',
  storageKey: 'sensus_theme',
  enableSystemTheme: true,
  enableTransitions: true,
  transitionDuration: 300,
};

class ThemeManager {
  private config: ThemeConfig;
  private currentTheme: Theme;
  private systemTheme: Theme;
  private listeners: Array<(event: ThemeChangeEvent) => void> = [];
  private mediaQuery: MediaQueryList | null = null;

  constructor(config: Partial<ThemeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.systemTheme = this.detectSystemTheme();
    this.currentTheme = this.initializeTheme();
    
    this.setupSystemThemeWatcher();
    this.setupStorageWatcher();
  }

  private detectSystemTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private initializeTheme(): Theme {
    if (typeof window === 'undefined') return this.config.defaultTheme;
    
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
        return stored as Theme;
      }
    } catch (error) {
      console.warn('Error reading theme from localStorage:', error);
    }
    
    return this.config.defaultTheme;
  }

  private setupSystemThemeWatcher() {
    if (typeof window === 'undefined' || !this.config.enableSystemTheme) return;
    
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', (e) => {
        this.systemTheme = e.matches ? 'dark' : 'light';
        
        // Si el tema actual es 'auto', aplicar el nuevo tema del sistema
        if (this.currentTheme === 'auto') {
          this.applyTheme(this.systemTheme, 'system');
        }
      });
    }
  }

  private setupStorageWatcher() {
    if (typeof window === 'undefined') return;
    
    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === this.config.storageKey && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (newTheme !== this.currentTheme) {
          this.applyTheme(newTheme, 'system');
        }
      }
    });
  }


  private applyTheme(theme: Theme, source: ThemeChangeEvent['source'] = 'programmatic') {
    const previousTheme = this.currentTheme;
    const effectiveTheme = theme === 'auto' ? this.systemTheme : theme;
    
    // Aplicar tema al documento
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Actualizar tema actual
    this.currentTheme = theme;
    
    // Guardar en localStorage
    this.storeTheme(theme);
    
    // Dispatch evento
    this.dispatchThemeChange({
      theme: effectiveTheme,
      previousTheme: previousTheme === 'auto' ? this.systemTheme : previousTheme,
      timestamp: Date.now(),
      source,
    });
  }

  private storeTheme(theme: Theme) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.config.storageKey, theme);
    } catch (error) {
      console.warn('Error storing theme to localStorage:', error);
    }
  }

  private dispatchThemeChange(event: ThemeChangeEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  // Métodos públicos
  public setTheme(theme: Theme) {
    this.applyTheme(theme, 'user');
  }

  public getTheme(): Theme {
    return this.currentTheme;
  }

  public getEffectiveTheme(): Theme {
    if (this.currentTheme === 'auto') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }

  public getSystemTheme(): Theme {
    return this.systemTheme;
  }

  public toggleTheme() {
    const currentEffective = this.getEffectiveTheme();
    const newTheme = currentEffective === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public resetToSystem() {
    this.setTheme('auto');
  }

  public addListener(listener: (event: ThemeChangeEvent) => void) {
    this.listeners.push(listener);
    
    // Retornar función para remover listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public removeListener(listener: (event: ThemeChangeEvent) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public isDark(): boolean {
    return this.getEffectiveTheme() === 'dark';
  }

  public isLight(): boolean {
    return this.getEffectiveTheme() === 'light';
  }

  public isAuto(): boolean {
    return this.currentTheme === 'auto';
  }

  public getConfig(): ThemeConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ThemeConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // Métodos de utilidad
  public getThemeColors() {
    const isDark = this.isDark();
    
    return {
      primary: isDark ? '#60a5fa' : '#2563eb',
      secondary: isDark ? '#f87171' : '#ef4444',
      background: isDark ? '#111827' : '#ffffff',
      surface: isDark ? '#1f2937' : '#f9fafb',
      text: isDark ? '#f9fafb' : '#111827',
      textSecondary: isDark ? '#d1d5db' : '#6b7280',
      border: isDark ? '#374151' : '#e5e7eb',
    };
  }

  public getCSSVariables() {
    const isDark = this.isDark();
    
    return {
      '--theme-primary': isDark ? '#60a5fa' : '#2563eb',
      '--theme-secondary': isDark ? '#f87171' : '#ef4444',
      '--theme-background': isDark ? '#111827' : '#ffffff',
      '--theme-surface': isDark ? '#1f2937' : '#f9fafb',
      '--theme-text': isDark ? '#f9fafb' : '#111827',
      '--theme-text-secondary': isDark ? '#d1d5db' : '#6b7280',
      '--theme-border': isDark ? '#374151' : '#e5e7eb',
    };
  }

  public applyCSSVariables() {
    const variables = this.getCSSVariables();
    
    Object.entries(variables).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }

  // Método para inicializar el tema en el documento
  public initialize() {
    this.applyTheme(this.currentTheme, 'programmatic');
  }

  // Método para limpiar recursos
  public destroy() {
    this.listeners = [];
    
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', () => {});
    }
  }
}

// Instancia singleton
let themeManagerInstance: ThemeManager | null = null;

export function createThemeManager(config?: Partial<ThemeConfig>): ThemeManager {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager(config);
  }
  return themeManagerInstance;
}

export function getThemeManager(): ThemeManager {
  if (!themeManagerInstance) {
    themeManagerInstance = new ThemeManager();
  }
  return themeManagerInstance;
}

// Funciones de conveniencia
export const setTheme = (theme: Theme) => getThemeManager().setTheme(theme);
export const getTheme = () => getThemeManager().getTheme();
export const getEffectiveTheme = () => getThemeManager().getEffectiveTheme();
export const toggleTheme = () => getThemeManager().toggleTheme();
export const resetToSystemTheme = () => getThemeManager().resetToSystem();
export const isDarkTheme = () => getThemeManager().isDark();
export const isLightTheme = () => getThemeManager().isLight();
export const isAutoTheme = () => getThemeManager().isAuto();
export const addThemeListener = (listener: (event: ThemeChangeEvent) => void) => 
  getThemeManager().addListener(listener);
export const removeThemeListener = (listener: (event: ThemeChangeEvent) => void) => 
  getThemeManager().removeListener(listener);

// Hook para React (si se usa en el futuro)
export function useTheme() {
  const themeManager = getThemeManager();
  
  return {
    theme: themeManager.getTheme(),
    effectiveTheme: themeManager.getEffectiveTheme(),
    isDark: themeManager.isDark(),
    isLight: themeManager.isLight(),
    isAuto: themeManager.isAuto(),
    setTheme: themeManager.setTheme.bind(themeManager),
    toggleTheme: themeManager.toggleTheme.bind(themeManager),
    resetToSystem: themeManager.resetToSystem.bind(themeManager),
  };
}

// Inicialización automática
if (typeof window !== 'undefined') {
  const manager = getThemeManager();
  manager.initialize();
  
  // Exponer globalmente para debugging
  (window as any).themeManager = manager;
}

export default ThemeManager;

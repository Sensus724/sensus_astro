/**
 * Sistema de Gestión de Temas Centralizado
 * Maneja el modo claro/oscuro sin duplicar código
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.systemTheme = this.getSystemTheme();
        this.themeChangeCallbacks = [];
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupSystemThemeListener();
        this.setupThemeToggle();
    }

    getStoredTheme() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme');
        }
        return null;
    }

    getSystemTheme() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }

    setTheme(theme) {
        if (['light', 'dark', 'auto'].includes(theme)) {
            this.currentTheme = theme;
            this.storeTheme(theme);
            this.applyTheme(theme);
            this.notifyThemeChange(theme);
        }
    }

    getEffectiveTheme() {
        if (this.currentTheme === 'auto') {
            return this.systemTheme;
        }
        return this.currentTheme;
    }

    applyTheme(theme) {
        const effectiveTheme = theme === 'auto' ? this.systemTheme : theme;
        const root = document.documentElement;
        
        // Remover clases de tema anteriores
        root.classList.remove('light-theme', 'dark-theme');
        
        // Aplicar nueva clase de tema
        root.classList.add(`${effectiveTheme}-theme`);
        
        // Actualizar meta theme-color
        this.updateMetaThemeColor(effectiveTheme);
        
        // Actualizar iconos y elementos específicos
        this.updateThemeElements(effectiveTheme);
    }

    updateMetaThemeColor(theme) {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.content = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        }
    }

    updateThemeElements(theme) {
        // Actualizar iconos de tema
        const themeIcons = document.querySelectorAll('[data-theme-icon]');
        themeIcons.forEach(icon => {
            const isDark = theme === 'dark';
            icon.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
        });

        // Actualizar texto de botones de tema
        const themeButtons = document.querySelectorAll('[data-theme-text]');
        themeButtons.forEach(button => {
            const isDark = theme === 'dark';
            button.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
        });

        // Actualizar aria-labels
        const themeToggles = document.querySelectorAll('[data-theme-toggle]');
        themeToggles.forEach(toggle => {
            const isDark = theme === 'dark';
            toggle.setAttribute('aria-label', isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        });
    }

    storeTheme(theme) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
        }
    }

    setupSystemThemeListener() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                this.systemTheme = e.matches ? 'dark' : 'light';
                if (this.currentTheme === 'auto') {
                    this.applyTheme('auto');
                    this.notifyThemeChange('auto');
                }
            });
        }
    }

    setupThemeToggle() {
        // Configurar todos los botones de cambio de tema
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-theme-toggle]')) {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        const currentEffective = this.getEffectiveTheme();
        const newTheme = currentEffective === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    onThemeChange(callback) {
        this.themeChangeCallbacks.push(callback);
    }

    notifyThemeChange(theme) {
        const effectiveTheme = this.getEffectiveTheme();
        this.themeChangeCallbacks.forEach(callback => {
            try {
                callback(effectiveTheme, theme);
            } catch (error) {
                console.error('Error en callback de cambio de tema:', error);
            }
        });
    }

    // Método para obtener el tema actual
    getCurrentTheme() {
        return this.currentTheme;
    }

    // Método para obtener el tema efectivo
    getEffectiveThemeValue() {
        return this.getEffectiveTheme();
    }

    // Método para verificar si está en modo oscuro
    isDarkMode() {
        return this.getEffectiveTheme() === 'dark';
    }

    // Método para verificar si está en modo claro
    isLightMode() {
        return this.getEffectiveTheme() === 'light';
    }
}

// Crear instancia global
let themeManager;

// Inicializar cuando el DOM esté listo
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        themeManager = new ThemeManager();
        window.themeManager = themeManager;
    });
}

// Exportar para uso en módulos
export default ThemeManager;

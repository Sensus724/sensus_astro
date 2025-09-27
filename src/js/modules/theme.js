/**
 * Sensus Theme Module
 * Manejo de temas claro/oscuro
 */

class ThemeModule {
  constructor() {
    this.currentTheme = 'light';
    this.themes = ['light', 'dark'];
    this.storageKey = 'sensus-theme';
    
    this.init();
  }

  /**
   * Inicializar módulo de tema
   */
  init() {
    console.log('🎨 Inicializando módulo de tema...');
    
    // Cargar tema guardado
    this.loadSavedTheme();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    // Aplicar tema inicial
    this.applyTheme(this.currentTheme);
    
    console.log('✅ Módulo de tema inicializado');
  }

  /**
   * Cargar tema guardado
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme && this.themes.includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Detectar preferencia del sistema
      this.currentTheme = this.detectSystemTheme();
    }
  }

  /**
   * Detectar tema del sistema
   */
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event listeners para botones de tema
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-theme-toggle]')) {
        this.toggleTheme();
      } else if (event.target.matches('[data-theme="light"]')) {
        this.setTheme('light');
      } else if (event.target.matches('[data-theme="dark"]')) {
        this.setTheme('dark');
      }
    });

    // Escuchar cambios en preferencia del sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.storageKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Event listeners para teclado
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 't') {
        event.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Alternar tema
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Establecer tema
   */
  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.warn(`Tema "${theme}" no válido`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    
    // Emitir evento
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme, previousTheme: this.currentTheme } 
    }));
  }

  /**
   * Aplicar tema
   */
  applyTheme(theme) {
    // Aplicar al documento
    document.documentElement.setAttribute('data-theme', theme);
    
    // Actualizar meta theme-color
    this.updateMetaThemeColor(theme);
    
    // Actualizar iconos de tema
    this.updateThemeIcons(theme);
    
    // Actualizar texto de tema
    this.updateThemeText(theme);
    
    console.log(`🎨 Tema aplicado: ${theme}`);
  }

  /**
   * Actualizar meta theme-color
   */
  updateMetaThemeColor(theme) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const metaTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    
    const colors = {
      light: '#2563eb',
      dark: '#1f2937'
    };
    
    const color = colors[theme];
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    }
    
    if (metaTileColor) {
      metaTileColor.setAttribute('content', color);
    }
  }

  /**
   * Actualizar iconos de tema
   */
  updateThemeIcons(theme) {
    const sunIcons = document.querySelectorAll('[data-theme-icon="sun"]');
    const moonIcons = document.querySelectorAll('[data-theme-icon="moon"]');
    
    if (theme === 'dark') {
      sunIcons.forEach(icon => icon.style.display = 'block');
      moonIcons.forEach(icon => icon.style.display = 'none');
    } else {
      sunIcons.forEach(icon => icon.style.display = 'none');
      moonIcons.forEach(icon => icon.style.display = 'block');
    }
  }

  /**
   * Actualizar texto de tema
   */
  updateThemeText(theme) {
    const themeTexts = document.querySelectorAll('[data-theme-text]');
    
    themeTexts.forEach(element => {
      if (theme === 'dark') {
        element.textContent = 'Modo oscuro';
      } else {
        element.textContent = 'Modo claro';
      }
    });
  }

  /**
   * Guardar tema
   */
  saveTheme(theme) {
    localStorage.setItem(this.storageKey, theme);
  }

  /**
   * Obtener tema actual
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Verificar si es tema oscuro
   */
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  /**
   * Verificar si es tema claro
   */
  isLightTheme() {
    return this.currentTheme === 'light';
  }

  /**
   * Obtener todos los temas disponibles
   */
  getAvailableThemes() {
    return [...this.themes];
  }

  /**
   * Aplicar tema a elemento específico
   */
  applyThemeToElement(element, theme) {
    if (element) {
      element.setAttribute('data-theme', theme);
    }
  }

  /**
   * Obtener colores del tema
   */
  getThemeColors(theme = this.currentTheme) {
    const colors = {
      light: {
        primary: '#2563eb',
        secondary: '#64748b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      },
      dark: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
      }
    };
    
    return colors[theme] || colors.light;
  }

  /**
   * Aplicar tema a CSS custom properties
   */
  applyThemeToCSS(theme = this.currentTheme) {
    const colors = this.getThemeColors(theme);
    const root = document.documentElement;
    
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }
}

export default ThemeModule;

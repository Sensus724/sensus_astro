/*
 * Sensus - Core JavaScript
 * Funcionalidades base y configuración principal
 */

// === CONFIGURACIÓN GLOBAL ===
window.SensusConfig = {
    version: '2.0.0',
    debug: false,
    features: {
        diary: true,
        evaluation: true,
        analytics: true,
        notifications: true,
        themes: true,
        accessibility: true
    },
    api: {
        baseUrl: '/api',
        timeout: 10000
    },
    storage: {
        prefix: 'sensus_',
        encryption: true
    }
};

// === UTILIDADES GLOBALES ===
window.SensusUtils = {
    // Generar ID único
    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),
    
    // Formatear fecha
    formatDate: (date, options = {}) => {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(date).toLocaleDateString('es-ES', { ...defaultOptions, ...options });
    },
    
    // Formatear tiempo
    formatTime: (date) => {
        return new Date(date).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Verificar soporte de características
    checkSupport: {
        localStorage: () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        },
        
        notifications: () => 'Notification' in window,
        
        speechRecognition: () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        
        geolocation: () => 'geolocation' in navigator,
        
        webAudio: () => 'AudioContext' in window || 'webkitAudioContext' in window
    }
};

// === SISTEMA DE EVENTOS GLOBAL ===
window.SensusEvents = {
    events: {},
    
    on: (event, callback) => {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    },
    
    off: (event, callback) => {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    },
    
    emit: (event, data) => {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
};

// === SISTEMA DE NOTIFICACIONES ===
window.SensusNotifications = {
    show: (message, type = 'info', duration = 4000) => {
        const toast = document.createElement('div');
        toast.className = `sensus-toast sensus-toast-${type}`;
        toast.innerHTML = `
            <div class="sensus-toast-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
                <button class="sensus-toast-close">&times;</button>
            </div>
        `;
        
        // Estilos inline para asegurar funcionamiento
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary, #ffffff);
            border: 1px solid var(--border-color, #e5e7eb);
            border-radius: var(--radius-lg, 8px);
            padding: var(--space-4, 16px);
            box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
            z-index: 10000;
            max-width: 400px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Mostrar toast
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 100);
        
        // Event listener para cerrar
        toast.querySelector('.sensus-toast-close').addEventListener('click', () => {
            this.hide(toast);
        });
        
        // Auto-hide
        setTimeout(() => {
            this.hide(toast);
        }, duration);
    },
    
    hide: (toast) => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    },
    
    getIcon: (type) => {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
};

// === SISTEMA DE TEMAS ===
window.SensusThemes = {
    current: 'default',
    
    init: () => {
        const savedTheme = localStorage.getItem('sensus_theme');
        if (savedTheme) {
            this.apply(savedTheme);
        }
    },
    
    apply: (themeName) => {
        // Remover tema anterior
        document.body.classList.remove(`theme-${this.current}`);
        
        // Aplicar nuevo tema
        document.body.classList.add(`theme-${themeName}`);
        this.current = themeName;
        
        // Guardar preferencia
        localStorage.setItem('sensus_theme', themeName);
        
        // Emitir evento
        SensusEvents.emit('themeChanged', themeName);
    },
    
    getAvailable: () => [
        'default', 'sunshine', 'ocean', 'forest', 'sunset', 'night'
    ]
};

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas base
    SensusThemes.init();
    
    // Verificar soporte de características
    if (!SensusUtils.checkSupport.localStorage()) {
        SensusNotifications.show('Tu navegador no soporta almacenamiento local', 'warning');
    }
    
    // Emitir evento de inicialización
    SensusEvents.emit('appInitialized');
    
    console.log('Sensus Core initialized');
});

// === EXPORTAR PARA USO GLOBAL ===
window.Sensus = {
    Config: SensusConfig,
    Utils: SensusUtils,
    Events: SensusEvents,
    Notifications: SensusNotifications,
    Themes: SensusThemes
};

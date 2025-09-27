/**
 * Sensus Event Manager
 * Sistema centralizado de eventos para toda la aplicación
 */

class EventManager {
    constructor() {
        this.events = new Map();
        this.delegatedEvents = new Map();
        this.init();
    }

    init() {
        console.log('🎯 Inicializando Event Manager...');
        this.setupGlobalEventListeners();
        this.setupDelegatedEvents();
        console.log('✅ Event Manager inicializado');
    }

    /**
     * Configurar event listeners globales
     */
    setupGlobalEventListeners() {
        // Event delegation para botones
        document.addEventListener('click', (e) => {
            this.handleButtonClick(e);
        });

        // Event delegation para formularios
        document.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Event delegation para inputs
        document.addEventListener('input', (e) => {
            this.handleInputChange(e);
        });

        // Event delegation para cambios de tema
        document.addEventListener('change', (e) => {
            this.handleThemeChange(e);
        });
    }

    /**
     * Configurar eventos delegados
     */
    setupDelegatedEvents() {
        // Botones de autenticación
        this.delegate('click', '[data-auth="login"]', (e) => {
            e.preventDefault();
            this.emit('auth:showLogin');
        });

        this.delegate('click', '[data-auth="register"]', (e) => {
            e.preventDefault();
            this.emit('auth:showRegister');
        });

        this.delegate('click', '[data-auth="logout"]', (e) => {
            e.preventDefault();
            this.emit('auth:logout');
        });

        // Botones de tema
        this.delegate('click', '[data-theme-toggle]', (e) => {
            e.preventDefault();
            this.emit('theme:toggle');
        });

        // Botones de test
        this.delegate('click', '.test-button', (e) => {
            e.preventDefault();
            const testType = e.target.dataset.test || e.target.closest('.test-button')?.dataset.test;
            if (testType) {
                this.emit('test:start', { testType });
            }
        });

        // Botones de ejercicio
        this.delegate('click', '.start-exercise', (e) => {
            e.preventDefault();
            const exerciseType = e.target.dataset.exercise || e.target.closest('.start-exercise')?.dataset.exercise;
            if (exerciseType) {
                this.emit('exercise:start', { exerciseType });
            }
        });

        // Menú móvil
        this.delegate('click', '.menu-toggle', (e) => {
            e.preventDefault();
            this.emit('menu:toggle');
        });

        // Cerrar menú móvil
        this.delegate('click', '.menu-backdrop', (e) => {
            e.preventDefault();
            this.emit('menu:close');
        });

        // Navegación del menú móvil
        this.delegate('click', '.menu-overlay a', (e) => {
            this.emit('menu:navigate', { href: e.target.href });
        });
    }

    /**
     * Delegar eventos
     */
    delegate(event, selector, handler) {
        if (!this.delegatedEvents.has(event)) {
            this.delegatedEvents.set(event, new Map());
        }
        this.delegatedEvents.get(event).set(selector, handler);
    }

    /**
     * Manejar clicks de botones
     */
    handleButtonClick(e) {
        const button = e.target.closest('button');
        if (!button) return;

        // Botones de navegación
        if (button.classList.contains('nav-link')) {
            e.preventDefault();
            this.emit('navigation:click', { href: button.href });
            return;
        }

        // Botones de acción rápida
        if (button.id === 'quick-mood-check') {
            e.preventDefault();
            this.emit('quickAction:moodCheck');
            return;
        }

        if (button.id === 'quick-breathing') {
            e.preventDefault();
            this.emit('quickAction:breathing');
            return;
        }

        if (button.id === 'quick-reflection') {
            e.preventDefault();
            this.emit('quickAction:reflection');
            return;
        }

        if (button.id === 'view-progress') {
            e.preventDefault();
            this.emit('quickAction:viewProgress');
            return;
        }
    }

    /**
     * Manejar envío de formularios
     */
    handleFormSubmit(e) {
        const form = e.target;
        
        if (form.id === 'login-form') {
            e.preventDefault();
            this.emit('auth:login', new FormData(form));
            return;
        }

        if (form.id === 'register-form') {
            e.preventDefault();
            this.emit('auth:register', new FormData(form));
            return;
        }

        if (form.id === 'reflection-form') {
            e.preventDefault();
            this.emit('diary:saveReflection', new FormData(form));
            return;
        }
    }

    /**
     * Manejar cambios de input
     */
    handleInputChange(e) {
        if (e.target.id === 'anxiety-scale') {
            this.emit('anxiety:levelChange', { level: e.target.value });
            return;
        }

        if (e.target.id === 'reflection-text') {
            this.emit('reflection:textChange', { text: e.target.value });
            return;
        }
    }

    /**
     * Manejar cambios de tema
     */
    handleThemeChange(e) {
        if (e.target.matches('[data-theme]')) {
            this.emit('theme:change', { theme: e.target.dataset.theme });
        }
    }

    /**
     * Registrar evento
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    /**
     * Remover evento
     */
    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emitir evento
     */
    emit(event, data = null) {
        console.log(`📡 Evento emitido: ${event}`, data);
        
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error en callback para evento ${event}:`, error);
                }
            });
        }

        // Emitir evento personalizado del DOM
        window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    /**
     * Emitir evento una sola vez
     */
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }

    /**
     * Obtener todos los eventos registrados
     */
    getEvents() {
        return Array.from(this.events.keys());
    }

    /**
     * Limpiar todos los eventos
     */
    clear() {
        this.events.clear();
        this.delegatedEvents.clear();
    }
}

// Crear instancia global
window.SensusEventManager = new EventManager();

export default EventManager;

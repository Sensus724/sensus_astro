/**
 * Sensus Button Manager
 * Sistema centralizado para manejar todos los botones de la aplicación
 */

class ButtonManager {
    constructor() {
        this.buttons = new Map();
        this.states = new Map();
        this.init();
    }

    init() {
        console.log('🔘 Inicializando Button Manager...');
        this.setupButtonStates();
        this.setupButtonAnimations();
        this.setupButtonAccessibility();
        console.log('✅ Button Manager inicializado');
    }

    /**
     * Configurar estados de botones
     */
    setupButtonStates() {
        // Estados por defecto
        this.states.set('default', {
            enabled: true,
            loading: false,
            visible: true
        });

        this.states.set('loading', {
            enabled: false,
            loading: true,
            visible: true
        });

        this.states.set('disabled', {
            enabled: false,
            loading: false,
            visible: true
        });

        this.states.set('hidden', {
            enabled: false,
            loading: false,
            visible: false
        });
    }

    /**
     * Configurar animaciones de botones
     */
    setupButtonAnimations() {
        // Agregar estilos de animación
        const style = document.createElement('style');
        style.textContent = `
            .btn-animated {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .btn-animated::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }

            .btn-animated:hover::before {
                left: 100%;
            }

            .btn-loading {
                position: relative;
                pointer-events: none;
            }

            .btn-loading::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                margin: -10px 0 0 -10px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .btn-pulse {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Configurar accesibilidad de botones
     */
    setupButtonAccessibility() {
        // Agregar roles ARIA a botones sin roles
        document.addEventListener('DOMContentLoaded', () => {
            const buttons = document.querySelectorAll('button:not([role])');
            buttons.forEach(button => {
                if (!button.getAttribute('role')) {
                    button.setAttribute('role', 'button');
                }
            });
        });
    }

    /**
     * Registrar botón
     */
    registerButton(selector, options = {}) {
        const button = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!button) return false;

        const config = {
            id: button.id || `btn-${Date.now()}`,
            selector: selector,
            element: button,
            state: 'default',
            callbacks: new Map(),
            ...options
        };

        this.buttons.set(config.id, config);
        this.addButtonClasses(button);
        return config.id;
    }

    /**
     * Agregar clases de botón
     */
    addButtonClasses(button) {
        if (!button.classList.contains('btn-animated')) {
            button.classList.add('btn-animated');
        }
    }

    /**
     * Configurar botón de autenticación
     */
    setupAuthButton(selector, type) {
        const buttonId = this.registerButton(selector);
        if (!buttonId) return;

        const button = this.buttons.get(buttonId);
        
        // Agregar event listener
        button.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.emit('auth:show' + type.charAt(0).toUpperCase() + type.slice(1));
        });

        // Agregar clases específicas
        button.element.classList.add(`btn-auth-${type}`);
        button.element.setAttribute('data-auth', type);
    }

    /**
     * Configurar botón de test
     */
    setupTestButton(selector, testType) {
        const buttonId = this.registerButton(selector);
        if (!buttonId) return;

        const button = this.buttons.get(buttonId);
        
        // Agregar event listener
        button.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.emit('test:start', { testType });
        });

        // Agregar clases específicas
        button.element.classList.add('btn-test');
        button.element.setAttribute('data-test', testType);
    }

    /**
     * Configurar botón de ejercicio
     */
    setupExerciseButton(selector, exerciseType) {
        const buttonId = this.registerButton(selector);
        if (!buttonId) return;

        const button = this.buttons.get(buttonId);
        
        // Agregar event listener
        button.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.emit('exercise:start', { exerciseType });
        });

        // Agregar clases específicas
        button.element.classList.add('btn-exercise');
        button.element.setAttribute('data-exercise', exerciseType);
    }

    /**
     * Configurar botón de menú móvil
     */
    setupMobileMenuButton(selector) {
        const buttonId = this.registerButton(selector);
        if (!buttonId) return;

        const button = this.buttons.get(buttonId);
        
        // Agregar event listener
        button.element.addEventListener('click', (e) => {
            e.preventDefault();
            this.emit('menu:toggle');
        });

        // Agregar clases específicas
        button.element.classList.add('btn-menu-toggle');
    }

    /**
     * Cambiar estado de botón
     */
    setButtonState(buttonId, state) {
        const button = this.buttons.get(buttonId);
        if (!button) return false;

        const stateConfig = this.states.get(state);
        if (!stateConfig) return false;

        button.state = state;
        const element = button.element;

        // Aplicar estado
        if (stateConfig.visible) {
            element.style.display = '';
        } else {
            element.style.display = 'none';
        }

        if (stateConfig.enabled) {
            element.disabled = false;
            element.classList.remove('disabled');
        } else {
            element.disabled = true;
            element.classList.add('disabled');
        }

        if (stateConfig.loading) {
            element.classList.add('btn-loading');
        } else {
            element.classList.remove('btn-loading');
        }

        return true;
    }

    /**
     * Mostrar loading en botón
     */
    showLoading(buttonId, text = 'Cargando...') {
        const button = this.buttons.get(buttonId);
        if (!button) return false;

        const element = button.element;
        const originalText = element.textContent;
        
        // Guardar texto original
        element.dataset.originalText = originalText;
        
        // Mostrar loading
        element.innerHTML = `
            <span class="btn-loading-text">${text}</span>
        `;
        
        this.setButtonState(buttonId, 'loading');
        return true;
    }

    /**
     * Ocultar loading en botón
     */
    hideLoading(buttonId) {
        const button = this.buttons.get(buttonId);
        if (!button) return false;

        const element = button.element;
        const originalText = element.dataset.originalText;
        
        // Restaurar texto original
        if (originalText) {
            element.textContent = originalText;
            delete element.dataset.originalText;
        }
        
        this.setButtonState(buttonId, 'default');
        return true;
    }

    /**
     * Habilitar botón
     */
    enableButton(buttonId) {
        return this.setButtonState(buttonId, 'default');
    }

    /**
     * Deshabilitar botón
     */
    disableButton(buttonId) {
        return this.setButtonState(buttonId, 'disabled');
    }

    /**
     * Ocultar botón
     */
    hideButton(buttonId) {
        return this.setButtonState(buttonId, 'hidden');
    }

    /**
     * Mostrar botón
     */
    showButton(buttonId) {
        return this.setButtonState(buttonId, 'default');
    }

    /**
     * Agregar callback a botón
     */
    addButtonCallback(buttonId, event, callback) {
        const button = this.buttons.get(buttonId);
        if (!button) return false;

        if (!button.callbacks.has(event)) {
            button.callbacks.set(event, []);
        }
        button.callbacks.get(event).push(callback);
        return true;
    }

    /**
     * Ejecutar callbacks de botón
     */
    executeButtonCallbacks(buttonId, event, data) {
        const button = this.buttons.get(buttonId);
        if (!button || !button.callbacks.has(event)) return;

        button.callbacks.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error en callback de botón ${buttonId}:`, error);
            }
        });
    }

    /**
     * Obtener información de botón
     */
    getButtonInfo(buttonId) {
        return this.buttons.get(buttonId);
    }

    /**
     * Obtener todos los botones
     */
    getAllButtons() {
        return Array.from(this.buttons.values());
    }

    /**
     * Limpiar botones
     */
    clearButtons() {
        this.buttons.clear();
    }

    /**
     * Emitir evento
     */
    emit(event, data) {
        if (window.SensusEventManager) {
            window.SensusEventManager.emit(event, data);
        }
    }
}

// Crear instancia global
window.SensusButtonManager = new ButtonManager();

export default ButtonManager;

/*
 * Test Launcher
 * Sistema para iniciar tests psicológicos desde cualquier página
 */

import TestManager from './test-manager.js';

// Importar estilos para los botones
const loadStyles = () => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/js/pages/tests/test-buttons.css';
    document.head.appendChild(link);
};


class TestLauncher {
    constructor() {
        this.testManager = new TestManager();
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Test Launcher...');
        // Cargar estilos para los botones
        loadStyles();
        // Mejorar la apariencia de los botones existentes
        this.enhanceTestButtons();
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    enhanceTestButtons() {
        // Buscar todos los botones de test
        const testButtons = document.querySelectorAll('.test-button, [data-test]');
        
        testButtons.forEach(button => {
            // Solo procesar si tiene texto que incluye 'Comenzar'
            const buttonText = button.textContent || '';
            if (buttonText.includes('Comenzar')) {
                // Añadir icono si no tiene uno
                if (!button.querySelector('i')) {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-play-circle';
                    button.prepend(icon);
                }
                
                // Añadir span para el texto si no tiene uno
                if (!button.querySelector('.button-text')) {
                    const textContent = button.textContent;
                    button.innerHTML = '';
                    
                    // Recrear el icono
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-play-circle';
                    button.appendChild(icon);
                    
                    // Añadir el texto en un span
                    const textSpan = document.createElement('span');
                    textSpan.className = 'button-text';
                    textSpan.textContent = textContent.trim();
                    button.appendChild(textSpan);
                }
            }
        });
    }

    setupEventListeners() {
        // Escuchar clicks en botones de inicio de test
        document.addEventListener('click', (e) => {
            // Botones con clase 'test-button'
            if (e.target.classList.contains('test-button') || e.target.closest('.test-button')) {
                e.preventDefault();
                const button = e.target.classList.contains('test-button') ? e.target : e.target.closest('.test-button');
                const testId = button.dataset.test;
                if (testId) {
                    this.launchTest(testId);
                }
            }
            
            // Cualquier botón con atributo data-test
            if (e.target.hasAttribute('data-test') || e.target.closest('[data-test]')) {
                const button = e.target.hasAttribute('data-test') ? e.target : e.target.closest('[data-test]');
                // Solo procesar si tiene texto que incluye 'Comenzar'
                const buttonText = button.textContent || '';
                if (buttonText.includes('Comenzar')) {
                    e.preventDefault();
                    const testId = button.dataset.test;
                    if (testId) {
                        this.launchTest(testId);
                    }
                }
            }
        });
    }

    launchTest(testId) {
        console.log(`🧠 Lanzando test: ${testId}`);
        // Verificar que el testId sea válido
        if (!this.testManager.tests[testId]) {
            console.error(`Test ${testId} no encontrado`);
            return;
        }
        
        // Redirigir a la página de evaluación con el parámetro del test
        if (window.location.pathname !== '/evaluacion') {
            window.location.href = `/evaluacion?test=${testId}`;
        } else {
            // Si ya estamos en la página de evaluación, iniciar el test directamente
            console.log('Iniciando test directamente:', testId);
            this.testManager.startTest(testId);
        }
    }
}

// Inicializar el launcher cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TestLauncher();
});

export default TestLauncher;
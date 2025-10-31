/*
 * Simple Test Launcher
 * Sistema simplificado para iniciar el test de ansiedad GAD-7
 */

import SimpleTestManager from './simple-test-manager.js';

class SimpleTestLauncher {
    constructor() {
        this.testManager = new SimpleTestManager();
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Simple Test Launcher...');
        // Mejorar la apariencia de los botones existentes
        this.enhanceTestButtons();
        // Configurar event listeners
        this.setupEventListeners();
    }
    
    enhanceTestButtons() {
        // Buscar todos los botones de test
        const testButtons = document.querySelectorAll('.test-button, [data-test="gad7"]');
        
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
            // Botones con clase 'test-button' o atributo data-test="gad7"
            if (e.target.classList.contains('test-button') || 
                e.target.closest('.test-button') ||
                (e.target.hasAttribute('data-test') && e.target.getAttribute('data-test') === 'gad7') ||
                (e.target.closest('[data-test="gad7"]'))) {
                
                e.preventDefault();
                console.log('Botón de test de ansiedad clickeado');
                this.launchTest();
            }
        });
    }

    launchTest() {
        console.log('🧠 Lanzando test de ansiedad GAD-7');
        
        // Redirigir a la página de evaluación con el parámetro del test
        if (window.location.pathname !== '/evaluacion') {
            window.location.href = `/evaluacion?test=gad7`;
        } else {
            // Si ya estamos en la página de evaluación, iniciar el test directamente
            console.log('Iniciando test directamente');
            this.testManager.startTest();
        }
    }
}

// Inicializar el launcher cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SimpleTestLauncher();
});

export default SimpleTestLauncher;
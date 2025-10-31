/*
 * Test Manager
 * Sistema de gestión de tests psicológicos individuales
 */

// Importar los tests individuales
import GAD7Test from './tests/gad7.js';
import PHQ9Test from './tests/phq9.js';
import PSSTest from './tests/pss.js';
import WellnessTest from './tests/wellness.js';
import SelfEsteemTest from './tests/selfesteem.js';

// Las partes adicionales se importarán después de la definición de la clase
// para evitar problemas de importación circular

class TestManager {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.answers = {};
        this.testContainer = null;
        this.tests = {
            'gad7': new GAD7Test(),
            'phq9': new PHQ9Test(),
            'pss': new PSSTest(),
            'wellness': new WellnessTest(),
            'selfesteem': new SelfEsteemTest()
        };
        
        this.init();
    }

    init() {
        console.log('🧠 Inicializando Test Manager...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar clicks en botones de inicio de test
        document.addEventListener('click', (e) => {
            // Botones de inicio de test
            if (e.target.matches('[data-test]') || e.target.closest('[data-test]')) {
                const button = e.target.matches('[data-test]') ? e.target : e.target.closest('[data-test]');
                const testId = button.dataset.test;
                this.startTest(testId);
            }
            
            // Botón de inicio en la página de detalle del test
            if (e.target.matches('[data-action="start-test"]') || e.target.closest('[data-action="start-test"]')) {
                const button = e.target.matches('[data-action="start-test"]') ? e.target : e.target.closest('[data-action="start-test"]');
                const testId = button.dataset.test;
                this.startTest(testId);
            }
            
            // Botones de respuesta
            if (e.target.matches('.answer-btn') || e.target.closest('.answer-btn')) {
                const button = e.target.matches('.answer-btn') ? e.target : e.target.closest('.answer-btn');
                const value = parseInt(button.dataset.value);
                this.selectAnswer(value);
            }
            
            // Botones de navegación
            if (e.target.matches('#next-btn') || e.target.closest('#next-btn')) {
                this.nextQuestion();
            }
            
            if (e.target.matches('#prev-btn') || e.target.closest('#prev-btn')) {
                this.prevQuestion();
            }
            
            if (e.target.matches('#submit-btn') || e.target.closest('#submit-btn')) {
                this.submitTest();
            }
            
            // Botones de filtro de tests
            if (e.target.matches('.filter-btn') || e.target.closest('.filter-btn')) {
                const button = e.target.matches('.filter-btn') ? e.target : e.target.closest('.filter-btn');
                const category = button.dataset.filter;
                this.filterTests(category);
            }
            
            // Botones de resultados
            if (e.target.matches('#home-btn') || e.target.closest('#home-btn')) {
                window.location.href = '/evaluacion';
            }
            
            if (e.target.matches('#diary-btn') || e.target.closest('#diary-btn')) {
                window.location.href = '/diario';
            }
            
            if (e.target.matches('#retake-btn') || e.target.closest('#retake-btn')) {
                const testId = this.currentTest;
                this.startTest(testId);
            }
        });
    }

    // Resto de métodos se implementarán en test-manager-part2.js
}

export default TestManager;

// Importar partes adicionales del sistema después de la definición de la clase
import './test-manager-part2.js';
import './test-manager-part3.js';
import './test-manager-part4.js';
import './test-manager-part5.js';
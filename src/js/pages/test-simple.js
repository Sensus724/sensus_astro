/*
 * Sistema de Tests Simplificado
 * Versión directa y funcional
 */

class SimpleTestSystem {
    constructor() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = [];
        this.totalQuestions = 0;
        this.init();
    }

    init() {
        console.log('🧠 Inicializando sistema de tests simplificado...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event listeners para botones de test
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('test-button') || e.target.closest('.test-button')) {
                e.preventDefault();
                const button = e.target.classList.contains('test-button') ? e.target : e.target.closest('.test-button');
                const testType = button.dataset.test;
                if (testType) {
                    this.startTest(testType);
                }
            }
        });

        // Event listeners para respuestas
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-btn')) {
                this.selectAnswer(e.target);
            }
        });

        // Event listeners para navegación
        document.addEventListener('click', (e) => {
            if (e.target.id === 'next-question') {
                this.nextQuestion();
            } else if (e.target.id === 'prev-question') {
                this.prevQuestion();
            } else if (e.target.id === 'submit-test') {
                this.submitTest();
            }
        });
    }

    startTest(testType) {
        console.log('🚀 Iniciando test:', testType);
        
        this.currentTest = testType;
        this.currentQuestion = 0;
        this.answers = {};

        // Ocultar secciones de la página
        this.hidePageSections();

        // Crear contenedor de test
        this.createTestContainer();

        // Cargar preguntas del test
        this.questions = this.getTestQuestions(testType);
        this.totalQuestions = this.questions.length;

        // Mostrar primera pregunta
        this.showQuestion(0);
        this.updateProgress();
    }

    hidePageSections() {
        const sectionsToHide = [
            '.hero-section',
            '.tests-section',
            '.guide-section',
            '.info-section',
            '.cta-section'
        ];

        sectionsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.display = 'none';
        });
    }

    createTestContainer() {
        // Eliminar contenedor anterior si existe
        const existingContainer = document.getElementById('test-area');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Crear nuevo contenedor
        const testContainer = document.createElement('div');
        testContainer.id = 'test-area';
        testContainer.className = 'test-area';
        testContainer.innerHTML = this.getTestHTML();
        document.body.appendChild(testContainer);

        // Agregar estilos
        this.addTestStyles();
    }

    getTestHTML() {
        const testInfo = this.getTestInfo(this.currentTest);
        return `
            <div class="test-header">
                <h2>${testInfo.name}</h2>
                <p class="test-description">${testInfo.description}</p>
                <div class="test-progress">
                    <div class="progress-bar-container">
                        <div id="progress-bar" class="progress-bar"></div>
                    </div>
                    <span id="progress-text">0% completado</span>
                </div>
            </div>
            
            <div class="test-content">
                <div class="question-container">
                    <div class="question-number" id="question-number">1 de ${this.totalQuestions || '?'}</div>
                    <div class="question-text" id="question-text"></div>
                    <div class="options-container" id="options-container"></div>
                </div>
                
                <div class="test-navigation">
                    <button id="prev-question" class="btn btn-outline" style="display: none;">
                        <i class="fas fa-arrow-left"></i>
                        Anterior
                    </button>
                    <button id="next-question" class="btn btn-primary" disabled>
                        Siguiente
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button id="submit-test" class="btn btn-success" style="display: none;">
                        <i class="fas fa-check"></i>
                        Finalizar Test
                    </button>
                </div>
            </div>
        `;
    }

    getTestInfo(testType) {
        const testInfo = {
            'gad7': {
                name: 'Test de Ansiedad (GAD-7)',
                description: 'Escala de Ansiedad Generalizada - 7 preguntas'
            },
            'phq9': {
                name: 'Test de Depresión (PHQ-9)',
                description: 'Cuestionario de Salud del Paciente - 9 preguntas'
            },
            'pss': {
                name: 'Test de Estrés (PSS)',
                description: 'Escala de Estrés Percibido - 10 preguntas'
            },
            'wellness': {
                name: 'Test de Bienestar General',
                description: 'Evaluación Integral del Bienestar - 15 preguntas'
            },
            'selfesteem': {
                name: 'Test de Autoestima (RSES)',
                description: 'Escala de Autoestima de Rosenberg - 10 preguntas'
            }
        };
        
        return testInfo[testType] || testInfo['gad7'];
    }

    getTestQuestions(testType) {
        const questions = {
            'gad7': [
                {
                    id: 1,
                    question: "¿Con qué frecuencia te has sentido nervioso, ansioso o al borde durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 2,
                    question: "¿Con qué frecuencia no has podido parar o controlar las preocupaciones durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 3,
                    question: "¿Con qué frecuencia te has preocupado demasiado por diferentes cosas durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 4,
                    question: "¿Con qué frecuencia has tenido dificultades para relajarte durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 5,
                    question: "¿Con qué frecuencia has estado tan inquieto que te ha sido difícil quedarte quieto durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 6,
                    question: "¿Con qué frecuencia te has sentido molesto o irritable durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                },
                {
                    id: 7,
                    question: "¿Con qué frecuencia has sentido miedo de que algo terrible pudiera pasar durante las últimas 2 semanas?",
                    options: [
                        { value: 0, text: "Nunca" },
                        { value: 1, text: "Varios días" },
                        { value: 2, text: "Más de la mitad de los días" },
                        { value: 3, text: "Casi todos los días" }
                    ]
                }
            ]
        };

        return questions[testType] || questions['gad7'];
    }

    showQuestion(questionIndex) {
        const question = this.questions[questionIndex];
        if (!question) return;

        // Actualizar contenido de la pregunta
        const questionElement = document.getElementById('question-text');
        if (questionElement) {
            questionElement.textContent = question.question;
        }

        // Actualizar opciones
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'answer-btn';
                button.textContent = option.text;
                button.dataset.value = option.value;
                button.dataset.questionId = question.id;
                
                // Marcar como seleccionado si ya fue respondido
                if (this.answers[question.id] === option.value) {
                    button.classList.add('selected');
                }
                
                optionsContainer.appendChild(button);
            });
        }

        // Actualizar número de pregunta
        const questionNumber = document.getElementById('question-number');
        if (questionNumber) {
            questionNumber.textContent = `${questionIndex + 1} de ${this.totalQuestions}`;
        }

        // Actualizar botones de navegación
        this.updateNavigationButtons();
    }

    selectAnswer(button) {
        const questionId = parseInt(button.dataset.questionId);
        const value = parseInt(button.dataset.value);

        // Remover selección anterior
        const allButtons = document.querySelectorAll(`[data-question-id="${questionId}"]`);
        allButtons.forEach(btn => btn.classList.remove('selected'));

        // Marcar nueva selección
        button.classList.add('selected');
        this.answers[questionId] = value;

        // Habilitar botón siguiente
        this.updateNavigationButtons();
    }

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
            this.updateProgress();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
            this.updateProgress();
        }
    }

    updateNavigationButtons() {
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        const submitBtn = document.getElementById('submit-test');

        // Botón anterior
        if (prevBtn) {
            prevBtn.style.display = this.currentQuestion > 0 ? 'block' : 'none';
        }

        // Botón siguiente/enviar
        if (this.currentQuestion === this.totalQuestions - 1) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }

        // Habilitar botón siguiente solo si hay respuesta
        const currentQuestionId = this.questions[this.currentQuestion]?.id;
        const hasAnswer = this.answers[currentQuestionId] !== undefined;
        
        if (nextBtn) {
            nextBtn.disabled = !hasAnswer;
        }
        if (submitBtn) {
            submitBtn.disabled = !this.isTestComplete();
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        
        if (progressBar && progressText) {
            const progress = ((this.currentQuestion + 1) / this.totalQuestions) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% completado`;
        }
    }

    isTestComplete() {
        return Object.keys(this.answers).length === this.totalQuestions;
    }

    submitTest() {
        if (!this.isTestComplete()) {
            alert('Por favor responde todas las preguntas antes de enviar el test.');
            return;
        }

        // Calcular puntuación
        const score = Object.values(this.answers).reduce((sum, value) => sum + value, 0);
        const result = this.getTestResult(score, this.currentTest);

        // Mostrar resultados
        this.showResults(score, result);
    }

    getTestResult(score, testType) {
        if (testType === 'gad7') {
            if (score <= 4) {
                return {
                    level: 'Mínima',
                    description: 'Tu nivel de ansiedad es mínimo. Continúa con tus hábitos saludables.',
                    recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                    color: '#10B981',
                    icon: '😌'
                };
            } else if (score <= 9) {
                return {
                    level: 'Leve',
                    description: 'Tienes síntomas leves de ansiedad. Es normal y manejable.',
                    recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                    color: '#F59E0B',
                    icon: '🧘'
                };
            } else if (score <= 14) {
                return {
                    level: 'Moderada',
                    description: 'Tienes síntomas moderados de ansiedad que pueden beneficiarse de atención.',
                    recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para reducir la ansiedad.',
                    color: '#EF4444',
                    icon: '🤔'
                };
            } else {
                return {
                    level: 'Severa',
                    description: 'Tienes síntomas severos de ansiedad que requieren atención profesional.',
                    recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                    color: '#DC2626',
                    icon: '💙'
                };
            }
        }
        return {
            level: 'Completado',
            description: 'Has completado el test exitosamente.',
            recommendation: 'Gracias por completar la evaluación.',
            color: '#10B981',
            icon: '✅'
        };
    }

    showResults(score, result) {
        const testContainer = document.getElementById('test-area');
        if (!testContainer) return;

        testContainer.innerHTML = `
            <div class="results-container">
                <div class="results-header">
                    <h2>Resultados de tu Evaluación</h2>
                    <div class="score-display">
                        <div class="score-number" style="color: ${result.color}">${score}</div>
                        <div class="score-label">Puntuación Total</div>
                    </div>
                </div>
                
                <div class="result-info">
                    <h3 style="color: ${result.color}">
                        ${result.icon} ${result.level}
                    </h3>
                    <p class="result-description">${result.description}</p>
                    <div class="recommendation">
                        <h4>Recomendación:</h4>
                        <p>${result.recommendation}</p>
                    </div>
                </div>
                
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="window.location.href='/diario'">
                        <i class="fas fa-book-open"></i>
                        Ir al Diario de Bienestar
                    </button>
                    <button class="btn btn-outline" onclick="location.reload()">
                        <i class="fas fa-home"></i>
                        Volver al Inicio
                    </button>
                </div>
            </div>
        `;
    }

    addTestStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .test-area {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background: #ffffff;
                border-radius: 1rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            
            .test-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .test-header h2 {
                color: #1f2937;
                margin-bottom: 1rem;
            }
            
            .test-progress {
                display: flex;
                align-items: center;
                gap: 1rem;
                justify-content: center;
                margin-top: 1rem;
            }
            
            .progress-bar-container {
                width: 200px;
                height: 8px;
                background: #e5e7eb;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background: #2563eb;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .question-container {
                margin-bottom: 2rem;
            }
            
            .question-number {
                font-size: 0.875rem;
                color: #6b7280;
                margin-bottom: 1rem;
                text-align: center;
            }
            
            .question-text {
                font-size: 1.25rem;
                color: #1f2937;
                margin-bottom: 2rem;
                line-height: 1.6;
                text-align: center;
            }
            
            .options-container {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .answer-btn {
                padding: 1rem 1.5rem;
                background: #f9fafb;
                border: 2px solid #e5e7eb;
                border-radius: 0.5rem;
                color: #1f2937;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }
            
            .answer-btn:hover {
                border-color: #93c5fd;
                background: #eff6ff;
            }
            
            .answer-btn.selected {
                border-color: #2563eb;
                background: #dbeafe;
                color: #1e40af;
            }
            
            .test-navigation {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
            }
            
            .btn {
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                border: none;
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: #2563eb;
                color: white;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: #1e40af;
            }
            
            .btn-outline {
                background: transparent;
                color: #2563eb;
                border: 2px solid #2563eb;
            }
            
            .btn-outline:hover {
                background: #2563eb;
                color: white;
            }
            
            .btn-success {
                background: #10b981;
                color: white;
            }
            
            .btn-success:hover {
                background: #059669;
            }
            
            .results-container {
                text-align: center;
            }
            
            .results-header h2 {
                color: #1f2937;
                margin-bottom: 2rem;
            }
            
            .score-display {
                margin-bottom: 2rem;
            }
            
            .score-number {
                font-size: 4rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            
            .score-label {
                font-size: 1.125rem;
                color: #6b7280;
            }
            
            .result-info {
                margin-bottom: 2rem;
            }
            
            .result-info h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            
            .result-description {
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            
            .recommendation {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1rem;
            }
            
            .result-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            
            @media (max-width: 768px) {
                .test-area {
                    margin: 1rem;
                    padding: 1.5rem;
                }
                
                .test-navigation {
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
                
                .result-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar si estamos en la página de evaluación
        const isEvaluationPage = document.body.classList.contains('evaluacion') || 
                                window.location.pathname.includes('/evaluacion') ||
                                document.querySelector('.tests-section') !== null;
        
        if (isEvaluationPage) {
            console.log('🎯 Inicializando sistema de tests simplificado...');
            window.simpleTestSystem = new SimpleTestSystem();
            console.log('✅ Sistema de tests simplificado inicializado correctamente');
        }
    } catch (error) {
        console.error('❌ Error inicializando sistema de tests:', error);
    }
});

// Exportar por defecto
export default SimpleTestSystem;


/*
 * Sensus - Evaluación Interactions
 * JavaScript específico para la página de evaluación
 */

class EvaluacionInteractions {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.totalQuestions = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTest();
    }

    setupEventListeners() {
        // Botones de inicio de test
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-test-btn')) {
                this.startTest(e.target.dataset.testType);
            }
        });

        // Botones de respuesta (para tests en la misma página)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-btn')) {
                this.selectAnswer(e.target);
            }
        });

        // Botón siguiente
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextQuestion();
            });
        }

        // Botón anterior
        const prevBtn = document.getElementById('prev-question');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.prevQuestion();
            });
        }

        // Botón enviar test
        const submitBtn = document.getElementById('submit-test');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitTest();
            });
        }

        // Navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                this.nextQuestion();
            } else if (e.key === 'ArrowLeft') {
                this.prevQuestion();
            }
        });
    }

    initializeTest() {
        // Verificar si hay elementos de test en la página
        const testElements = document.querySelectorAll('#question-text, #options-container, #test-area');
        
        if (testElements.length > 0) {
            // Configurar preguntas del test solo si los elementos existen
            this.questions = this.getTestQuestions();
            this.totalQuestions = this.questions.length;
            
            if (this.totalQuestions > 0) {
                this.showQuestion(0);
                this.updateProgress();
            }
        } else {
            // Si no hay elementos de test, inicializar como página de evaluación
            this.initializeEvaluationPage();
        }
    }

    initializeEvaluationPage() {
        console.log('📋 Inicializando página de evaluación...');
        // Configurar tests disponibles
        this.availableTests = this.getAvailableTests();
        this.renderTests();
        this.updateStats();
    }

    getAvailableTests() {
        return [
            {
                id: 'gad7',
                name: 'Test GAD-7',
                description: 'Escala de Ansiedad Generalizada',
                duration: '5-10 minutos',
                questions: 7,
                icon: '😰',
                color: '#fbbf24',
                category: 'ansiedad'
            },
            {
                id: 'phq9',
                name: 'Test PHQ-9',
                description: 'Cuestionario de Salud del Paciente',
                duration: '5-10 minutos',
                questions: 9,
                icon: '😔',
                color: '#3b82f6',
                category: 'depresion'
            },
            {
                id: 'stress',
                name: 'Escala de Estrés',
                description: 'Evaluación del Nivel de Estrés',
                duration: '3-5 minutos',
                questions: 5,
                icon: '😵',
                color: '#ef4444',
                category: 'estres'
            }
        ];
    }

    renderTests() {
        const testsContainer = document.getElementById('tests-container');
        if (!testsContainer) return;

        testsContainer.innerHTML = '';

        this.availableTests.forEach(test => {
            const testElement = this.createTestElement(test);
            testsContainer.appendChild(testElement);
        });
    }

    createTestElement(test) {
        const testDiv = document.createElement('div');
        testDiv.className = 'test-card';
        testDiv.dataset.testId = test.id;

        testDiv.innerHTML = `
            <div class="test-header">
                <div class="test-icon" style="background: ${test.color}20; color: ${test.color}">
                    ${test.icon}
                </div>
                <div class="test-info">
                    <h3 class="test-name">${test.name}</h3>
                    <p class="test-description">${test.description}</p>
                </div>
            </div>
            
            <div class="test-details">
                <div class="test-detail">
                    <span class="detail-label">Duración:</span>
                    <span class="detail-value">${test.duration}</span>
                </div>
                <div class="test-detail">
                    <span class="detail-label">Preguntas:</span>
                    <span class="detail-value">${test.questions}</span>
                </div>
            </div>

            <div class="test-actions">
                <button class="btn btn-primary start-test-btn" data-test-type="${test.id}">
                    Comenzar Test
                </button>
            </div>
        `;

        return testDiv;
    }

    startTest(testType) {
        // Redirigir a la página de test específica
        window.location.href = `/test?type=${testType}`;
    }

    updateStats() {
        // Actualizar estadísticas de tests completados
        const completedTests = JSON.parse(localStorage.getItem('testResults') || '[]');
        const completedCount = document.getElementById('completed-tests');
        const lastTestDate = document.getElementById('last-test-date');
        
        if (completedCount) {
            completedCount.textContent = completedTests.length;
        }
        
        if (lastTestDate && completedTests.length > 0) {
            const lastTest = completedTests[0];
            const date = new Date(lastTest.timestamp);
            lastTestDate.textContent = date.toLocaleDateString('es-ES');
        }
    }

    getTestQuestions() {
        // Preguntas del test GAD-7 para ansiedad
        return [
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
        ];
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
        const result = this.getTestResult(score);

        // Mostrar resultados
        this.showResults(score, result);

        // Guardar resultados
        this.saveTestResults(score, result);
    }

    getTestResult(score) {
        if (score <= 4) {
            return {
                level: 'Mínima',
                description: 'Tu nivel de ansiedad es mínimo. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#4ade80'
            };
        } else if (score <= 9) {
            return {
                level: 'Leve',
                description: 'Tienes síntomas leves de ansiedad. Es normal y manejable.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                color: '#fbbf24'
            };
        } else if (score <= 14) {
            return {
                level: 'Moderada',
                description: 'Tienes síntomas moderados de ansiedad que pueden beneficiarse de atención.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para reducir la ansiedad.',
                color: '#f97316'
            };
        } else {
            return {
                level: 'Severa',
                description: 'Tienes síntomas severos de ansiedad que requieren atención profesional.',
                recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                color: '#ef4444'
            };
        }
    }

    showResults(score, result) {
        // Crear modal de resultados
        const modal = document.createElement('div');
        modal.className = 'results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Resultados de tu Evaluación</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="score-display">
                        <div class="score-number" style="color: ${result.color}">${score}</div>
                        <div class="score-label">Puntuación Total</div>
                    </div>
                    <div class="result-info">
                        <h3 style="color: ${result.color}">Ansiedad ${result.level}</h3>
                        <p>${result.description}</p>
                        <div class="recommendation">
                            <h4>Recomendación:</h4>
                            <p>${result.recommendation}</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="window.location.href='/diario'">
                            Ir al Diario de Bienestar
                        </button>
                        <button class="btn btn-outline" onclick="window.location.href='/'">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .results-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .score-display {
                text-align: center;
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
            .result-info h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            .result-info p {
                margin-bottom: 1rem;
                line-height: 1.6;
            }
            .recommendation {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                margin-top: 1rem;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Cerrar modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    async saveTestResults(score, result) {
        const testData = {
            score: score,
            result: result,
            answers: this.answers,
            timestamp: new Date().toISOString(),
            testType: 'GAD-7'
        };

        // Guardar en Firebase si está disponible
        if (window.firebaseServices) {
            try {
                await window.firebaseServices.saveEvaluation({
                    testType: 'gad7',
                    testName: 'Test GAD-7',
                    score: score,
                    maxScore: 21,
                    answers: this.answers,
                    result: result,
                    duration: this.getTestDuration()
                });
                console.log('✅ Resultados guardados en Firebase');
            } catch (error) {
                console.error('❌ Error guardando en Firebase:', error);
                // Fallback a localStorage
                this.saveToLocalStorage(testData);
            }
        } else {
            // Fallback a localStorage
            this.saveToLocalStorage(testData);
        }

        // Enviar a analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_completed', {
                'test_type': 'GAD-7',
                'score': score,
                'result_level': result.level
            });
        }
    }

    saveToLocalStorage(testData) {
        const savedTests = JSON.parse(localStorage.getItem('testResults') || '[]');
        savedTests.push(testData);
        localStorage.setItem('testResults', JSON.stringify(savedTests));
    }

    getTestDuration() {
        // Calcular duración del test si hay un timestamp de inicio
        if (this.testStartTime) {
            return Math.floor((Date.now() - this.testStartTime) / 1000);
        }
        return 0;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Verificar si estamos en la página de evaluación
        const isEvaluationPage = document.body.classList.contains('evaluacion') || 
                                window.location.pathname.includes('/evaluacion') ||
                                document.querySelector('.hero-section') !== null;
        
        if (isEvaluationPage) {
            console.log('🎯 Inicializando EvaluacionInteractions...');
            window.evaluacionInteractions = new EvaluacionInteractions();
            console.log('✅ EvaluacionInteractions inicializado correctamente');
        }
    } catch (error) {
        console.error('❌ Error inicializando EvaluacionInteractions:', error);
    }
});

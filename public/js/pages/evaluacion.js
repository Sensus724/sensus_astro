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
        
        // Asegurar que el sistema esté disponible globalmente
        window.EvaluacionInteractions = this;
    }

    setupEventListeners() {
        // Botones de inicio de test (nuevos)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('start-test-btn')) {
                this.startTest(e.target.dataset.testType);
            }
        });

        // Botones de test existentes en la página de evaluación
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('test-button') || e.target.closest('.test-button')) {
                const button = e.target.classList.contains('test-button') ? e.target : e.target.closest('.test-button');
                const testType = button.dataset.test;
                if (testType) {
                    this.startTest(testType);
                }
            }
        });

        // Botones de información
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-button') || e.target.closest('.info-button')) {
                const button = e.target.classList.contains('info-button') ? e.target : e.target.closest('.info-button');
                const testType = button.dataset.test;
                if (testType) {
                    this.showTestInfo(testType);
                }
            }
        });

        // Botones de repetir test
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('retake-button') || e.target.closest('.retake-button')) {
                const button = e.target.classList.contains('retake-button') ? e.target : e.target.closest('.retake-button');
                const testType = button.dataset.test;
                if (testType) {
                    this.startTest(testType);
                }
            }
        });

        // Filtros de tests
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                this.filterTests(e.target.dataset.filter);
            }
        });

        // Búsqueda de tests
        const searchInput = document.getElementById('test-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTests(e.target.value);
            });
        }

        // Botón de limpiar búsqueda
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-search')) {
                this.clearSearch();
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
        console.log(`🚀 Iniciando test: ${testType}`);
        
        // Mapear los tipos de test a los IDs correctos
        const testMapping = {
            'gad7': 'gad7',
            'phq9': 'phq9', 
            'pss': 'stress',
            'wellness': 'wellbeing',
            'selfesteem': 'selfesteem'
        };

        const mappedTestType = testMapping[testType] || testType;
        
        // Iniciar test directamente en la página actual para todos los tipos
        console.log(`🧠 Iniciando test ${mappedTestType} en página actual`);
        this.startGAD7Test(mappedTestType);
    }

    startGAD7Test(testType = 'gad7') {
        // Iniciar test directamente en la página actual
        console.log(`🧠 Iniciando test ${testType} en página actual`);
        
        // Ocultar secciones de la página
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
        
        // Crear contenedor de test
        this.createTestContainer(testType);
        
        // Inicializar test
        this.questions = this.getTestQuestions(testType);
        this.totalQuestions = this.questions.length;
        this.currentQuestion = 0;
        this.answers = {};
        this.testStartTime = Date.now();
        this.currentTestType = testType;
        
        // Mostrar la primera pregunta
        this.showQuestion(0);
        this.updateProgress();
        
        // Asegurar que el contenedor del test sea visible
        const testArea = document.getElementById('test-area');
        if (testArea) {
            testArea.style.display = 'block';
            testArea.scrollIntoView({ behavior: 'smooth' });
        }
    }

    createTestContainer(testType = 'gad7') {
        // Crear contenedor de test si no existe
        let testContainer = document.getElementById('test-area');
        if (!testContainer) {
            testContainer = document.createElement('div');
            testContainer.id = 'test-area';
            testContainer.className = 'test-area';
            document.body.appendChild(testContainer);
        }
        
        // Obtener información del test
        const testInfo = this.getTestInfo(testType);
        
        testContainer.innerHTML = `
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
        
        // Añadir estilos del test
        this.addTestStyles();
        
        // Configurar event listeners para navegación
        this.setupTestNavigation();
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
            'stress': {
                name: 'Test de Estrés (PSS)',
                description: 'Escala de Estrés Percibido - 10 preguntas'
            },
            'wellbeing': {
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

    setupTestNavigation() {
        // Botón siguiente
        const nextBtn = document.getElementById('next-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        // Botón anterior
        const prevBtn = document.getElementById('prev-question');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }

        // Botón enviar
        const submitBtn = document.getElementById('submit-test');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTest());
        }

        // Botones de respuesta
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-btn')) {
                this.selectAnswer(e.target);
            }
        });
    }

    addTestStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .test-area {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background: var(--bg-primary);
                border-radius: 1rem;
                box-shadow: var(--shadow-lg);
            }
            
            .test-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .test-header h2 {
                color: var(--text-primary);
                margin-bottom: 1rem;
            }
            
            .test-progress {
                display: flex;
                align-items: center;
                gap: 1rem;
                justify-content: center;
            }
            
            .progress-bar-container {
                width: 200px;
                height: 8px;
                background: var(--border-color);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background: var(--primary);
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .question-container {
                margin-bottom: 2rem;
            }
            
            .question-number {
                font-size: 0.875rem;
                color: var(--text-secondary);
                margin-bottom: 1rem;
                text-align: center;
            }
            
            .question-text {
                font-size: 1.25rem;
                color: var(--text-primary);
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
                background: var(--bg-secondary);
                border: 2px solid var(--border-color);
                border-radius: 0.5rem;
                color: var(--text-primary);
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: left;
            }
            
            .answer-btn:hover {
                border-color: var(--primary-200);
                background: var(--primary-50);
            }
            
            .answer-btn.selected {
                border-color: var(--primary);
                background: var(--primary-100);
                color: var(--primary-dark);
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
            }
            
            .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .btn-primary {
                background: var(--primary);
                color: var(--text-inverse);
                border: none;
            }
            
            .btn-primary:hover:not(:disabled) {
                background: var(--primary-dark);
            }
            
            .btn-outline {
                background: transparent;
                color: var(--primary);
                border: 2px solid var(--primary);
            }
            
            .btn-outline:hover {
                background: var(--primary);
                color: var(--text-inverse);
            }
            
            .btn-success {
                background: var(--success);
                color: var(--text-inverse);
                border: none;
            }
            
            .btn-success:hover {
                background: var(--success-dark);
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
            }
        `;
        
        document.head.appendChild(style);
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

    getTestQuestions(testType = 'gad7') {
        // Usar el sistema de tests unificado
        if (window.TestPageInteractions) {
            const testSystem = new TestPageInteractions();
            return testSystem.getTestQuestions(testType);
        }
        
        // Fallback: cargar tests desde el archivo test.js
        const testQuestions = {
            'gad7': this.getGAD7Questions(),
            'phq9': this.getPHQ9Questions(),
            'stress': this.getStressQuestions(),
            'wellbeing': this.getWellbeingQuestions(),
            'selfesteem': this.getSelfesteemQuestions()
        };
        
        return testQuestions[testType] || testQuestions['gad7'];
    }

    getGAD7Questions() {
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

    getPHQ9Questions() {
        return [
            {
                id: 1,
                question: "¿Con qué frecuencia has tenido poco interés o placer en hacer las cosas durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia te has sentido decaído, deprimido o sin esperanza durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia has tenido problemas para dormir o has dormido demasiado durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 4,
                question: "¿Con qué frecuencia te has sentido cansado o con poca energía durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia has tenido poco apetito o has comido en exceso durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te has sentido mal contigo mismo o has sentido que has fallado durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia has tenido problemas para concentrarte en cosas como leer el periódico o ver televisión durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 8,
                question: "¿Con qué frecuencia te has movido o hablado tan lento que otras personas podrían haberlo notado, o al contrario, has estado tan inquieto que has estado moviéndote mucho más de lo habitual durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia has pensado que estarías mejor muerto o has tenido pensamientos de lastimarte de alguna manera durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            }
        ];
    }

    getStressQuestions() {
        return [
            {
                id: 1,
                question: "¿Con qué frecuencia te sientes abrumado por las responsabilidades?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia te sientes incapaz de controlar las cosas importantes de tu vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia te sientes nervioso o estresado?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            },
            {
                id: 4,
                question: "¿Con qué frecuencia te sientes confiado en tu capacidad para manejar tus problemas personales?",
                options: [
                    { value: 0, text: "Siempre" },
                    { value: 1, text: "Frecuentemente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Nunca" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia sientes que las cosas van bien para ti?",
                options: [
                    { value: 0, text: "Siempre" },
                    { value: 1, text: "Frecuentemente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Nunca" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te sientes molesto por cosas que están fuera de tu control?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia sientes que estás al día con las cosas que tienes que hacer?",
                options: [
                    { value: 0, text: "Siempre" },
                    { value: 1, text: "Frecuentemente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Nunca" }
                ]
            },
            {
                id: 8,
                question: "¿Con qué frecuencia te sientes irritado porque las cosas no salen como quieres?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia sientes que estás en la cima de las cosas?",
                options: [
                    { value: 0, text: "Siempre" },
                    { value: 1, text: "Frecuentemente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Nunca" }
                ]
            },
            {
                id: 10,
                question: "¿Con qué frecuencia te sientes enfadado por cosas que están fuera de tu control?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "A veces" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Siempre" }
                ]
            }
        ];
    }

    getWellbeingQuestions() {
        return [
            {
                id: 1,
                question: "¿Cómo calificarías tu nivel general de satisfacción con la vida?",
                options: [
                    { value: 0, text: "Muy insatisfecho" },
                    { value: 1, text: "Insatisfecho" },
                    { value: 2, text: "Neutral" },
                    { value: 3, text: "Satisfecho" },
                    { value: 4, text: "Muy satisfecho" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia te sientes optimista sobre el futuro?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia te sientes agradecido por las cosas buenas en tu vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 4,
                question: "¿Con qué frecuencia te sientes conectado con otras personas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia te sientes capaz de manejar los desafíos de la vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te sientes en paz contigo mismo?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia te sientes motivado para perseguir tus objetivos?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 8,
                question: "¿Con qué frecuencia te sientes satisfecho con tus relaciones personales?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia te sientes orgulloso de tus logros?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 10,
                question: "¿Con qué frecuencia te sientes emocionalmente equilibrado?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 11,
                question: "¿Con qué frecuencia te sientes capaz de disfrutar de las actividades cotidianas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 12,
                question: "¿Con qué frecuencia te sientes que tienes un propósito en la vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 13,
                question: "¿Con qué frecuencia te sientes capaz de superar las dificultades?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 14,
                question: "¿Con qué frecuencia te sientes satisfecho con tu salud física?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 15,
                question: "¿Con qué frecuencia te sientes que estás viviendo la vida que quieres?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            }
        ];
    }

    getSelfesteemQuestions() {
        return [
            {
                id: 1,
                question: "Siento que soy una persona de valor, al menos igual que los demás.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 2,
                question: "Siento que tengo varias buenas cualidades.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 3,
                question: "En general, me inclino a pensar que soy un fracaso.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 4,
                question: "Soy capaz de hacer las cosas tan bien como la mayoría de las personas.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 5,
                question: "Siento que no tengo mucho de lo que estar orgulloso.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 6,
                question: "Tengo una actitud positiva hacia mí mismo.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 7,
                question: "En general, estoy satisfecho conmigo mismo.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 8,
                question: "Desearía poder tener más respeto por mí mismo.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 9,
                question: "A veces me siento realmente inútil.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            },
            {
                id: 10,
                question: "A veces creo que no soy bueno en nada.",
                options: [
                    { value: 0, text: "Totalmente de acuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 3, text: "Totalmente en desacuerdo" }
                ]
            }
        ];
    }

    showQuestion(questionIndex) {
        const question = this.questions[questionIndex];
        if (!question) {
            console.error('Pregunta no encontrada:', questionIndex);
            return;
        }

        console.log(`Mostrando pregunta ${questionIndex + 1}:`, question);

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

        console.log(`Seleccionada respuesta: pregunta ${questionId}, valor ${value}`);

        // Remover selección anterior
        const allButtons = document.querySelectorAll(`[data-question-id="${questionId}"]`);
        allButtons.forEach(btn => btn.classList.remove('selected'));

        // Marcar nueva selección
        button.classList.add('selected');
        this.answers[questionId] = value;

        console.log('Respuestas actuales:', this.answers);

        // Habilitar botón siguiente
        this.updateNavigationButtons();
    }

    nextQuestion() {
        console.log(`Navegando a pregunta ${this.currentQuestion + 2}`);
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
            this.updateProgress();
        }
    }

    prevQuestion() {
        console.log(`Navegando a pregunta ${this.currentQuestion}`);
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
        console.log('Enviando test...');
        console.log('Respuestas:', this.answers);
        console.log('Total preguntas:', this.totalQuestions);
        
        if (!this.isTestComplete()) {
            alert('Por favor responde todas las preguntas antes de enviar el test.');
            return;
        }

        // Calcular puntuación
        const score = Object.values(this.answers).reduce((sum, value) => sum + value, 0);
        console.log('Puntuación calculada:', score);
        
        const result = this.getTestResult(score, this.currentTestType || 'gad7');
        console.log('Resultado:', result);

        // Mostrar resultados
        this.showResults(score, result);

        // Guardar resultados
        this.saveTestResults(score, result);
    }

    getTestResult(score, testType = 'gad7') {
        const maxScores = {
            'gad7': 21,
            'phq9': 27,
            'stress': 30,
            'wellbeing': 60,
            'selfesteem': 30
        };

        const maxScore = maxScores[testType] || 21;
        const percentage = (score / maxScore) * 100;

        switch (testType) {
            case 'gad7':
                return this.getGAD7Result(score);
            case 'phq9':
                return this.getPHQ9Result(score);
            case 'stress':
                return this.getStressResult(score);
            case 'wellbeing':
                return this.getWellbeingResult(score);
            case 'selfesteem':
                return this.getSelfesteemResult(score);
            default:
                return this.getGAD7Result(score);
        }
    }

    getGAD7Result(score) {
        if (score <= 4) {
            return {
                level: 'Mínima',
                description: 'Tu nivel de ansiedad es mínimo. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#BFCECB',
                icon: '😌',
                nextSteps: [
                    'Continúa con tus rutinas de bienestar',
                    'Practica técnicas de relajación diarias',
                    'Mantén un diario de emociones'
                ]
            };
        } else if (score <= 9) {
            return {
                level: 'Leve',
                description: 'Tienes síntomas leves de ansiedad. Es normal y manejable.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                color: '#C1D2DB',
                icon: '🧘',
                nextSteps: [
                    'Practica ejercicios de respiración profunda',
                    'Usa nuestro diario de bienestar',
                    'Considera técnicas de mindfulness'
                ]
            };
        } else if (score <= 14) {
            return {
                level: 'Moderada',
                description: 'Tienes síntomas moderados de ansiedad que pueden beneficiarse de atención.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para reducir la ansiedad.',
                color: '#E5C4B9',
                icon: '🤔',
                nextSteps: [
                    'Usa nuestro diario de bienestar regularmente',
                    'Practica ejercicios de relajación progresiva',
                    'Considera buscar apoyo profesional'
                ]
            };
        } else {
            return {
                level: 'Severa',
                description: 'Tienes síntomas severos de ansiedad que requieren atención profesional.',
                recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                color: '#868A8E',
                icon: '💙',
                nextSteps: [
                    'Busca ayuda profesional inmediatamente',
                    'Usa nuestro diario como complemento',
                    'Considera técnicas de crisis de ansiedad'
                ]
            };
        }
    }

    getPHQ9Result(score) {
        if (score <= 4) {
            return {
                level: 'Mínima',
                description: 'Tu nivel de depresión es mínimo. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#BFCECB',
                icon: '😊',
                nextSteps: [
                    'Continúa con tus rutinas de bienestar',
                    'Mantén actividades que te gusten',
                    'Practica gratitud diaria'
                ]
            };
        } else if (score <= 9) {
            return {
                level: 'Leve',
                description: 'Tienes síntomas leves de depresión. Es normal y manejable.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                color: '#C1D2DB',
                icon: '🌱',
                nextSteps: [
                    'Usa nuestro diario de bienestar',
                    'Practica actividades placenteras',
                    'Mantén rutinas de sueño regulares'
                ]
            };
        } else if (score <= 14) {
            return {
                level: 'Moderada',
                description: 'Tienes síntomas moderados de depresión que pueden beneficiarse de atención.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para mejorar el estado de ánimo.',
                color: '#E5C4B9',
                icon: '🤗',
                nextSteps: [
                    'Usa nuestro diario de bienestar regularmente',
                    'Considera buscar apoyo profesional',
                    'Practica ejercicio físico regular'
                ]
            };
        } else if (score <= 19) {
            return {
                level: 'Moderadamente Severa',
                description: 'Tienes síntomas moderadamente severos de depresión.',
                recommendation: 'Considera buscar ayuda profesional. Nuestro diario puede ser un complemento útil.',
                color: '#E7DAD1',
                icon: '💙',
                nextSteps: [
                    'Busca ayuda profesional pronto',
                    'Usa nuestro diario como complemento',
                    'Mantén contacto con seres queridos'
                ]
            };
        } else {
            return {
                level: 'Severa',
                description: 'Tienes síntomas severos de depresión que requieren atención profesional inmediata.',
                recommendation: 'Consulta con un profesional de salud mental inmediatamente. Nuestro diario puede ser un complemento útil.',
                color: '#868A8E',
                icon: '🆘',
                nextSteps: [
                    'Busca ayuda profesional inmediatamente',
                    'Usa nuestro diario como complemento',
                    'No estés solo, busca apoyo'
                ]
            };
        }
    }

    getStressResult(score) {
        if (score <= 13) {
            return {
                level: 'Bajo',
                description: 'Tu nivel de estrés es bajo. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#BFCECB',
                icon: '😌',
                nextSteps: [
                    'Continúa con tus rutinas de bienestar',
                    'Practica técnicas de relajación',
                    'Mantén un equilibrio trabajo-vida'
                ]
            };
        } else if (score <= 26) {
            return {
                level: 'Moderado',
                description: 'Tienes un nivel moderado de estrés. Es normal y manejable.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                color: '#C1D2DB',
                icon: '🧘',
                nextSteps: [
                    'Usa nuestro diario de bienestar',
                    'Practica ejercicios de respiración',
                    'Organiza mejor tu tiempo'
                ]
            };
        } else {
            return {
                level: 'Alto',
                description: 'Tienes un nivel alto de estrés que puede beneficiarse de atención.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para reducir el estrés.',
                color: '#E5C4B9',
                icon: '🤯',
                nextSteps: [
                    'Usa nuestro diario de bienestar regularmente',
                    'Practica técnicas de manejo del estrés',
                    'Considera buscar apoyo profesional'
                ]
            };
        }
    }

    getWellbeingResult(score) {
        if (score >= 45) {
            return {
                level: 'Excelente',
                description: 'Tu nivel de bienestar es excelente. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#BFCECB',
                icon: '🌟',
                nextSteps: [
                    'Continúa con tus rutinas de bienestar',
                    'Comparte tus técnicas con otros',
                    'Mantén un diario de gratitud'
                ]
            };
        } else if (score >= 30) {
            return {
                level: 'Bueno',
                description: 'Tu nivel de bienestar es bueno. Hay algunas áreas que puedes mejorar.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar para identificar áreas de mejora.',
                color: '#C1D2DB',
                icon: '😊',
                nextSteps: [
                    'Usa nuestro diario de bienestar',
                    'Identifica áreas de mejora',
                    'Practica actividades que te gusten'
                ]
            };
        } else if (score >= 15) {
            return {
                level: 'Regular',
                description: 'Tu nivel de bienestar es regular. Hay varias áreas que puedes mejorar.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para mejorar tu bienestar.',
                color: '#E5C4B9',
                icon: '🌱',
                nextSteps: [
                    'Usa nuestro diario de bienestar regularmente',
                    'Practica ejercicios de bienestar',
                    'Considera buscar apoyo profesional'
                ]
            };
        } else {
            return {
                level: 'Bajo',
                description: 'Tu nivel de bienestar es bajo. Considera buscar ayuda profesional.',
                recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                color: '#868A8E',
                icon: '💙',
                nextSteps: [
                    'Busca ayuda profesional',
                    'Usa nuestro diario como complemento',
                    'Comienza con pequeños pasos'
                ]
            };
        }
    }

    getSelfesteemResult(score) {
        if (score <= 10) {
            return {
                level: 'Alta',
                description: 'Tu autoestima es alta. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#BFCECB',
                icon: '💪',
                nextSteps: [
                    'Continúa con tus rutinas de bienestar',
                    'Ayuda a otros a mejorar su autoestima',
                    'Mantén un diario de logros'
                ]
            };
        } else if (score <= 20) {
            return {
                level: 'Media',
                description: 'Tu autoestima es media. Hay algunas áreas que puedes mejorar.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar para trabajar en tu autoestima.',
                color: '#C1D2DB',
                icon: '🌱',
                nextSteps: [
                    'Usa nuestro diario de bienestar',
                    'Practica afirmaciones positivas',
                    'Celebra tus logros pequeños'
                ]
            };
        } else {
            return {
                level: 'Baja',
                description: 'Tu autoestima es baja. Considera buscar ayuda profesional.',
                recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                color: '#E5C4B9',
                icon: '💙',
                nextSteps: [
                    'Busca ayuda profesional',
                    'Usa nuestro diario como complemento',
                    'Practica autocompasión'
                ]
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
                        <h3 style="color: ${result.color}">
                            ${result.icon ? result.icon + ' ' : ''}${result.level}
                        </h3>
                        <p>${result.description}</p>
                        <div class="recommendation">
                            <h4>Recomendación:</h4>
                            <p>${result.recommendation}</p>
                        </div>
                        ${result.nextSteps ? `
                        <div class="next-steps">
                            <h4>Próximos pasos:</h4>
                            <ul class="steps-list">
                                ${result.nextSteps.map(step => `<li>${step}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
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
            .next-steps {
                margin-top: 1.5rem;
                padding: 1rem;
                background: var(--bg-secondary);
                border-radius: 8px;
                border-left: 4px solid ${result.color};
            }
            .next-steps h4 {
                margin: 0 0 0.5rem 0;
                color: ${result.color};
                font-size: 1rem;
            }
            .steps-list {
                margin: 0;
                padding-left: 1.5rem;
                list-style: none;
            }
            .steps-list li {
                position: relative;
                margin-bottom: 0.5rem;
                padding-left: 1rem;
                color: var(--text-secondary);
            }
            .steps-list li:before {
                content: "•";
                position: absolute;
                left: 0;
                color: ${result.color};
                font-weight: bold;
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

    showTestInfo(testType) {
        console.log(`ℹ️ Mostrando información del test: ${testType}`);
        
        const testInfo = {
            'gad7': {
                name: 'Test GAD-7',
                description: 'Escala de Ansiedad Generalizada',
                details: 'El GAD-7 es una herramienta de screening de 7 ítems para identificar ansiedad generalizada.',
                duration: '5-10 minutos',
                questions: 7,
                validation: 'Validado científicamente con sensibilidad del 89% y especificidad del 82%'
            },
            'phq9': {
                name: 'Test PHQ-9',
                description: 'Cuestionario de Salud del Paciente',
                details: 'El PHQ-9 es un instrumento de 9 ítems para evaluar síntomas de depresión basado en criterios del DSM-5.',
                duration: '5-10 minutos',
                questions: 9,
                validation: 'Estándar clínico con sensibilidad del 88% y especificidad del 88%'
            },
            'pss': {
                name: 'Test PSS',
                description: 'Escala de Estrés Percibido',
                details: 'La Escala de Estrés Percibido evalúa el grado en que las situaciones de la vida se perciben como estresantes.',
                duration: '3-5 minutos',
                questions: 10,
                validation: 'Validado internacionalmente con sensibilidad del 82% y especificidad del 75%'
            }
        };

        const info = testInfo[testType];
        if (!info) {
            console.warn(`⚠️ Información no encontrada para el test: ${testType}`);
            return;
        }

        // Crear modal simple de información
        const modal = document.createElement('div');
        modal.className = 'test-info-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${info.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Descripción:</strong> ${info.description}</p>
                    <p>${info.details}</p>
                    <p><strong>Duración:</strong> ${info.duration}</p>
                    <p><strong>Preguntas:</strong> ${info.questions}</p>
                    <p><strong>Validación:</strong> ${info.validation}</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary start-test-from-info" data-test="${testType}">
                            Comenzar Test
                        </button>
                        <button class="btn btn-outline close-modal">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Añadir estilos básicos
        const style = document.createElement('style');
        style.textContent = `
            .test-info-modal {
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
                padding: 1rem;
            }
            .test-info-modal .modal-content {
                background: var(--bg-primary);
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 100%;
                box-shadow: var(--shadow-2xl);
            }
            .test-info-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid var(--border-color);
            }
            .test-info-modal .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
                justify-content: flex-end;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                cursor: pointer;
                border: none;
            }
            .btn-primary {
                background: var(--primary);
                color: var(--text-inverse);
            }
            .btn-outline {
                background: transparent;
                color: var(--primary);
                border: 2px solid var(--primary);
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Event listeners
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
                style.remove();
            });
        });

        modal.querySelector('.start-test-from-info').addEventListener('click', () => {
            modal.remove();
            style.remove();
            this.startTest(testType);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    filterTests(filter) {
        console.log(`🔍 Filtrando tests por: ${filter}`);
        
        // Actualizar botones de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filtrar tarjetas de test
        const testCards = document.querySelectorAll('.test-card');
        testCards.forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    searchTests(query) {
        console.log(`🔍 Buscando: ${query}`);
        
        const testCards = document.querySelectorAll('.test-card');
        const searchQuery = query.toLowerCase().trim();
        
        if (searchQuery === '') {
            testCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }
        
        testCards.forEach(card => {
            const title = card.querySelector('.test-title')?.textContent.toLowerCase() || '';
            const description = card.querySelector('.test-description')?.textContent.toLowerCase() || '';
            const category = card.dataset.category || '';
            
            const matches = title.includes(searchQuery) || 
                          description.includes(searchQuery) || 
                          category.includes(searchQuery);
            
            card.style.display = matches ? 'block' : 'none';
        });
        
        // Mostrar/ocultar botón de limpiar
        const clearBtn = document.querySelector('.clear-search');
        if (clearBtn) {
            clearBtn.style.display = searchQuery ? 'block' : 'none';
        }
    }

    clearSearch() {
        const searchInput = document.getElementById('test-search');
        if (searchInput) {
            searchInput.value = '';
            this.searchTests('');
        }
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

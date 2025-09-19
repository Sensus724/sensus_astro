/*
 * Sensus - Test Page Interactions
 * JavaScript específico para la página de test
 */

class TestPageInteractions {
    constructor() {
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

        // Botones de respuesta
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
    }

    initializeTest() {
        // Configurar tests disponibles
        this.availableTests = this.getAvailableTests();
        this.renderTestSelection();
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
            },
            {
                id: 'wellbeing',
                name: 'Bienestar General',
                description: 'Evaluación del Bienestar Mental',
                duration: '10-15 minutos',
                questions: 12,
                icon: '😊',
                color: '#4ade80',
                category: 'bienestar'
            }
        ];
    }

    renderTestSelection() {
        const testContainer = document.getElementById('test-selection-container');
        if (!testContainer) return;

        testContainer.innerHTML = '';

        this.availableTests.forEach(test => {
            const testElement = this.createTestElement(test);
            testContainer.appendChild(testElement);
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
                <div class="test-detail">
                    <span class="detail-label">Categoría:</span>
                    <span class="detail-value">${test.category}</span>
                </div>
            </div>

            <div class="test-actions">
                <button class="btn btn-outline test-info-btn" data-test-id="${test.id}">
                    Ver Información
                </button>
                <button class="btn btn-primary start-test-btn" data-test-type="${test.id}">
                    Comenzar Test
                </button>
            </div>
        `;

        return testDiv;
    }

    startTest(testType) {
        this.currentTest = this.availableTests.find(t => t.id === testType);
        if (!this.currentTest) return;

        // Ocultar selección de tests
        const testSelection = document.getElementById('test-selection-container');
        if (testSelection) {
            testSelection.style.display = 'none';
        }

        // Mostrar área de test
        const testArea = document.getElementById('test-area');
        if (testArea) {
            testArea.style.display = 'block';
        }

        // Configurar test
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getTestQuestions(testType);
        this.totalQuestions = this.questions.length;

        // Mostrar primera pregunta
        this.showQuestion(0);
        this.updateProgress();

        // Actualizar título
        const testTitle = document.getElementById('test-title');
        if (testTitle) {
            testTitle.textContent = this.currentTest.name;
        }
    }

    getTestQuestions(testType) {
        const questions = {
            gad7: [
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
            ],
            phq9: [
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
            ],
            stress: [
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
            ],
            wellbeing: [
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
            ],
            selfesteem: [
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
            ]
        };

        return questions[testType] || questions.gad7;
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
        const testType = this.currentTest.id;
        
        if (testType === 'gad7') {
            if (score <= 4) {
                return {
                    level: 'Mínima',
                    description: 'Tu nivel de ansiedad es mínimo.',
                    recommendation: 'Continúa con tus hábitos saludables.',
                    color: '#4ade80'
                };
            } else if (score <= 9) {
                return {
                    level: 'Leve',
                    description: 'Tienes síntomas leves de ansiedad.',
                    recommendation: 'Te recomendamos usar nuestro diario de bienestar.',
                    color: '#fbbf24'
                };
            } else if (score <= 14) {
                return {
                    level: 'Moderada',
                    description: 'Tienes síntomas moderados de ansiedad.',
                    recommendation: 'Usa regularmente nuestro diario con ejercicios específicos.',
                    color: '#f97316'
                };
            } else {
                return {
                    level: 'Severa',
                    description: 'Tienes síntomas severos de ansiedad.',
                    recommendation: 'Consulta con un profesional de salud mental.',
                    color: '#ef4444'
                };
            }
        }
        
        // Resultados por defecto para otros tests
        return {
            level: 'Completado',
            description: 'Has completado el test exitosamente.',
            recommendation: 'Revisa tus resultados y considera usar nuestro diario.',
            color: '#3b82f6'
        };
    }

    showResults(score, result) {
        // Crear modal de resultados
        const modal = document.createElement('div');
        modal.className = 'test-results-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Resultados del Test</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="test-info">
                        <h3>${this.currentTest.name}</h3>
                        <p>${this.currentTest.description}</p>
                    </div>
                    
                    <div class="score-display">
                        <div class="score-number" style="color: ${result.color}">${score}</div>
                        <div class="score-label">Puntuación Total</div>
                    </div>
                    
                    <div class="result-info">
                        <h3 style="color: ${result.color}">${result.level}</h3>
                        <p>${result.description}</p>
                        <div class="recommendation">
                            <h4>Recomendación:</h4>
                            <p>${result.recommendation}</p>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.location.href='/diario'">
                            Ir al Diario
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='/'">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal (similares a los anteriores)
        const style = document.createElement('style');
        style.textContent = `
            .test-results-modal {
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
            .test-info {
                text-align: center;
                margin-bottom: 2rem;
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
                justify-content: center;
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    saveTestResults(score, result) {
        const testData = {
            testType: this.currentTest.id,
            testName: this.currentTest.name,
            score: score,
            result: result,
            answers: this.answers,
            timestamp: new Date().toISOString()
        };

        // Guardar en localStorage
        const savedTests = JSON.parse(localStorage.getItem('testResults') || '[]');
        savedTests.push(testData);
        localStorage.setItem('testResults', JSON.stringify(savedTests));

        // Enviar a analytics si está disponible
        if (typeof gtag !== 'undefined') {
            gtag('event', 'test_completed', {
                'test_type': this.currentTest.id,
                'score': score,
                'result_level': result.level
            });
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('test') || window.location.pathname.includes('/test')) {
        window.testPageInteractions = new TestPageInteractions();
    }
});

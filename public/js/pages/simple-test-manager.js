/*
 * Simple Test Manager
 * Sistema simplificado para el test de ansiedad GAD-7
 */

class SimpleTestManager {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.testContainer = null;
        this.init();
    }

    init() {
        console.log('🧠 Inicializando Simple Test Manager...');
        // Verificar si hay un parámetro de test en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const testParam = urlParams.get('test');
        
        if (testParam === 'gad7') {
            this.startTest();
        }
        
        // Configurar event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Escuchar clicks en botones
        document.addEventListener('click', (e) => {
            // Botón de inicio de test
            if (e.target.matches('[data-test="gad7"]') || e.target.closest('[data-test="gad7"]')) {
                e.preventDefault();
                this.startTest();
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
            
            // Botón para volver a la página principal
            if (e.target.matches('#home-btn') || e.target.closest('#home-btn')) {
                window.location.href = '/';
            }
            
            // Botón para repetir el test
            if (e.target.matches('#retake-btn') || e.target.closest('#retake-btn')) {
                this.startTest();
            }
        });
    }

    startTest() {
        console.log('Iniciando test de ansiedad GAD-7');
        this.currentQuestion = 0;
        this.answers = {};
        
        // Ocultar secciones de la página
        this.hidePageSections();
        
        // Crear contenedor del test
        this.testContainer = this.createTestContainer();
        document.body.appendChild(this.testContainer);
        
        // Mostrar la primera pregunta
        this.showQuestion();
        
        // Añadir estilos
        this.addTestStyles();
    }

    hidePageSections() {
        console.log('Ocultando secciones de la página...');
        const sections = document.querySelectorAll('section:not(.test-container)');
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
    }

    createTestContainer() {
        console.log('Creando contenedor del test...');
        const container = document.createElement('section');
        container.className = 'test-container';
        container.innerHTML = this.getTestHTML();
        return container;
    }

    getTestHTML() {
        return `
            <div class="test-header">
                <h2>Test de Ansiedad (GAD-7)</h2>
                <div class="progress-container">
                    <div class="progress-bar" id="progress-bar"></div>
                </div>
                <p class="progress-text" id="progress-text">Pregunta 1 de 7</p>
            </div>
            <div class="question-container" id="question-container"></div>
            <div class="navigation-buttons">
                <button id="prev-btn" class="nav-btn">Anterior</button>
                <button id="next-btn" class="nav-btn">Siguiente</button>
                <button id="submit-btn" class="nav-btn submit-btn">Finalizar</button>
            </div>
        `;
    }

    getQuestions() {
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
                question: "¿Con qué frecuencia has tenido dificultad para relajarte durante las últimas 2 semanas?",
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
                question: "¿Con qué frecuencia te has sentido fácilmente molesto o irritable durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia has sentido miedo, como si algo terrible pudiera pasar durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            }
        ];
    }

    showQuestion() {
        console.log('Mostrando pregunta:', this.currentQuestion);
        const questionContainer = document.getElementById('question-container');
        const questions = this.getQuestions();
        const currentQ = questions[this.currentQuestion];
        
        let optionsHTML = '';
        currentQ.options.forEach(option => {
            const isSelected = this.answers[this.currentQuestion] === option.value;
            const selectedClass = isSelected ? 'selected' : '';
            optionsHTML += `
                <button class="answer-btn ${selectedClass}" data-value="${option.value}">
                    ${option.text}
                </button>
            `;
        });
        
        questionContainer.innerHTML = `
            <h3 class="question-text">${currentQ.question}</h3>
            <div class="options-container">
                ${optionsHTML}
            </div>
        `;
        
        this.updateNavigationButtons();
        this.updateProgress();
    }

    selectAnswer(value) {
        this.answers[this.currentQuestion] = value;
        
        // Actualizar UI para mostrar la selección
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.value) === value) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
        
        this.updateNavigationButtons();
    }

    nextQuestion() {
        const questions = this.getQuestions();
        if (this.currentQuestion < questions.length - 1) {
            this.currentQuestion++;
            this.showQuestion();
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    }

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const questions = this.getQuestions();
        
        const progress = ((this.currentQuestion + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Pregunta ${this.currentQuestion + 1} de ${questions.length}`;
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        const questions = this.getQuestions();
        
        // Botón anterior
        prevBtn.style.display = this.currentQuestion > 0 ? 'block' : 'none';
        
        // Botón siguiente y finalizar
        if (this.currentQuestion < questions.length - 1) {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        }
        
        // Habilitar/deshabilitar botón siguiente según si hay respuesta
        nextBtn.disabled = this.answers[this.currentQuestion] === undefined;
        
        // Habilitar/deshabilitar botón finalizar según si todas las preguntas están respondidas
        submitBtn.disabled = !this.checkAllAnswered();
    }

    checkAllAnswered() {
        const questions = this.getQuestions();
        for (let i = 0; i < questions.length; i++) {
            if (this.answers[i] === undefined) {
                return false;
            }
        }
        return true;
    }

    submitTest() {
        if (!this.checkAllAnswered()) {
            alert('Por favor, responde todas las preguntas antes de finalizar.');
            return;
        }
        
        const score = this.calculateScore();
        this.showResults(score);
    }

    calculateScore() {
        let total = 0;
        for (const questionIndex in this.answers) {
            total += this.answers[questionIndex];
        }
        return total;
    }

    showResults(score) {
        let resultText = '';
        let resultClass = '';
        
        if (score >= 0 && score <= 4) {
            resultText = 'Ansiedad mínima';
            resultClass = 'result-minimal';
        } else if (score >= 5 && score <= 9) {
            resultText = 'Ansiedad leve';
            resultClass = 'result-mild';
        } else if (score >= 10 && score <= 14) {
            resultText = 'Ansiedad moderada';
            resultClass = 'result-moderate';
        } else {
            resultText = 'Ansiedad severa';
            resultClass = 'result-severe';
        }
        
        const resultHTML = `
            <div class="test-results">
                <h2>Resultados del Test de Ansiedad (GAD-7)</h2>
                <div class="score-container ${resultClass}">
                    <div class="score">${score}</div>
                    <div class="score-label">${resultText}</div>
                </div>
                <div class="result-description">
                    <p>Tu puntuación total es <strong>${score}</strong> de un máximo de 21, lo que indica un nivel de <strong>${resultText}</strong>.</p>
                    <p>Este test es una herramienta de evaluación y no sustituye el diagnóstico profesional. Si te preocupan tus resultados, te recomendamos consultar con un profesional de la salud mental.</p>
                </div>
                <div class="result-actions">
                    <button id="home-btn" class="action-btn">Volver al inicio</button>
                    <button id="retake-btn" class="action-btn">Repetir test</button>
                </div>
            </div>
        `;
        
        this.testContainer.innerHTML = resultHTML;
    }

    addTestStyles() {
        // Verificar si ya existe el estilo
        if (document.getElementById('test-styles')) return;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'test-styles';
        styleElement.textContent = `
            .test-container {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background-color: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .test-header {
                text-align: center;
                margin-bottom: 2rem;
            }
            
            .progress-container {
                width: 100%;
                height: 8px;
                background-color: #e2e8f0;
                border-radius: 4px;
                margin: 1rem 0;
                overflow: hidden;
            }
            
            .progress-bar {
                height: 100%;
                background-color: #3b82f6;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                font-size: 0.9rem;
                color: #64748b;
            }
            
            .question-container {
                margin-bottom: 2rem;
            }
            
            .question-text {
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
                color: #1e293b;
            }
            
            .options-container {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            
            .answer-btn {
                padding: 1rem;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                background-color: #f8fafc;
                text-align: left;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .answer-btn:hover {
                background-color: #f1f5f9;
                border-color: #94a3b8;
            }
            
            .answer-btn.selected {
                background-color: #dbeafe;
                border-color: #3b82f6;
                color: #1e40af;
            }
            
            .navigation-buttons {
                display: flex;
                justify-content: space-between;
                margin-top: 2rem;
            }
            
            .nav-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                background-color: #3b82f6;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .nav-btn:hover {
                background-color: #2563eb;
            }
            
            .nav-btn:disabled {
                background-color: #cbd5e1;
                cursor: not-allowed;
            }
            
            .submit-btn {
                background-color: #10b981;
            }
            
            .submit-btn:hover {
                background-color: #059669;
            }
            
            .test-results {
                text-align: center;
            }
            
            .score-container {
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                margin: 2rem 0;
                padding: 1.5rem;
                border-radius: 50%;
                width: 150px;
                height: 150px;
                justify-content: center;
            }
            
            .result-minimal {
                background-color: #bbf7d0;
                color: #166534;
            }
            
            .result-mild {
                background-color: #fef08a;
                color: #854d0e;
            }
            
            .result-moderate {
                background-color: #fed7aa;
                color: #9a3412;
            }
            
            .result-severe {
                background-color: #fecaca;
                color: #991b1b;
            }
            
            .score {
                font-size: 3rem;
                font-weight: bold;
                line-height: 1;
            }
            
            .score-label {
                font-size: 1.2rem;
                font-weight: 500;
                margin-top: 0.5rem;
            }
            
            .result-description {
                margin: 2rem 0;
                text-align: left;
            }
            
            .result-actions {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-top: 2rem;
            }
            
            .action-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                background-color: #3b82f6;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }
            
            .action-btn:hover {
                background-color: #2563eb;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SimpleTestManager();
});

export default SimpleTestManager;
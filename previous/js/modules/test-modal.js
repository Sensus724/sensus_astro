// Módulo para manejar el modal de test
// Gestiona la apertura, navegación y cierre del modal de evaluación

class TestModal {
    constructor() {
        this.modal = document.getElementById('test-modal');
        this.testForm = document.getElementById('test-form');
        this.questionsContainer = document.getElementById('questions-container');
        this.testResult = document.getElementById('test-result');
        this.currentTest = null;
        this.currentQuestion = 0;
        this.answers = [];
        this.totalQuestions = 0;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Cerrar modal
        const closeBtn = document.getElementById('close-test-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        // Cerrar modal al hacer clic fuera
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Navegación de preguntas
        const nextBtn = document.getElementById('next-question');
        const prevBtn = document.getElementById('prev-question');
        const finishBtn = document.getElementById('finish-test');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevQuestion());
        }
        
        if (finishBtn) {
            finishBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.finishTest();
            });
        }
        
        // Acciones del resultado
        const saveResultBtn = document.getElementById('save-result');
        const retakeTestBtn = document.getElementById('retake-test');
        const closeResultBtn = document.getElementById('close-test-result');
        
        if (saveResultBtn) {
            saveResultBtn.addEventListener('click', () => this.saveResult());
        }
        
        if (retakeTestBtn) {
            retakeTestBtn.addEventListener('click', () => this.retakeTest());
        }
        
        if (closeResultBtn) {
            closeResultBtn.addEventListener('click', () => this.close());
        }
    }
    
    open(testId) {
        if (typeof getTestQuestions === 'undefined') {
            console.error('getTestQuestions no está disponible');
            return;
        }
        
        const testData = getTestQuestions(testId);
        if (!testData) {
            console.error('Test no encontrado:', testId);
            return;
        }
        
        this.currentTest = testData;
        this.currentQuestion = 0;
        this.answers = [];
        this.totalQuestions = testData.questions.length;
        
        this.loadTest();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetTest();
    }
    
    loadTest() {
        // Actualizar header
        document.getElementById('test-title').textContent = this.currentTest.title;
        document.getElementById('test-description').textContent = this.currentTest.description;
        
        // Limpiar contenedor de preguntas
        this.questionsContainer.innerHTML = '';
        
        // Crear preguntas
        this.currentTest.questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-container';
            questionDiv.id = `question-${index}`;
            
            questionDiv.innerHTML = `
                <h3>${question.question}</h3>
                <div class="options-container">
                    ${question.options.map((option, optionIndex) => `
                        <div class="option-card" data-value="${option.value}">
                            <input type="radio" 
                                   id="q${index}_option${optionIndex}" 
                                   name="question_${index}" 
                                   value="${option.value}">
                            <label for="q${index}_option${optionIndex}">${option.text}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            this.questionsContainer.appendChild(questionDiv);
        });
        
        // Mostrar primera pregunta
        this.showQuestion(0);
        
        // Actualizar progreso
        this.updateProgress();
        
        // Ocultar resultado
        this.testResult.style.display = 'none';
    }
    
    showQuestion(questionIndex) {
        // Ocultar todas las preguntas
        const questions = this.questionsContainer.querySelectorAll('.question-container');
        questions.forEach(q => q.classList.remove('active'));
        
        // Mostrar pregunta actual
        const currentQuestion = document.getElementById(`question-${questionIndex}`);
        if (currentQuestion) {
            currentQuestion.classList.add('active');
        }
        
        // Actualizar botones de navegación
        this.updateNavigationButtons();
        
        // Bind events para opciones
        this.bindOptionEvents(questionIndex);
    }
    
    bindOptionEvents(questionIndex) {
        const optionCards = document.querySelectorAll(`#question-${questionIndex} .option-card`);
        
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                // Deseleccionar otras opciones
                const otherCards = document.querySelectorAll(`#question-${questionIndex} .option-card`);
                otherCards.forEach(c => c.classList.remove('selected'));
                
                // Seleccionar opción actual
                card.classList.add('selected');
                
                // Marcar radio button
                const radio = card.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Guardar respuesta
                this.answers[questionIndex] = {
                    questionId: this.currentTest.questions[questionIndex].id,
                    value: parseInt(radio.value)
                };
                
                // Actualizar progreso
                this.updateProgress();
            });
        });
    }
    
    updateProgress() {
        const answeredQuestions = this.answers.filter(a => a !== undefined).length;
        const progress = (answeredQuestions / this.totalQuestions) * 100;
        
        document.getElementById('test-progress-fill').style.width = `${progress}%`;
        document.getElementById('test-progress-text').textContent = 
            `Pregunta ${answeredQuestions + 1} de ${this.totalQuestions}`;
    }
    
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const finishBtn = document.getElementById('finish-test');
        
        // Botón anterior
        if (this.currentQuestion === 0) {
            prevBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'inline-block';
        }
        
        // Botón siguiente/finalizar
        if (this.currentQuestion === this.totalQuestions - 1) {
            nextBtn.style.display = 'none';
            finishBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            finishBtn.style.display = 'none';
        }
    }
    
    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        }
    }
    
    prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    }
    
    finishTest() {
        // Verificar que todas las preguntas estén respondidas
        const answeredQuestions = this.answers.filter(a => a !== undefined).length;
        if (answeredQuestions < this.totalQuestions) {
            alert('Por favor, responde todas las preguntas antes de finalizar el test.');
            return;
        }
        
        // Calcular resultado
        if (typeof calculateTestResult === 'undefined') {
            console.error('calculateTestResult no está disponible');
            return;
        }
        
        const result = calculateTestResult(this.currentTest.title.toLowerCase().replace(/\s+/g, ''), this.answers);
        this.showResult(result);
    }
    
    showResult(result) {
        // Ocultar formulario
        this.testForm.style.display = 'none';
        
        // Mostrar resultado
        this.testResult.style.display = 'block';
        
        // Determinar nivel y recomendación
        let level, levelClass, recommendation;
        
        if (this.currentTest.title.includes('GAD-7')) {
            if (result.score <= 4) {
                level = 'Mínima';
                levelClass = 'mild';
                recommendation = 'Tu nivel de ansiedad es mínimo. Continúa monitoreando tus emociones y practica técnicas de autocuidado regularmente.';
            } else if (result.score <= 9) {
                level = 'Leve';
                levelClass = 'mild';
                recommendation = 'Presentas síntomas de ansiedad leve. Te recomendamos implementar técnicas de relajación y mindfulness en tu rutina diaria.';
            } else if (result.score <= 14) {
                level = 'Moderada';
                levelClass = 'moderate';
                recommendation = 'Presentas síntomas de ansiedad moderada. Considera consultar con un profesional de la salud mental para recibir orientación adicional.';
            } else {
                level = 'Severa';
                levelClass = 'severe';
                recommendation = 'Presentas síntomas de ansiedad severa. Te recomendamos buscar ayuda profesional lo antes posible para recibir el apoyo adecuado.';
            }
        } else {
            // Para otros tests, usar porcentaje
            if (result.percentage <= 25) {
                level = 'Bajo';
                levelClass = 'mild';
                recommendation = 'Tu nivel es bajo. Continúa manteniendo hábitos saludables.';
            } else if (result.percentage <= 50) {
                level = 'Moderado';
                levelClass = 'moderate';
                recommendation = 'Tu nivel es moderado. Considera implementar estrategias de manejo.';
            } else if (result.percentage <= 75) {
                level = 'Alto';
                levelClass = 'severe';
                recommendation = 'Tu nivel es alto. Te recomendamos buscar apoyo profesional.';
            } else {
                level = 'Muy Alto';
                levelClass = 'severe';
                recommendation = 'Tu nivel es muy alto. Es importante que busques ayuda profesional inmediatamente.';
            }
        }
        
        // Actualizar contenido del resultado
        document.getElementById('result-content').innerHTML = `
            <div class="result-score">${result.score}</div>
            <div class="result-level ${levelClass}">Nivel: ${level}</div>
            <div class="result-description">${recommendation}</div>
        `;
        
        // Scroll al resultado
        this.testResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    saveResult() {
        // Aquí se implementaría la lógica para guardar el resultado
        alert('Resultado guardado correctamente.');
    }
    
    retakeTest() {
        // Reiniciar test
        this.currentQuestion = 0;
        this.answers = [];
        this.loadTest();
        this.testForm.style.display = 'block';
        this.testResult.style.display = 'none';
    }
    
    resetTest() {
        this.currentTest = null;
        this.currentQuestion = 0;
        this.answers = [];
        this.totalQuestions = 0;
    }
}

// Inicializar modal de test cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.testModal = new TestModal();
    
    // Bind events para botones de comenzar test
    const startTestButtons = document.querySelectorAll('.start-test-btn');
    startTestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testId = this.getAttribute('data-test');
            if (window.testModal) {
                window.testModal.open(testId);
            }
        });
    });
});

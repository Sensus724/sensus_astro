/*
 * Test Manager - Part 2
 * Métodos adicionales para el sistema de gestión de tests
 */

import TestManager from './test-manager.js';

// Extender la clase TestManager con métodos adicionales
TestManager.prototype.filterTests = function(category) {
    const testCards = document.querySelectorAll('.test-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Actualizar botones de filtro
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filtrar tarjetas de test
    testCards.forEach(card => {
        if (category === 'todos' || card.dataset.category === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
};

TestManager.prototype.startTest = function(testId) {
    console.log('TestManager.startTest llamado con:', testId);
    if (!this.tests[testId]) {
        console.error(`Test ${testId} no encontrado`);
        return;
    }
    
    this.currentTest = testId;
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
};

TestManager.prototype.hidePageSections = function() {
    console.log('Ocultando secciones de la página...');
    const sections = document.querySelectorAll('section:not(.test-container)');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
};

TestManager.prototype.createTestContainer = function() {
    console.log('Creando contenedor del test...');
    const container = document.createElement('section');
    container.className = 'test-container';
    container.innerHTML = this.getTestHTML();
    return container;
};

TestManager.prototype.getTestHTML = function() {
    const testInfo = this.tests[this.currentTest].getInfo();
    
    return `
        <div class="test-header">
            <h2>${testInfo.name}</h2>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
            <p class="progress-text" id="progress-text">Pregunta 1 de ${testInfo.totalQuestions}</p>
        </div>
        <div class="question-container" id="question-container"></div>
        <div class="navigation-buttons">
            <button id="prev-btn" class="nav-btn">Anterior</button>
            <button id="next-btn" class="nav-btn">Siguiente</button>
            <button id="submit-btn" class="nav-btn submit-btn">Finalizar</button>
        </div>
    `;
};

TestManager.prototype.showQuestion = function() {
    console.log('Mostrando pregunta:', this.currentQuestion);
    const questionContainer = document.getElementById('question-container');
    const questions = this.tests[this.currentTest].getQuestions();
    const currentQ = questions[this.currentQuestion];
    
    console.log('Pregunta actual:', currentQ);
    
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
};

TestManager.prototype.selectAnswer = function(value) {
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
};

TestManager.prototype.nextQuestion = function() {
    const questions = this.tests[this.currentTest].getQuestions();
    if (this.currentQuestion < questions.length - 1) {
        this.currentQuestion++;
        this.showQuestion();
    }
};

TestManager.prototype.prevQuestion = function() {
    if (this.currentQuestion > 0) {
        this.currentQuestion--;
        this.showQuestion();
    }
};

// Inicializar el sistema de tests cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de evaluación
    if (document.body.classList.contains('evaluacion-page')) {
        // Importar la parte 3 para completar la implementación
        import('./test-manager-part3.js');
    }
});
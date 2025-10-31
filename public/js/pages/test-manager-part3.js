/*
 * Test Manager - Part 3
 * Métodos para finalizar tests y mostrar resultados
 */

import TestManager from './test-manager.js';

TestManager.prototype.updateProgress = function() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const questions = this.tests[this.currentTest].getQuestions();
    
    const progress = ((this.currentQuestion + 1) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Pregunta ${this.currentQuestion + 1} de ${questions.length}`;
};

TestManager.prototype.updateNavigationButtons = function() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const questions = this.tests[this.currentTest].getQuestions();
    
    // Botón anterior
    prevBtn.disabled = this.currentQuestion === 0;
    
    // Botón siguiente y finalizar
    if (this.currentQuestion === questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
        
        // Habilitar finalizar solo si todas las preguntas están respondidas
        const allAnswered = this.checkAllAnswered();
        submitBtn.disabled = !allAnswered;
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
};

TestManager.prototype.checkAllAnswered = function() {
    const questions = this.tests[this.currentTest].getQuestions();
    for (let i = 0; i < questions.length; i++) {
        if (this.answers[i] === undefined) {
            return false;
        }
    }
    return true;
};

TestManager.prototype.submitTest = function() {
    if (!this.checkAllAnswered()) {
        alert('Por favor responde todas las preguntas antes de finalizar.');
        return;
    }
    
    // Calcular puntuación
    const score = this.calculateScore();
    
    // Obtener resultado basado en la puntuación
    const result = this.tests[this.currentTest].getResult(score);
    
    // Guardar resultado
    this.saveTestResult(score, result);
    
    // Mostrar resultados
    this.showResults(score, result);
};

TestManager.prototype.calculateScore = function() {
    const questions = this.tests[this.currentTest].getQuestions();
    let totalScore = 0;
    
    for (let i = 0; i < questions.length; i++) {
        if (this.answers[i] !== undefined) {
            totalScore += this.answers[i];
        }
    }
    
    return totalScore;
};

// Importar la parte 4 para completar la implementación
import('./test-manager-part4.js');
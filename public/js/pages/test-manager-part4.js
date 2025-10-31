/*
 * Test Manager - Part 4
 * Métodos finales y estilos para el sistema de gestión de tests
 */

import TestManager from './test-manager.js';

TestManager.prototype.saveTestResult = function(score, result) {
    const testInfo = this.tests[this.currentTest].getInfo();
    const testResult = {
        testId: this.currentTest,
        testName: testInfo.name,
        score: score,
        level: result.level,
        date: new Date().toISOString()
    };
    
    // Guardar en localStorage
    let testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    testResults.push(testResult);
    localStorage.setItem('testResults', JSON.stringify(testResults));
    
    // Actualizar indicadores de progreso del usuario
    this.updateUserProgress();
};

TestManager.prototype.updateUserProgress = function() {
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    // Actualizar contenedores de progreso
    document.querySelectorAll('.progress-container').forEach(container => {
        const testId = container.dataset.test;
        if (!testId) return;
        
        const testResult = testResults.find(r => r.testId === testId);
        if (testResult) {
            container.classList.add('completed');
            
            // Actualizar fecha del último test
            const dateElement = container.querySelector('.last-test-date');
            if (dateElement) {
                const date = new Date(testResult.date);
                dateElement.textContent = `Último: ${date.toLocaleDateString()}`;
            }
        }
    });
};

TestManager.prototype.showResults = function(score, result) {
    const testInfo = this.tests[this.currentTest].getInfo();
    
    // Crear contenedor de resultados
    const resultsHTML = `
        <div class="results-container">
            <h2>Resultados: ${testInfo.name}</h2>
            <div class="score-container" style="background-color: ${result.color}">
                <div class="score-icon">${result.icon}</div>
                <div class="score-value">${score}</div>
                <div class="score-level">${result.level}</div>
            </div>
            <div class="result-info">
                <h3>Interpretación</h3>
                <p>${result.description}</p>
                <h3>Recomendación</h3>
                <p>${result.recommendation}</p>
            </div>
            <div class="result-buttons">
                <button id="diary-btn" class="result-btn">Ir al diario de bienestar</button>
                <button id="home-btn" class="result-btn">Volver al inicio</button>
                <button id="retake-btn" class="result-btn">Repetir test</button>
            </div>
        </div>
    `;
    
    // Reemplazar contenido del test
    this.testContainer.innerHTML = resultsHTML;
};

// Importar la parte 5 para los estilos
import('./test-manager-part5.js');
/*
 * Test Manager - Part 5
 * Estilos para el sistema de gestión de tests
 */

import TestManager from './test-manager.js';

TestManager.prototype.addTestStyles = function() {
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
            line-height: 1.5;
        }
        
        .options-container {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        
        .answer-btn {
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background-color: #f8fafc;
            text-align: left;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .answer-btn:hover {
            background-color: #e2e8f0;
        }
        
        .answer-btn.selected {
            background-color: #3b82f6;
            color: white;
            border-color: #2563eb;
        }
        
        .navigation-buttons {
            display: flex;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .nav-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            background-color: #3b82f6;
            color: white;
            font-weight: 600;
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
        
        /* Estilos para resultados */
        .results-container {
            text-align: center;
        }
        
        .score-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 150px;
            height: 150px;
            margin: 2rem auto;
            border-radius: 50%;
            color: white;
            padding: 1rem;
        }
        
        .score-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }
        
        .score-value {
            font-size: 2.5rem;
            font-weight: bold;
            line-height: 1;
        }
        
        .score-level {
            font-size: 1.2rem;
            margin-top: 0.5rem;
        }
        
        .result-info {
            margin: 2rem 0;
            text-align: left;
        }
        
        .result-info h3 {
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
            color: #334155;
        }
        
        .result-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .result-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            background-color: #3b82f6;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .result-btn:hover {
            background-color: #2563eb;
        }
        
        #diary-btn {
            background-color: #10b981;
        }
        
        #diary-btn:hover {
            background-color: #059669;
        }
        
        #retake-btn {
            background-color: #f59e0b;
        }
        
        #retake-btn:hover {
            background-color: #d97706;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .test-container {
                margin: 1rem;
                padding: 1.5rem;
            }
            
            .navigation-buttons {
                flex-direction: column;
            }
            
            .result-buttons {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(styleElement);
};

// Inicializar el sistema de tests cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si estamos en la página de evaluación
    if (document.body.classList.contains('evaluacion-page')) {
        new TestManager();
    }
});
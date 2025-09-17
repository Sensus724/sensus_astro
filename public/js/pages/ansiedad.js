/*
 * Sensus - Ansiedad Page Interactions
 * JavaScript específico para la página de ansiedad
 */

class AnsiedadInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeContent();
    }

    setupEventListeners() {
        // Botones de ejercicios rápidos
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-exercise-btn')) {
                this.startQuickExercise(e.target.dataset.exercise);
            }
        });

        // Botones de información
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-btn')) {
                this.showInfo(e.target.dataset.info);
            }
        });

        // Botón de evaluación
        const evaluateBtn = document.getElementById('evaluate-anxiety');
        if (evaluateBtn) {
            evaluateBtn.addEventListener('click', () => {
                this.startAnxietyEvaluation();
            });
        }

        // Botón de diario
        const diaryBtn = document.getElementById('go-to-diary');
        if (diaryBtn) {
            diaryBtn.addEventListener('click', () => {
                window.location.href = '/diario';
            });
        }
    }

    initializeContent() {
        // Configurar ejercicios rápidos
        this.quickExercises = this.getQuickExercises();
        this.renderQuickExercises();
        
        // Configurar información sobre ansiedad
        this.anxietyInfo = this.getAnxietyInfo();
    }

    getQuickExercises() {
        return [
            {
                id: 'breathing',
                name: 'Respiración 4-7-8',
                description: 'Técnica rápida de respiración para calmar la ansiedad',
                duration: '2 minutos',
                icon: '🫁',
                color: '#4ade80'
            },
            {
                id: 'grounding',
                name: 'Grounding 5-4-3-2-1',
                description: 'Conecta con el presente usando tus sentidos',
                duration: '3 minutos',
                icon: '🌱',
                color: '#3b82f6'
            },
            {
                id: 'muscle-relaxation',
                name: 'Relajación Muscular',
                description: 'Tensa y relaja grupos musculares',
                duration: '5 minutos',
                icon: '💆',
                color: '#fbbf24'
            },
            {
                id: 'mindfulness',
                name: 'Mindfulness Rápido',
                description: 'Meditación breve para centrar la mente',
                duration: '4 minutos',
                icon: '🧘',
                color: '#d7cdf2'
            }
        ];
    }

    renderQuickExercises() {
        const exercisesContainer = document.getElementById('quick-exercises-container');
        if (!exercisesContainer) return;

        exercisesContainer.innerHTML = '';

        this.quickExercises.forEach(exercise => {
            const exerciseElement = this.createExerciseElement(exercise);
            exercisesContainer.appendChild(exerciseElement);
        });
    }

    createExerciseElement(exercise) {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'quick-exercise-card';
        exerciseDiv.dataset.exerciseId = exercise.id;

        exerciseDiv.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-icon" style="background: ${exercise.color}20; color: ${exercise.color}">
                    ${exercise.icon}
                </div>
                <div class="exercise-info">
                    <h3 class="exercise-name">${exercise.name}</h3>
                    <p class="exercise-description">${exercise.description}</p>
                </div>
            </div>
            
            <div class="exercise-details">
                <div class="exercise-duration">
                    <span class="duration-label">Duración:</span>
                    <span class="duration-value">${exercise.duration}</span>
                </div>
            </div>

            <div class="exercise-actions">
                <button class="btn btn-primary quick-exercise-btn" data-exercise="${exercise.id}">
                    Comenzar Ahora
                </button>
            </div>
        `;

        return exerciseDiv;
    }

    startQuickExercise(exerciseId) {
        const exercise = this.quickExercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        // Mostrar modal de ejercicio
        this.showExerciseModal(exercise);
    }

    showExerciseModal(exercise) {
        const modal = document.createElement('div');
        modal.className = 'exercise-modal';
        
        const exerciseContent = this.getExerciseContent(exercise.id);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${exercise.name}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="exercise-instructions">
                        <h3>Instrucciones:</h3>
                        <div class="instructions-content">
                            ${exerciseContent.instructions}
                        </div>
                    </div>
                    
                    <div class="exercise-timer" id="exercise-timer">
                        <div class="timer-display">${exerciseContent.duration}</div>
                        <div class="timer-controls">
                            <button class="btn btn-outline" id="start-timer">Iniciar</button>
                            <button class="btn btn-primary" id="complete-exercise">Completar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .exercise-modal {
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
            .exercise-instructions {
                margin-bottom: 2rem;
            }
            .exercise-instructions h3 {
                color: #1f2937;
                margin-bottom: 1rem;
            }
            .instructions-content {
                line-height: 1.6;
                color: #4b5563;
            }
            .exercise-timer {
                text-align: center;
                padding: 1.5rem;
                background: #f9fafb;
                border-radius: 0.5rem;
            }
            .timer-display {
                font-size: 2rem;
                font-weight: 700;
                color: #d7cdf2;
                margin-bottom: 1rem;
                font-family: 'Courier New', monospace;
            }
            .timer-controls {
                display: flex;
                gap: 1rem;
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

        // Event listeners del modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.querySelector('#start-timer').addEventListener('click', () => {
            this.startExerciseTimer(exerciseContent.duration);
        });

        modal.querySelector('#complete-exercise').addEventListener('click', () => {
            this.completeExercise(exercise);
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

    getExerciseContent(exerciseId) {
        const exercises = {
            breathing: {
                duration: '02:00',
                instructions: `
                    <ol>
                        <li>Siéntate cómodamente con la espalda recta</li>
                        <li>Coloca la punta de la lengua detrás de los dientes superiores</li>
                        <li>Exhala completamente por la boca</li>
                        <li>Inhala por la nariz contando hasta 4</li>
                        <li>Mantén la respiración contando hasta 7</li>
                        <li>Exhala por la boca contando hasta 8</li>
                        <li>Repite este ciclo durante 2 minutos</li>
                    </ol>
                    <p><strong>Consejo:</strong> Concéntrate en la cuenta y la sensación del aire.</p>
                `
            },
            grounding: {
                duration: '03:00',
                instructions: `
                    <ol>
                        <li>Mira a tu alrededor y nombra 5 cosas que puedes VER</li>
                        <li>Toca 4 cosas diferentes y nota su textura</li>
                        <li>Escucha y nombra 3 sonidos que puedes OÍR</li>
                        <li>Identifica 2 cosas que puedes OLER</li>
                        <li>Nombra 1 cosa que puedes SABOREAR</li>
                    </ol>
                    <p><strong>Consejo:</strong> Tómate tu tiempo con cada sentido.</p>
                `
            },
            'muscle-relaxation': {
                duration: '05:00',
                instructions: `
                    <ol>
                        <li>Siéntate o acuéstate cómodamente</li>
                        <li>Tensa los músculos de los pies por 5 segundos</li>
                        <li>Relaja completamente por 10 segundos</li>
                        <li>Sube gradualmente: pantorrillas, muslos, abdomen</li>
                        <li>Continúa con brazos, hombros, cuello</li>
                        <li>Termina con los músculos faciales</li>
                    </ol>
                    <p><strong>Consejo:</strong> Presta atención a la diferencia entre tensión y relajación.</p>
                `
            },
            mindfulness: {
                duration: '04:00',
                instructions: `
                    <ol>
                        <li>Cierra los ojos y siéntate cómodamente</li>
                        <li>Concéntrate en tu respiración natural</li>
                        <li>Cuando notes que tu mente divaga, regresa a la respiración</li>
                        <li>Observa tus pensamientos sin juzgarlos</li>
                        <li>Permite que las emociones fluyan</li>
                        <li>Mantén esta práctica durante 4 minutos</li>
                    </ol>
                    <p><strong>Consejo:</strong> Es normal que la mente divague. La práctica es regresar gentilmente.</p>
                `
            }
        };

        return exercises[exerciseId] || exercises.breathing;
    }

    startExerciseTimer(duration) {
        // Convertir duración a segundos
        const [minutes, seconds] = duration.split(':').map(Number);
        let totalSeconds = minutes * 60 + seconds;
        
        const timerDisplay = document.querySelector('.timer-display');
        const startBtn = document.getElementById('start-timer');
        
        startBtn.textContent = 'Ejecutando...';
        startBtn.disabled = true;
        
        const timer = setInterval(() => {
            const mins = Math.floor(totalSeconds / 60);
            const secs = totalSeconds % 60;
            timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            totalSeconds--;
            
            if (totalSeconds < 0) {
                clearInterval(timer);
                timerDisplay.textContent = '¡Completado!';
                startBtn.textContent = 'Reiniciar';
                startBtn.disabled = false;
            }
        }, 1000);
    }

    completeExercise(exercise) {
        // Mostrar mensaje de éxito
        this.showNotification(`¡Ejercicio "${exercise.name}" completado!`, 'success');
        
        // Guardar en historial
        this.saveExerciseHistory(exercise);
        
        // Sugerir ir al diario
        setTimeout(() => {
            this.suggestDiaryEntry();
        }, 2000);
    }

    saveExerciseHistory(exercise) {
        const exerciseData = {
            id: exercise.id,
            name: exercise.name,
            completedAt: new Date().toISOString(),
            duration: exercise.duration
        };

        const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
        history.unshift(exerciseData);
        
        // Mantener solo los últimos 50 ejercicios
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem('exerciseHistory', JSON.stringify(history));
    }

    suggestDiaryEntry() {
        const modal = document.createElement('div');
        modal.className = 'suggestion-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>¿Cómo te sientes?</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Has completado un ejercicio de relajación. ¿Te gustaría reflexionar sobre cómo te sientes ahora?</p>
                    
                    <div class="suggestion-actions">
                        <button class="btn btn-outline close-modal">No, gracias</button>
                        <button class="btn btn-primary" onclick="window.location.href='/diario'">
                            Ir al Diario
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .suggestion-modal {
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
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            .modal-header {
                margin-bottom: 1rem;
            }
            .suggestion-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
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

        // Event listeners
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

    getAnxietyInfo() {
        return {
            symptoms: [
                'Sensación de nerviosismo o inquietud',
                'Preocupación excesiva',
                'Dificultad para concentrarse',
                'Irritabilidad',
                'Tensión muscular',
                'Problemas para dormir',
                'Fatiga',
                'Sudoración',
                'Palpitaciones',
                'Dificultad para respirar'
            ],
            causes: [
                'Estrés laboral o académico',
                'Problemas familiares o de relación',
                'Cambios importantes en la vida',
                'Problemas de salud',
                'Traumas pasados',
                'Genética',
                'Uso de sustancias',
                'Condiciones médicas'
            ],
            treatments: [
                'Terapia cognitivo-conductual (TCC)',
                'Terapia de exposición',
                'Mindfulness y meditación',
                'Ejercicios de relajación',
                'Ejercicio físico regular',
                'Técnicas de respiración',
                'Mantener rutinas saludables',
                'Reducir cafeína y alcohol'
            ]
        };
    }

    showInfo(infoType) {
        const info = this.anxietyInfo[infoType];
        if (!info) return;

        const modal = document.createElement('div');
        modal.className = 'info-modal';
        
        const titles = {
            symptoms: 'Síntomas de Ansiedad',
            causes: 'Causas Comunes',
            treatments: 'Tratamientos Efectivos'
        };
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${titles[infoType]}</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <ul class="info-list">
                        ${info.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .info-modal {
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
            .info-list {
                list-style: none;
                padding: 0;
            }
            .info-list li {
                padding: 0.75rem 0;
                border-bottom: 1px solid #f3f4f6;
                position: relative;
                padding-left: 1.5rem;
            }
            .info-list li:before {
                content: "•";
                color: #d7cdf2;
                font-weight: bold;
                position: absolute;
                left: 0;
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

        // Event listeners
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

    startAnxietyEvaluation() {
        // Redirigir a la página de evaluación
        window.location.href = '/evaluacion';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('ansiedad') || window.location.pathname.includes('/ansiedad')) {
        window.ansiedadInteractions = new AnsiedadInteractions();
    }
});

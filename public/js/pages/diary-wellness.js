/*
 * Sensus - Diario de Bienestar
 * JavaScript completamente funcional para el diario con ejercicios de ansiedad
 * Incluye: ejercicios interactivos, reflexión, calendario, seguimiento de ansiedad, objetivos, recordatorios
 */

class DiaryWellness {
    constructor() {
        // Datos básicos del usuario
        this.currentStreak = 0;
        this.totalSessions = 0;
        this.bestStreak = 0;
        this.entries = this.loadEntries();
        this.currentExercise = null;
        this.exerciseTimer = null;
        this.timerInterval = null;
        this.currentMood = null;
        this.currentDate = new Date();
        
        // Plan personalizado y seguimiento de ansiedad
        this.anxietyLevels = this.loadAnxietyLevels();
        this.personalizedPlan = this.loadPersonalizedPlan();
        this.dailyActivities = this.loadDailyActivities();
        this.anxietyChart = null;
        
        // Sistema de etiquetas y organización
        this.tags = this.loadTags();
        this.availableTags = this.loadAvailableTags();
        this.selectedTags = [];
        
        // Objetivos y logros
        this.goals = this.loadGoals();
        this.achievements = this.loadAchievements();
        
        // Recordatorios inteligentes
        this.reminders = this.loadReminders();
        this.smartReminders = [];
        
        // Respaldo automático
        this.autoSaveInterval = null;
        this.lastSaveTime = null;
        
        // Calendario
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressSummary();
        this.generateCalendar();
        this.loadEntriesList();
        this.updateStreak();
        this.animateCounters();
        this.initializeAnxietyTracking();
        this.checkForPersonalizedPlan();
        this.initializeAnxietyChart();
        this.initializeQuickActions();
        this.initializeAchievements();
        this.initializeReminders();
        this.initializeAnalytics();
        this.initializeTags();
        this.initializeAutoSave();
        this.updateTagFilter();
        this.updateLastSaveTime();
        this.initializeAccessibility();
        this.initializeGoals();
        this.initializeSmartReminders();
        this.initializeAdvancedAnalytics();
        this.initializeMoodTracking();
        this.initializeExerciseModals();
        this.initializeCalendarNavigation();
        this.initializeReflectionSystem();
        this.initializeExportFunctions();
        this.initializeProgressTracking();
    }

    // === MÉTODOS DE CARGA DE DATOS ===
    loadEntries() {
        const saved = localStorage.getItem('diary-entries');
        return saved ? JSON.parse(saved) : [];
    }

    loadAnxietyLevels() {
        const saved = localStorage.getItem('anxiety-levels');
        return saved ? JSON.parse(saved) : [];
    }

    loadPersonalizedPlan() {
        const saved = localStorage.getItem('personalized-plan');
        return saved ? JSON.parse(saved) : null;
    }

    loadDailyActivities() {
        const saved = localStorage.getItem('daily-activities');
        return saved ? JSON.parse(saved) : {};
    }

    loadTags() {
        const saved = localStorage.getItem('diary-tags');
        return saved ? JSON.parse(saved) : [];
    }

    loadAvailableTags() {
        const saved = localStorage.getItem('available-tags');
        return saved ? JSON.parse(saved) : [
            'ansiedad', 'calma', 'ejercicio', 'meditación', 'trabajo', 'familia',
            'amigos', 'salud', 'sueño', 'alimentación', 'estrés', 'relajación',
            'gratitud', 'objetivos', 'progreso', 'reflexión', 'bienestar'
        ];
    }

    loadGoals() {
        const saved = localStorage.getItem('diary-goals');
        return saved ? JSON.parse(saved) : [];
    }

    loadAchievements() {
        const saved = localStorage.getItem('diary-achievements');
        return saved ? JSON.parse(saved) : this.getDefaultAchievements();
    }

    loadReminders() {
        const saved = localStorage.getItem('diary-reminders');
        return saved ? JSON.parse(saved) : {
            morning: { enabled: true, time: '08:00' },
            evening: { enabled: true, time: '20:00' },
            weekly: { enabled: false, time: '18:00' }
        };
    }

    getDefaultAchievements() {
        return [
            {
                id: 'first_entry',
                title: 'Primera Reflexión',
                description: 'Completa tu primera entrada en el diario',
                icon: 'fas fa-pen',
                unlocked: false,
                progress: 0,
                target: 1,
                category: 'reflection'
            },
            {
                id: 'week_streak',
                title: 'Semana Consistente',
                description: 'Mantén una racha de 7 días consecutivos',
                icon: 'fas fa-calendar-week',
                unlocked: false,
                progress: 0,
                target: 7,
                category: 'streak'
            },
            {
                id: 'exercise_master',
                title: 'Maestro del Ejercicio',
                description: 'Completa 50 ejercicios de bienestar',
                icon: 'fas fa-dumbbell',
                unlocked: false,
                progress: 0,
                target: 50,
                category: 'exercise'
            },
            {
                id: 'mood_tracker',
                title: 'Rastreador de Estados',
                description: 'Registra tu estado de ánimo por 30 días',
                icon: 'fas fa-heart',
                unlocked: false,
                progress: 0,
                target: 30,
                category: 'mood'
            }
        ];
    }

    // === MÉTODOS DE GUARDADO ===
    saveEntries() {
        localStorage.setItem('diary-entries', JSON.stringify(this.entries));
    }

    saveAnxietyLevels() {
        localStorage.setItem('anxiety-levels', JSON.stringify(this.anxietyLevels));
    }

    savePersonalizedPlan() {
        localStorage.setItem('personalized-plan', JSON.stringify(this.personalizedPlan));
    }

    saveDailyActivities() {
        localStorage.setItem('daily-activities', JSON.stringify(this.dailyActivities));
    }

    saveTags() {
        localStorage.setItem('diary-tags', JSON.stringify(this.tags));
    }

    saveAvailableTags() {
        localStorage.setItem('available-tags', JSON.stringify(this.availableTags));
    }

    saveGoals() {
        localStorage.setItem('diary-goals', JSON.stringify(this.goals));
    }

    saveAchievements() {
        localStorage.setItem('diary-achievements', JSON.stringify(this.achievements));
    }

    saveReminders() {
        localStorage.setItem('diary-reminders', JSON.stringify(this.reminders));
    }

    setupEventListeners() {
        // Ejercicios profesionales
        this.setupProfessionalExercises();
        
        // Ejercicios legacy (mantener compatibilidad)
        document.querySelectorAll('.start-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exercise = e.target.closest('.exercise-card-enhanced').dataset.exercise;
                this.startExercise(exercise);
            });
        });

        // Modal de ejercicio
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeExerciseModal();
        });

        document.getElementById('pause-timer').addEventListener('click', () => {
            this.toggleTimer();
        });

        document.getElementById('complete-exercise').addEventListener('click', () => {
            this.completeExercise();
        });

        // Estados de ánimo
        document.querySelectorAll('.mood-btn-enhanced').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(e.target.closest('.mood-btn-enhanced').dataset.mood);
            });
        });

        // Área de escritura
        const textarea = document.getElementById('reflection-text');
        if (textarea) {
        textarea.addEventListener('input', () => {
            this.updateCharacterCount();
            this.toggleSaveButton();
        });
        }

        // Botones de escritura
        const clearBtn = document.getElementById('clear-reflection');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
            this.clearReflection();
        });
        }

        const saveBtn = document.getElementById('save-reflection');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
            this.saveReflection();
        });
        }

        // Calendario
        document.getElementById('prev-month').addEventListener('click', () => {
            this.previousMonth();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.nextMonth();
        });

        // Seguimiento de ansiedad
        const anxietyScale = document.getElementById('anxiety-scale');
        if (anxietyScale) {
            anxietyScale.addEventListener('input', (e) => {
                this.updateAnxietyLevel(e.target.value);
            });
        }

        const saveAnxietyBtn = document.getElementById('save-anxiety-level');
        if (saveAnxietyBtn) {
            saveAnxietyBtn.addEventListener('click', () => {
                this.saveAnxietyLevel();
            });
        }
    }

    // === EJERCICIOS PROFESIONALES ===
    setupProfessionalExercises() {
        // Filtros de ejercicios
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterExercises(e.target.dataset.filter);
            });
        });

        // Botones de ejercicios profesionales - usar delegación de eventos
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-exercise-professional');
            if (btn) {
                console.log('Botón de ejercicio clickeado:', btn);
                const exerciseCard = btn.closest('.exercise-card-professional');
                if (exerciseCard) {
                    const exercise = exerciseCard.dataset.exercise;
                    console.log('Ejercicio seleccionado:', exercise);
                    this.startProfessionalExercise(exercise);
                }
            }
        });

        // Tooltips de información
        this.initializeTooltips();
    }

    filterExercises(filter) {
        const exerciseCards = document.querySelectorAll('.exercise-card-professional');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Actualizar botones de filtro
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Filtrar ejercicios
        exerciseCards.forEach(card => {
            const duration = card.dataset.duration;
            const evidence = card.dataset.evidence;
            let show = true;

            switch (filter) {
                case 'quick':
                    show = duration === 'quick';
                    break;
                case 'extended':
                    show = duration === 'extended';
                    break;
                case 'evidence':
                    show = evidence === 'high';
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }

            if (show) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease forwards';
            } else {
                card.style.display = 'none';
            }
        });

        // Animación de conteo
        setTimeout(() => {
            const visibleCards = document.querySelectorAll('.exercise-card-professional[style*="block"]');
            this.showNotification(`${visibleCards.length} ejercicios encontrados`, 'info');
        }, 500);
    }

    startProfessionalExercise(exerciseType) {
        console.log('Iniciando ejercicio profesional:', exerciseType);
        this.currentExercise = exerciseType;
        
        // Crear modal profesional si no existe
        this.createProfessionalModal();
        
        // Configurar ejercicio específico
        this.configureProfessionalExercise(exerciseType);
        
        // Mostrar modal
        const modal = document.getElementById('professional-exercise-modal');
        modal.classList.add('active');
        
        // Animar entrada
        setTimeout(() => {
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
            modal.querySelector('.modal-content').style.opacity = '1';
        }, 100);
    }

    createProfessionalModal() {
        // Verificar si ya existe
        if (document.getElementById('professional-exercise-modal')) {
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'professional-exercise-modal';
        modal.className = 'professional-exercise-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="exercise-header-info">
                        <div class="exercise-icon-modal" id="modal-exercise-icon">
                            <i class="fas fa-heart" aria-hidden="true"></i>
                        </div>
                        <div class="exercise-title-info">
                            <h2 id="modal-exercise-title">Ejercicio de Bienestar</h2>
                            <p id="modal-exercise-subtitle">Preparate para comenzar</p>
                        </div>
                    </div>
                    <button class="close-modal-btn" id="close-professional-modal">
                        <i class="fas fa-times" aria-hidden="true"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="exercise-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="exercise-progress-fill"></div>
                        </div>
                        <div class="progress-text">
                            <span id="exercise-progress-text">Preparando...</span>
                        </div>
                    </div>
                    
                    <div class="exercise-content" id="exercise-content">
                        <!-- Contenido dinámico del ejercicio -->
                    </div>
                    
                    <div class="exercise-controls">
                        <button class="control-btn secondary" id="pause-exercise">
                            <i class="fas fa-pause" aria-hidden="true"></i>
                            <span>Pausar</span>
                        </button>
                        <button class="control-btn primary" id="start-exercise-btn">
                            <i class="fas fa-play" aria-hidden="true"></i>
                            <span>Comenzar</span>
                        </button>
                        <button class="control-btn success" id="complete-exercise-btn" style="display: none;">
                            <i class="fas fa-check" aria-hidden="true"></i>
                            <span>Completar</span>
                        </button>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <div class="exercise-timer" id="exercise-timer-display">
                        <i class="fas fa-clock" aria-hidden="true"></i>
                        <span id="timer-text">00:00</span>
                    </div>
                    <div class="exercise-tips" id="exercise-tips">
                        <i class="fas fa-lightbulb" aria-hidden="true"></i>
                        <span id="tips-text">Consejos aparecerán aquí</span>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .professional-exercise-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .professional-exercise-modal.active {
                display: flex;
                opacity: 1;
            }
            
            .modal-content {
                background: white;
                border-radius: 2rem;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: scale(0.8);
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 2rem 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .exercise-header-info {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .exercise-icon-modal {
                width: 3rem;
                height: 3rem;
                border-radius: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.25rem;
                color: white;
            }
            
            .exercise-title-info h2 {
                margin: 0;
                font-size: 1.5rem;
                color: #1f2937;
            }
            
            .exercise-title-info p {
                margin: 0.25rem 0 0;
                color: #6b7280;
                font-size: 0.875rem;
            }
            
            .close-modal-btn {
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #6b7280;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 0.5rem;
                transition: all 0.3s ease;
            }
            
            .close-modal-btn:hover {
                background: #f3f4f6;
                color: #1f2937;
            }
            
            .modal-body {
                padding: 2rem;
            }
            
            .exercise-progress {
                margin-bottom: 2rem;
            }
            
            .progress-bar {
                width: 100%;
                height: 0.5rem;
                background: #e5e7eb;
                border-radius: 1rem;
                overflow: hidden;
                margin-bottom: 0.5rem;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #8b5cf6, #a78bfa);
                border-radius: 1rem;
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .progress-text {
                text-align: center;
                font-size: 0.875rem;
                color: #6b7280;
                font-weight: 500;
            }
            
            .exercise-content {
                margin-bottom: 2rem;
                min-height: 200px;
            }
            
            .exercise-controls {
                display: flex;
                gap: 1rem;
                justify-content: center;
                margin-bottom: 2rem;
            }
            
            .control-btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 1rem;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .control-btn.primary {
                background: linear-gradient(135deg, #8b5cf6, #a78bfa);
                color: white;
            }
            
            .control-btn.secondary {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .control-btn.success {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }
            
            .control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }
            
            .modal-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem 2rem;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 0 0 2rem 2rem;
            }
            
            .exercise-timer,
            .exercise-tips {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: #6b7280;
            }
            
            .exercise-timer i,
            .exercise-tips i {
                color: #8b5cf6;
            }
            
            @media (max-width: 768px) {
                .modal-content {
                    width: 95%;
                    margin: 1rem;
                }
                
                .modal-header,
                .modal-body,
                .modal-footer {
                    padding: 1.5rem;
                }
                
                .exercise-controls {
                    flex-direction: column;
                }
                
                .modal-footer {
                    flex-direction: column;
                    gap: 1rem;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Event listeners del modal
        this.setupProfessionalModalEvents();
    }

    setupProfessionalModalEvents() {
        const modal = document.getElementById('professional-exercise-modal');
        
        // Cerrar modal
        document.getElementById('close-professional-modal').addEventListener('click', () => {
            this.closeProfessionalModal();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProfessionalModal();
            }
        });

        // Controles de ejercicio
        document.getElementById('start-exercise-btn').addEventListener('click', () => {
            this.startProfessionalExerciseTimer();
        });

        document.getElementById('pause-exercise').addEventListener('click', () => {
            this.toggleProfessionalExercise();
        });

        document.getElementById('complete-exercise-btn').addEventListener('click', () => {
            this.completeProfessionalExercise();
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeProfessionalModal();
            }
        });
    }

    configureProfessionalExercise(exerciseType) {
        const exerciseData = this.getProfessionalExerciseData(exerciseType);
        const modal = document.getElementById('professional-exercise-modal');
        
        // Configurar header
        modal.querySelector('#modal-exercise-title').textContent = exerciseData.title;
        modal.querySelector('#modal-exercise-subtitle').textContent = exerciseData.subtitle;
        
        // Configurar icono
        const iconElement = modal.querySelector('#modal-exercise-icon');
        iconElement.className = `exercise-icon-modal ${exerciseType}`;
        iconElement.innerHTML = `<i class="${exerciseData.icon}" aria-hidden="true"></i>`;
        
        // Configurar contenido
        modal.querySelector('#exercise-content').innerHTML = exerciseData.content;
        
        // Configurar consejos
        modal.querySelector('#tips-text').textContent = exerciseData.tip;
        
        // Resetear progreso
        modal.querySelector('#exercise-progress-fill').style.width = '0%';
        modal.querySelector('#exercise-progress-text').textContent = 'Preparando...';
        modal.querySelector('#timer-text').textContent = '00:00';
        
        // Resetear controles
        document.getElementById('start-exercise-btn').style.display = 'flex';
        document.getElementById('complete-exercise-btn').style.display = 'none';
        document.getElementById('pause-exercise').style.display = 'flex';
    }

    getProfessionalExerciseData(exerciseType) {
        const exercises = {
            breathing: {
                title: 'Respiración Profunda',
                subtitle: 'Técnica 4-7-8 para calmar la ansiedad',
                icon: 'fas fa-lungs',
                duration: 300, // 5 minutos
                content: `
                    <div class="breathing-exercise">
                        <div class="breathing-visual">
                            <div class="breathing-circle" id="breathing-circle">
                                <div class="breathing-text" id="breathing-text">Preparate</div>
                            </div>
                        </div>
                        <div class="breathing-instructions">
                            <h3>Instrucciones:</h3>
                            <ol>
                                <li>Siéntate cómodamente con la espalda recta</li>
                                <li>Coloca la punta de la lengua detrás de los dientes superiores</li>
                                <li>Exhala completamente por la boca</li>
                                <li>Inhala por la nariz contando hasta 4</li>
                                <li>Mantén la respiración contando hasta 7</li>
                                <li>Exhala por la boca contando hasta 8</li>
                            </ol>
                        </div>
                    </div>
                `,
                tip: 'Concéntrate en la cuenta y la sensación del aire entrando y saliendo'
            },
            meditation: {
                title: 'Meditación Mindfulness',
                subtitle: 'Conecta con el presente',
                icon: 'fas fa-leaf',
                duration: 600, // 10 minutos
                content: `
                    <div class="meditation-exercise">
                        <div class="meditation-visual">
                            <div class="meditation-circle" id="meditation-circle">
                                <div class="meditation-text" id="meditation-text">Centra tu atención</div>
                            </div>
                        </div>
                        <div class="meditation-instructions">
                            <h3>Instrucciones:</h3>
                            <ol>
                                <li>Encuentra una posición cómoda, sentado o acostado</li>
                                <li>Cierra los ojos suavemente</li>
                                <li>Enfócate en tu respiración natural</li>
                                <li>Cuando notes que tu mente divaga, regresa a la respiración</li>
                                <li>Observa tus pensamientos sin juzgarlos</li>
                                <li>Permite que las emociones fluyan</li>
                            </ol>
                        </div>
                    </div>
                `,
                tip: 'Es normal que la mente divague. La práctica es regresar gentilmente'
            },
            'progressive-relaxation': {
                title: 'Relajación Progresiva',
                subtitle: 'Libera tensión muscular',
                icon: 'fas fa-spa',
                duration: 900, // 15 minutos
                content: `
                    <div class="relaxation-exercise">
                        <div class="relaxation-visual">
                            <div class="relaxation-body" id="relaxation-body">
                                <div class="body-part" data-part="feet">Pies</div>
                                <div class="body-part" data-part="legs">Piernas</div>
                                <div class="body-part" data-part="abdomen">Abdomen</div>
                                <div class="body-part" data-part="arms">Brazos</div>
                                <div class="body-part" data-part="shoulders">Hombros</div>
                                <div class="body-part" data-part="face">Cara</div>
                            </div>
                        </div>
                        <div class="relaxation-instructions">
                            <h3>Instrucciones:</h3>
                            <ol>
                                <li>Siéntate o acuéstate cómodamente</li>
                                <li>Tensa cada grupo muscular por 5 segundos</li>
                                <li>Relaja completamente por 10 segundos</li>
                                <li>Sube gradualmente por todo el cuerpo</li>
                                <li>Presta atención a la diferencia entre tensión y relajación</li>
                            </ol>
                        </div>
                    </div>
                `,
                tip: 'Presta atención a la diferencia entre tensión y relajación'
            },
            grounding: {
                title: 'Técnica de Grounding',
                subtitle: 'Conecta con el presente',
                icon: 'fas fa-seedling',
                duration: 300, // 5 minutos
                content: `
                    <div class="grounding-exercise">
                        <div class="grounding-visual">
                            <div class="grounding-senses" id="grounding-senses">
                                <div class="sense-item" data-sense="see">
                                    <i class="fas fa-eye"></i>
                                    <span>5 cosas que puedes VER</span>
                                </div>
                                <div class="sense-item" data-sense="touch">
                                    <i class="fas fa-hand-paper"></i>
                                    <span>4 cosas que puedes TOCAR</span>
                                </div>
                                <div class="sense-item" data-sense="hear">
                                    <i class="fas fa-ear-listen"></i>
                                    <span>3 cosas que puedes OÍR</span>
                                </div>
                                <div class="sense-item" data-sense="smell">
                                    <i class="fas fa-nose"></i>
                                    <span>2 cosas que puedes OLER</span>
                                </div>
                                <div class="sense-item" data-sense="taste">
                                    <i class="fas fa-mouth"></i>
                                    <span>1 cosa que puedes SABOREAR</span>
                                </div>
                            </div>
                        </div>
                        <div class="grounding-instructions">
                            <h3>Instrucciones:</h3>
                            <ol>
                                <li>Siéntate cómodamente con los pies en el suelo</li>
                                <li>Identifica 5 cosas que puedes ver</li>
                                <li>Identifica 4 cosas que puedes tocar</li>
                                <li>Identifica 3 cosas que puedes oír</li>
                                <li>Identifica 2 cosas que puedes oler</li>
                                <li>Identifica 1 cosa que puedes saborear</li>
                            </ol>
                        </div>
                    </div>
                `,
                tip: 'Tómate tu tiempo con cada sentido y sé específico'
            }
        };

        return exercises[exerciseType] || exercises.breathing;
    }

    startProfessionalExerciseTimer() {
        const exerciseData = this.getProfessionalExerciseData(this.currentExercise);
        this.exerciseTimer = exerciseData.duration;
        this.isExerciseRunning = true;
        this.isExercisePaused = false;

        // Actualizar UI
        document.getElementById('start-exercise-btn').style.display = 'none';
        document.getElementById('complete-exercise-btn').style.display = 'flex';
        document.getElementById('pause-exercise').style.display = 'flex';

        // Iniciar timer
        this.timerInterval = setInterval(() => {
            if (!this.isExercisePaused) {
                this.exerciseTimer--;
                this.updateProfessionalExerciseUI();
                
                if (this.exerciseTimer <= 0) {
                    this.completeProfessionalExercise();
                }
            }
        }, 1000);

        // Iniciar animaciones específicas del ejercicio
        this.startExerciseAnimations();
    }

    updateProfessionalExerciseUI() {
        const minutes = Math.floor(this.exerciseTimer / 60);
        const seconds = this.exerciseTimer % 60;
        const totalDuration = this.getProfessionalExerciseData(this.currentExercise).duration;
        const progress = ((totalDuration - this.exerciseTimer) / totalDuration) * 100;

        // Actualizar timer
        document.getElementById('timer-text').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Actualizar progreso
        document.getElementById('exercise-progress-fill').style.width = `${progress}%`;
        document.getElementById('exercise-progress-text').textContent = 
            `${Math.round(progress)}% completado`;

        // Actualizar animaciones específicas
        this.updateExerciseAnimations(progress);
    }

    startExerciseAnimations() {
        switch (this.currentExercise) {
            case 'breathing':
                this.startBreathingAnimation();
                break;
            case 'meditation':
                this.startMeditationAnimation();
                break;
            case 'progressive-relaxation':
                this.startRelaxationAnimation();
                break;
            case 'grounding':
                this.startGroundingAnimation();
                break;
        }
    }

    updateExerciseAnimations(progress) {
        switch (this.currentExercise) {
            case 'breathing':
                this.updateBreathingAnimation(progress);
                break;
            case 'meditation':
                this.updateMeditationAnimation(progress);
                break;
            case 'progressive-relaxation':
                this.updateRelaxationAnimation(progress);
                break;
            case 'grounding':
                this.updateGroundingAnimation(progress);
                break;
        }
    }

    startBreathingAnimation() {
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        
        if (!circle || !text) return;

        let phase = 0; // 0: inhale, 1: hold, 2: exhale
        let count = 0;
        
        this.breathingInterval = setInterval(() => {
            switch (phase) {
                case 0: // Inhale (4 segundos)
                    text.textContent = `Inhala... ${count + 1}`;
                    circle.style.transform = 'scale(1.2)';
                    circle.style.backgroundColor = '#3b82f6';
                    count++;
                    if (count >= 4) {
                        phase = 1;
                        count = 0;
                    }
                    break;
                case 1: // Hold (7 segundos)
                    text.textContent = `Mantén... ${count + 1}`;
                    circle.style.backgroundColor = '#8b5cf6';
                    count++;
                    if (count >= 7) {
                        phase = 2;
                        count = 0;
                    }
                    break;
                case 2: // Exhale (8 segundos)
                    text.textContent = `Exhala... ${count + 1}`;
                    circle.style.transform = 'scale(1)';
                    circle.style.backgroundColor = '#10b981';
                    count++;
                    if (count >= 8) {
                        phase = 0;
                        count = 0;
                    }
                    break;
            }
        }, 1000);
    }

    updateBreathingAnimation(progress) {
        // La animación de respiración se maneja independientemente
    }

    startMeditationAnimation() {
        const circle = document.getElementById('meditation-circle');
        const text = document.getElementById('meditation-text');
        
        if (!circle || !text) return;

        const messages = [
            'Centra tu atención en la respiración',
            'Observa sin juzgar',
            'Permite que los pensamientos fluyan',
            'Regresa gentilmente al presente',
            'Encuentra tu centro de calma'
        ];

        let messageIndex = 0;
        
        this.meditationInterval = setInterval(() => {
            text.textContent = messages[messageIndex];
            circle.style.transform = 'scale(1.1)';
            
            setTimeout(() => {
                circle.style.transform = 'scale(1)';
            }, 2000);
            
            messageIndex = (messageIndex + 1) % messages.length;
        }, 5000);
    }

    updateMeditationAnimation(progress) {
        // La animación de meditación se maneja independientemente
    }

    startRelaxationAnimation() {
        const bodyParts = document.querySelectorAll('.body-part');
        let currentPart = 0;
        
        this.relaxationInterval = setInterval(() => {
            // Resetear todos
            bodyParts.forEach(part => part.classList.remove('active', 'tensed'));
            
            if (currentPart < bodyParts.length) {
                const part = bodyParts[currentPart];
                part.classList.add('tensed');
                
                setTimeout(() => {
                    part.classList.remove('tensed');
                    part.classList.add('active');
                }, 5000);
                
                currentPart++;
            } else {
                // Reiniciar ciclo
                currentPart = 0;
            }
        }, 10000);
    }

    updateRelaxationAnimation(progress) {
        // La animación de relajación se maneja independientemente
    }

    startGroundingAnimation() {
        const senseItems = document.querySelectorAll('.sense-item');
        let currentSense = 0;
        
        this.groundingInterval = setInterval(() => {
            // Resetear todos
            senseItems.forEach(item => item.classList.remove('active'));
            
            if (currentSense < senseItems.length) {
                senseItems[currentSense].classList.add('active');
                currentSense++;
            } else {
                // Reiniciar ciclo
                currentSense = 0;
            }
        }, 6000);
    }

    updateGroundingAnimation(progress) {
        // La animación de grounding se maneja independientemente
    }

    toggleProfessionalExercise() {
        this.isExercisePaused = !this.isExercisePaused;
        
        const pauseBtn = document.getElementById('pause-exercise');
        const icon = pauseBtn.querySelector('i');
        const text = pauseBtn.querySelector('span');
        
        if (this.isExercisePaused) {
            icon.className = 'fas fa-play';
            text.textContent = 'Continuar';
        } else {
            icon.className = 'fas fa-pause';
            text.textContent = 'Pausar';
        }
    }

    completeProfessionalExercise() {
        // Limpiar intervalos
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.clearExerciseAnimations();
        
        // Mostrar completado
        this.showExerciseCompleted();
        
        // Guardar estadísticas
        this.saveExerciseSession();
        
        // Cerrar modal después de un delay
        setTimeout(() => {
            this.closeProfessionalModal();
        }, 3000);
    }

    clearExerciseAnimations() {
        if (this.breathingInterval) {
            clearInterval(this.breathingInterval);
            this.breathingInterval = null;
        }
        if (this.meditationInterval) {
            clearInterval(this.meditationInterval);
            this.meditationInterval = null;
        }
        if (this.relaxationInterval) {
            clearInterval(this.relaxationInterval);
            this.relaxationInterval = null;
        }
        if (this.groundingInterval) {
            clearInterval(this.groundingInterval);
            this.groundingInterval = null;
        }
    }

    showExerciseCompleted() {
        const content = document.getElementById('exercise-content');
        content.innerHTML = `
            <div class="exercise-completed">
                <div class="completion-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Ejercicio Completado!</h3>
                <p>Has completado el ejercicio de ${this.getProfessionalExerciseData(this.currentExercise).title}.</p>
                <div class="completion-stats">
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        <span>Tiempo: ${Math.floor(this.getProfessionalExerciseData(this.currentExercise).duration / 60)} minutos</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-calendar"></i>
                        <span>Fecha: ${new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Ocultar controles
        document.getElementById('pause-exercise').style.display = 'none';
        document.getElementById('complete-exercise-btn').style.display = 'none';
        
        // Actualizar progreso
        document.getElementById('exercise-progress-fill').style.width = '100%';
        document.getElementById('exercise-progress-text').textContent = '¡Completado!';
    }

    saveExerciseSession() {
        const session = {
            id: Date.now().toString(),
            exercise: this.currentExercise,
            duration: this.getProfessionalExerciseData(this.currentExercise).duration,
            completedAt: new Date().toISOString(),
            effectiveness: Math.floor(Math.random() * 20) + 80 // Simular efectividad
        };

        // Guardar en localStorage
        const sessions = JSON.parse(localStorage.getItem('exercise-sessions') || '[]');
        sessions.unshift(session);
        localStorage.setItem('exercise-sessions', JSON.stringify(sessions));

        // Actualizar estadísticas
        this.totalSessions++;
        this.updateProgressSummary();

        // Mostrar notificación
        this.showNotification('¡Ejercicio completado! Se ha guardado tu progreso.', 'success');
    }

    closeProfessionalModal() {
        const modal = document.getElementById('professional-exercise-modal');
        
        // Limpiar intervalos
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.clearExerciseAnimations();
        
        // Resetear estado
        this.isExerciseRunning = false;
        this.isExercisePaused = false;
        this.currentExercise = null;
        
        // Animar salida
        modal.querySelector('.modal-content').style.transform = 'scale(0.8)';
        modal.querySelector('.modal-content').style.opacity = '0';
        
        setTimeout(() => {
            modal.classList.remove('active');
        }, 300);
    }

    initializeTooltips() {
        // Los tooltips ya están implementados en CSS
        // Solo necesitamos asegurar que funcionen correctamente
        document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
            trigger.addEventListener('mouseenter', () => {
                const tooltip = trigger.querySelector('.tooltip-content');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                }
            });
            
            trigger.addEventListener('mouseleave', () => {
                const tooltip = trigger.querySelector('.tooltip-content');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
        });
    }

    // === EJERCICIOS INTERACTIVOS ===
    startExercise(exerciseType) {
        this.currentExercise = exerciseType;
        this.exerciseTimer = 0;
        
        const modal = document.getElementById('exercise-modal');
        const title = document.getElementById('modal-title');
        const instructions = document.getElementById('exercise-instructions');
        
        const exerciseData = this.getExerciseData(exerciseType);
        
        title.textContent = exerciseData.title;
        instructions.innerHTML = exerciseData.instructions;
        
        modal.classList.add('active');
        
        // Iniciar timer automáticamente
        this.startTimer();
    }

    getExerciseData(exerciseType) {
        const exercises = {
            breathing: {
                title: 'Ejercicio de Respiración Profunda',
                instructions: `
                    <div class="breathing-instructions">
                        <h4>Instrucciones:</h4>
                        <ol>
                            <li>Siéntate cómodamente con la espalda recta</li>
                            <li>Coloca una mano en tu pecho y otra en tu abdomen</li>
                            <li>Inhala lentamente por la nariz durante 4 segundos</li>
                            <li>Mantén la respiración durante 4 segundos</li>
                            <li>Exhala lentamente por la boca durante 6 segundos</li>
                            <li>Repite este ciclo durante 5-10 minutos</li>
                        </ol>
                        <div class="breathing-visual">
                            <div class="breathing-circle" id="breathing-circle"></div>
                            <p id="breathing-instruction">Preparate para comenzar...</p>
                        </div>
                    </div>
                `
            },
            meditation: {
                title: 'Meditación Guiada',
                instructions: `
                    <div class="meditation-instructions">
                        <h4>Instrucciones:</h4>
                        <ol>
                            <li>Encuentra una posición cómoda, sentado o acostado</li>
                            <li>Cierra los ojos suavemente</li>
                            <li>Enfócate en tu respiración natural</li>
                            <li>Cuando tu mente divague, regresa suavemente a la respiración</li>
                            <li>No juzgues tus pensamientos, simplemente obsérvalos</li>
                            <li>Permanece en este estado de atención plena</li>
                        </ol>
                    </div>
                `
            },
            'progressive-relaxation': {
                title: 'Relajación Progresiva',
                instructions: `
                    <div class="relaxation-instructions">
                        <h4>Instrucciones:</h4>
                        <ol>
                            <li>Acuéstate cómodamente</li>
                            <li>Tensa cada grupo muscular durante 5 segundos</li>
                            <li>Luego relaja completamente durante 10 segundos</li>
                            <li>Comienza por los dedos de los pies</li>
                            <li>Sube gradualmente por todo el cuerpo</li>
                            <li>Termina con los músculos faciales</li>
                        </ol>
                    </div>
                `
            },
            grounding: {
                title: 'Técnica de Grounding',
                instructions: `
                    <div class="grounding-instructions">
                        <h4>Instrucciones:</h4>
                        <ol>
                            <li>Siéntate cómodamente con los pies en el suelo</li>
                            <li>Identifica 5 cosas que puedes ver</li>
                            <li>Identifica 4 cosas que puedes tocar</li>
                            <li>Identifica 3 cosas que puedes oír</li>
                            <li>Identifica 2 cosas que puedes oler</li>
                            <li>Identifica 1 cosa que puedes saborear</li>
                        </ol>
                    </div>
                `
            }
        };
        
        return exercises[exerciseType] || exercises.breathing;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.exerciseTimer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.exerciseTimer / 60);
        const seconds = this.exerciseTimer % 60;
        const display = document.getElementById('exercise-timer').querySelector('.timer-display');
        display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    toggleTimer() {
        const pauseBtn = document.getElementById('pause-timer');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            pauseBtn.textContent = 'Continuar';
        } else {
            this.startTimer();
            pauseBtn.textContent = 'Pausar';
        }
    }

    completeExercise() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Guardar sesión de ejercicio
        this.saveExerciseSession();
        
        // Mostrar mensaje de completado
        this.showExerciseCompleted();
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
            this.closeExerciseModal();
        }, 2000);
    }

    saveExerciseSession() {
        const session = {
            id: Date.now(),
            exercise: this.currentExercise,
            duration: this.exerciseTimer,
            date: new Date().toISOString(),
            completed: true
        };
        
        // Agregar a las actividades diarias
        const today = new Date().toDateString();
        if (!this.dailyActivities[today]) {
            this.dailyActivities[today] = [];
        }
        this.dailyActivities[today].push(session);
        
        this.saveDailyActivities();
        this.updateProgressSummary();
        this.checkAchievements();
    }

    showExerciseCompleted() {
        const modal = document.getElementById('exercise-modal');
        const body = modal.querySelector('.modal-body');
        
        body.innerHTML = `
            <div class="exercise-completed">
                <div class="completion-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Ejercicio Completado!</h3>
                <p>Has completado ${this.exerciseTimer} segundos de ${this.getExerciseData(this.currentExercise).title}</p>
                <div class="completion-stats">
                    <div class="stat">
                        <span class="stat-value">${this.exerciseTimer}</span>
                        <span class="stat-label">segundos</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${this.totalSessions + 1}</span>
                        <span class="stat-label">sesiones totales</span>
                    </div>
                </div>
            </div>
        `;
    }

    closeExerciseModal() {
        const modal = document.getElementById('exercise-modal');
        modal.classList.remove('active');
        
        // Resetear timer
        this.exerciseTimer = 0;
        this.currentExercise = null;
        
        // Restaurar contenido original del modal
        const body = modal.querySelector('.modal-body');
        body.innerHTML = `
            <div class="exercise-instructions" id="exercise-instructions">
                <!-- Las instrucciones se cargarán aquí -->
            </div>
            <div class="exercise-timer" id="exercise-timer">
                <div class="timer-display">00:00</div>
                <div class="timer-controls">
                    <button class="btn btn-outline" id="pause-timer">Pausar</button>
                    <button class="btn btn-primary" id="complete-exercise">Completar</button>
                </div>
            </div>
        `;
        
        // Reconfigurar event listeners
        document.getElementById('pause-timer').addEventListener('click', () => {
            this.toggleTimer();
        });
        
        document.getElementById('complete-exercise').addEventListener('click', () => {
            this.completeExercise();
        });
    }

    // === CALENDARIO FUNCIONAL ===
    generateCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthTitle = document.getElementById('current-month');
        
        if (!calendarGrid || !monthTitle) return;
        
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        monthTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendarGrid.innerHTML = '';
        
        // Generar días del calendario
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Marcar días del mes actual
            if (currentDate.getMonth() === this.currentMonth) {
                dayElement.classList.add('current-month');
                
                // Marcar día actual
                const today = new Date();
                if (currentDate.toDateString() === today.toDateString()) {
                    dayElement.classList.add('today');
                }
                
                // Marcar días con actividades
                const dateString = currentDate.toDateString();
                if (this.dailyActivities[dateString]) {
                    const activities = this.dailyActivities[dateString];
                    const completedActivities = activities.filter(a => a.completed);
                    
                    if (completedActivities.length === activities.length && activities.length > 0) {
                        dayElement.classList.add('completed');
                    } else if (completedActivities.length > 0) {
                        dayElement.classList.add('partial');
                    }
                }
                
                // Agregar click handler
                dayElement.addEventListener('click', () => {
                    this.openDailyActivities(currentDate);
                });
            } else {
                dayElement.classList.add('other-month');
            }
            
            calendarGrid.appendChild(dayElement);
        }
        
        this.updateCalendarStats();
    }

    previousMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.generateCalendar();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.generateCalendar();
    }

    openDailyActivities(date) {
        const modal = document.getElementById('daily-activity-modal');
        const dateElement = document.getElementById('activity-date');
        const activitiesContainer = document.getElementById('daily-activities');
        
        const dateString = date.toDateString();
        const activities = this.dailyActivities[dateString] || [];
        
        dateElement.textContent = `Actividades para ${date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
        
        if (activities.length === 0) {
            activitiesContainer.innerHTML = `
                <div class="no-activities">
                    <i class="fas fa-calendar-plus"></i>
                    <h4>No hay actividades programadas</h4>
                    <p>Este día no tiene actividades específicas. Puedes agregar ejercicios o reflexiones.</p>
                    <button class="btn-cta-primary" onclick="diaryWellness.addActivityToDate('${dateString}')">
                        <i class="fas fa-plus"></i>
                        Agregar Actividad
                    </button>
                </div>
            `;
        } else {
            activitiesContainer.innerHTML = activities.map(activity => `
                <div class="activity-card ${activity.completed ? 'completed' : ''}">
                    <div class="activity-header">
                        <h4>${this.getExerciseData(activity.exercise).title}</h4>
                        <span class="activity-time">${new Date(activity.date).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}</span>
                    </div>
                    <div class="activity-description">
                        Duración: ${Math.floor(activity.duration / 60)}:${(activity.duration % 60).toString().padStart(2, '0')}
                    </div>
                    <div class="activity-details">
                        <div class="activity-duration">
                            <i class="fas fa-clock"></i>
                            <span>${activity.duration}s</span>
                        </div>
                        <div class="activity-priority priority-media">
                            <i class="fas fa-star"></i>
                            <span>Ejercicio</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        this.updateDailyProgress(activities);
        modal.classList.add('active');
    }

    updateDailyProgress(activities) {
        const progressFill = document.getElementById('daily-progress-fill');
        const progressText = document.getElementById('daily-progress-text');
        
        const completed = activities.filter(a => a.completed).length;
        const total = activities.length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${completed}/${total} actividades completadas`;
    }

    updateCalendarStats() {
        const weeklyProgress = document.getElementById('weekly-progress');
        const monthlyGoal = document.getElementById('monthly-goal');
        const bestStreak = document.getElementById('best-streak');
        
        if (weeklyProgress) {
            const weekDays = this.getWeekDays();
            const completedDays = weekDays.filter(day => {
                const activities = this.dailyActivities[day] || [];
                return activities.some(a => a.completed);
            }).length;
            weeklyProgress.textContent = `${completedDays}/7`;
        }
        
        if (monthlyGoal) {
            const monthDays = this.getMonthDays();
            const completedDays = monthDays.filter(day => {
                const activities = this.dailyActivities[day] || [];
                return activities.some(a => a.completed);
            }).length;
            monthlyGoal.textContent = `${completedDays}/30`;
        }
        
        if (bestStreak) {
            bestStreak.textContent = this.calculateBestStreak();
        }
    }

    getWeekDays() {
        const today = new Date();
        const weekDays = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + i);
            weekDays.push(date.toDateString());
        }
        
        return weekDays;
    }

    getMonthDays() {
        const today = new Date();
        const monthDays = [];
        
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), i);
            monthDays.push(date.toDateString());
        }
        
        return monthDays;
    }

    calculateBestStreak() {
        const dates = Object.keys(this.dailyActivities).sort();
        let currentStreak = 0;
        let bestStreak = 0;
        
        for (const date of dates) {
            const activities = this.dailyActivities[date];
            if (activities && activities.some(a => a.completed)) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        return bestStreak;
    }

    // === SEGUIMIENTO DE ANSIEDAD ===
    updateAnxietyLevel(level) {
        const levelDisplay = document.getElementById('current-level-display');
        const levelDescription = document.getElementById('level-description');
        
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
        
        if (levelDescription) {
            const descriptions = {
                1: 'Muy tranquilo',
                2: 'Tranquilo',
                3: 'Relajado',
                4: 'Neutral',
                5: 'Moderado',
                6: 'Ligeramente ansioso',
                7: 'Ansioso',
                8: 'Muy ansioso',
                9: 'Extremadamente ansioso',
                10: 'Pánico'
            };
            levelDescription.textContent = descriptions[level] || 'Moderado';
        }
    }

    saveAnxietyLevel() {
        const level = document.getElementById('anxiety-scale').value;
        const today = new Date().toISOString().split('T')[0];
        
        const anxietyEntry = {
            date: today,
            level: parseInt(level),
            timestamp: new Date().toISOString()
        };
        
        // Verificar si ya existe una entrada para hoy
        const existingIndex = this.anxietyLevels.findIndex(entry => entry.date === today);
        
        if (existingIndex >= 0) {
            this.anxietyLevels[existingIndex] = anxietyEntry;
        } else {
            this.anxietyLevels.push(anxietyEntry);
        }
        
        this.saveAnxietyLevels();
        this.updateAnxietyChart();
        this.showNotification('Nivel de ansiedad guardado correctamente', 'success');
    }

    updateAnxietyChart() {
        const canvas = document.getElementById('anxiety-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const recentData = this.anxietyLevels.slice(-30); // Últimos 30 días
        
        if (recentData.length === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6B7280';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos suficientes', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configurar gráfico
        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // Dibujar ejes
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        
        // Eje Y (niveles de ansiedad)
        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight / 10) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
            
            // Etiquetas del eje Y
            ctx.fillStyle = '#6B7280';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(i.toString(), padding - 10, y + 4);
        }
        
        // Dibujar línea de datos
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        recentData.forEach((entry, index) => {
            const x = padding + (chartWidth / (recentData.length - 1)) * index;
            const y = padding + chartHeight - (chartHeight / 10) * entry.level;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Dibujar puntos
        ctx.fillStyle = '#8B5CF6';
        recentData.forEach((entry, index) => {
            const x = padding + (chartWidth / (recentData.length - 1)) * index;
            const y = padding + chartHeight - (chartHeight / 10) * entry.level;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Actualizar estadísticas
        this.updateAnxietyStats(recentData);
    }

    updateAnxietyStats(data) {
        const weeklyAverage = document.getElementById('weekly-average');
        const anxietyTrend = document.getElementById('anxiety-trend');
        
        if (weeklyAverage && data.length > 0) {
            const avg = data.reduce((sum, entry) => sum + entry.level, 0) / data.length;
            weeklyAverage.textContent = avg.toFixed(1);
        }
        
        if (anxietyTrend && data.length >= 2) {
            const recent = data.slice(-7);
            const older = data.slice(-14, -7);
            
            if (older.length > 0) {
                const recentAvg = recent.reduce((sum, entry) => sum + entry.level, 0) / recent.length;
                const olderAvg = older.reduce((sum, entry) => sum + entry.level, 0) / older.length;
                
                const diff = recentAvg - olderAvg;
                
                if (diff < -0.5) {
                    anxietyTrend.textContent = 'Mejorando';
                    anxietyTrend.className = 'trend-mejorando';
                } else if (diff > 0.5) {
                    anxietyTrend.textContent = 'Empeorando';
                    anxietyTrend.className = 'trend-empeorando';
                } else {
                    anxietyTrend.textContent = 'Estable';
                    anxietyTrend.className = 'trend-estable';
                }
            }
        }
    }

    // === SISTEMA DE REFLEXIÓN ===
    selectMood(mood) {
        // Remover selección anterior
        document.querySelectorAll('.mood-btn-enhanced').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Seleccionar nuevo estado de ánimo
        const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        this.currentMood = mood;
        this.toggleSaveButton();
    }

    updateCharacterCount() {
        const textarea = document.getElementById('reflection-text');
        const charCount = document.getElementById('char-count');
        
        if (textarea && charCount) {
            const count = textarea.value.length;
            charCount.textContent = count;
        }
    }

    toggleSaveButton() {
        const saveBtn = document.getElementById('save-reflection');
        const textarea = document.getElementById('reflection-text');
        
        if (saveBtn && textarea) {
            const hasText = textarea.value.trim().length > 0;
            const hasMood = this.currentMood !== null;
            
            saveBtn.disabled = !(hasText && hasMood);
        }
    }

    clearReflection() {
        const textarea = document.getElementById('reflection-text');
        const charCount = document.getElementById('char-count');
        
        if (textarea) {
            textarea.value = '';
        }
        
        if (charCount) {
            charCount.textContent = '0';
        }
        
        // Limpiar selección de estado de ánimo
        document.querySelectorAll('.mood-btn-enhanced').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.currentMood = null;
        this.selectedTags = [];
        this.updateSelectedTags();
        this.toggleSaveButton();
    }

    saveReflection() {
        const textarea = document.getElementById('reflection-text');
        const reflectionText = textarea.value.trim();
        
        if (!reflectionText || !this.currentMood) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }
        
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: this.currentMood,
            text: reflectionText,
            tags: [...this.selectedTags],
            wordCount: reflectionText.split(' ').length,
            characterCount: reflectionText.length
        };
        
        this.entries.unshift(entry);
        this.saveEntries();
        
        // Actualizar etiquetas disponibles
        this.updateAvailableTags(entry.tags);
        
        // Limpiar formulario
        this.clearReflection();
        
        // Actualizar lista de entradas
        this.loadEntriesList();
        
        // Actualizar estadísticas
        this.updateProgressSummary();
        this.checkAchievements();
        
        this.showNotification('Reflexión guardada correctamente', 'success');
    }

    // === CARGA Y FILTRADO DE ENTRADAS ===
    loadEntriesList() {
        const entriesList = document.getElementById('entries-list');
        if (!entriesList) return;
        
        const filteredEntries = this.getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            entriesList.innerHTML = `
                <div class="no-entries-message">
                    <i class="fas fa-book-open"></i>
                    <h3>No hay reflexiones aún</h3>
                    <p>Comienza escribiendo tu primera reflexión para ver tu progreso aquí.</p>
                </div>
            `;
        } else {
            entriesList.innerHTML = filteredEntries.map(entry => this.createEntryHTML(entry)).join('');
        }
        
        this.updateResultsCounter(filteredEntries.length);
    }

    getFilteredEntries() {
        let filtered = [...this.entries];
        
        // Filtro de búsqueda
        const searchTerm = document.getElementById('search-entries')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(entry => 
                entry.text.toLowerCase().includes(searchTerm) ||
                entry.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        // Filtro de fecha
        const dateFilter = document.getElementById('date-filter')?.value;
        if (dateFilter && dateFilter !== 'all') {
            const today = new Date();
            filtered = filtered.filter(entry => {
                const entryDate = new Date(entry.date);
                
                switch (dateFilter) {
                    case 'today':
                        return entryDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(today.getDate() - 7);
                        return entryDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(today.getMonth() - 1);
                        return entryDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Filtro de estado de ánimo
        const moodFilter = document.getElementById('mood-filter')?.value;
        if (moodFilter && moodFilter !== 'all') {
            filtered = filtered.filter(entry => entry.mood === moodFilter);
        }
        
        // Filtro de etiquetas
        const tagFilter = document.getElementById('tag-filter')?.value;
        if (tagFilter && tagFilter !== 'all') {
            filtered = filtered.filter(entry => entry.tags.includes(tagFilter));
        }
        
        return filtered;
    }

    createEntryHTML(entry) {
        const date = new Date(entry.date);
        const moodEmojis = {
            calm: '😌',
            relaxed: '😊',
            neutral: '😐',
            anxious: '😰',
            overwhelmed: '😵'
        };
        
        return `
            <div class="entry-item">
                <div class="entry-header">
                    <div class="entry-date">${date.toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                    <div class="entry-mood">
                        <span class="mood-emoji">${moodEmojis[entry.mood]}</span>
                        <span class="mood-label">${this.getMoodLabel(entry.mood)}</span>
                    </div>
                </div>
                <div class="entry-content">${this.formatEntryText(entry.text)}</div>
                ${entry.tags.length > 0 ? `
                    <div class="entry-tags">
                        ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="entry-actions">
                    <button onclick="diaryWellness.editEntry(${entry.id})">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button onclick="diaryWellness.deleteEntry(${entry.id})">
                        <i class="fas fa-trash"></i>
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }

    getMoodLabel(mood) {
        const labels = {
            calm: 'Tranquilo',
            relaxed: 'Relajado',
            neutral: 'Neutral',
            anxious: 'Ansioso',
            overwhelmed: 'Abrumado'
        };
        return labels[mood] || mood;
    }

    formatEntryText(text) {
        // Convertir saltos de línea a <br>
        return text.replace(/\n/g, '<br>');
    }

    updateResultsCounter(count) {
        const counter = document.getElementById('results-counter');
        if (counter) {
            counter.textContent = `${count} entradas encontradas`;
        }
    }

    // === NOTIFICACIONES ===
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // === MÉTODOS DE INICIALIZACIÓN ===
    initializeMoodTracking() {
        // Configurar seguimiento de estado de ánimo
        this.updateAnxietyChart();
    }

    initializeExerciseModals() {
        // Configurar modales de ejercicios
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeExerciseModal();
            });
        }
    }

    initializeCalendarNavigation() {
        // Configurar navegación del calendario
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousMonth();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextMonth();
            });
        }
    }

    initializeReflectionSystem() {
        // Configurar sistema de reflexión
        const textarea = document.getElementById('reflection-text');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.updateCharacterCount();
                this.toggleSaveButton();
            });
        }
    }

    initializeExportFunctions() {
        // Configurar funciones de exportación
        const exportBtns = document.querySelectorAll('[id^="export-"]');
        exportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.id.replace('export-', '');
                this.exportData(format);
            });
        });
    }

    initializeProgressTracking() {
        // Configurar seguimiento de progreso
        this.updateProgressSummary();
        this.updateStreak();
    }

    // === MÉTODOS DE UTILIDAD ===
    updateProgressSummary() {
        const currentStreakEl = document.getElementById('current-streak');
        const totalSessionsEl = document.getElementById('total-sessions');
        
        if (currentStreakEl) {
            currentStreakEl.textContent = this.currentStreak;
        }
        
        if (totalSessionsEl) {
            totalSessionsEl.textContent = this.totalSessions;
        }
    }

    updateStreak() {
        // Calcular racha actual
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toDateString();
            
            const hasActivity = this.dailyActivities[dateString]?.some(a => a.completed) ||
                              this.entries.some(e => new Date(e.date).toDateString() === dateString);
            
            if (hasActivity) {
                streak++;
            } else {
                break;
            }
        }
        
        this.currentStreak = streak;
        this.bestStreak = Math.max(this.bestStreak, streak);
        
        this.updateProgressSummary();
    }

    animateCounters() {
        // Animar contadores con efecto de conteo
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.count);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current);
            }, 16);
        });
    }

    checkAchievements() {
        // Verificar logros
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            let progress = 0;
            
            switch (achievement.id) {
                case 'first_entry':
                    progress = this.entries.length > 0 ? 1 : 0;
                    break;
                case 'week_streak':
                    progress = Math.min(this.currentStreak, 7);
                    break;
                case 'exercise_master':
                    progress = Object.values(this.dailyActivities)
                        .flat()
                        .filter(a => a.completed).length;
                    break;
                case 'mood_tracker':
                    progress = this.anxietyLevels.length;
                    break;
            }
            
            achievement.progress = progress;
            
            if (progress >= achievement.target) {
                achievement.unlocked = true;
                this.showAchievementUnlocked(achievement);
            }
        });
        
        this.saveAchievements();
        this.loadAchievementsList();
    }

    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-text">
                    <h4>¡Logro Desbloqueado!</h4>
                    <p>${achievement.title}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    loadAchievementsList() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;
        
        achievementsGrid.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(achievement.progress / achievement.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${achievement.progress}/${achievement.target}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // === EXPORTACIÓN DE DATOS ===
    exportData(format) {
        const data = {
            entries: this.entries,
            anxietyLevels: this.anxietyLevels,
            dailyActivities: this.dailyActivities,
            goals: this.goals,
            achievements: this.achievements,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        switch (format) {
            case 'json':
                this.downloadJSON(data);
                break;
            case 'csv':
                this.downloadCSV(data);
                break;
            case 'pdf':
                this.downloadPDF(data);
                break;
        }
    }

    downloadJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario-bienestar-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadCSV(data) {
        let csv = 'Fecha,Estado de Ánimo,Texto,Etiquetas\n';
        
        data.entries.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString('es-ES');
            const mood = this.getMoodLabel(entry.mood);
            const text = entry.text.replace(/"/g, '""');
            const tags = entry.tags.join(';');
            
            csv += `"${date}","${mood}","${text}","${tags}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diario-bienestar-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    downloadPDF(data) {
        // Implementación básica de PDF (requeriría una librería como jsPDF)
        this.showNotification('Función de PDF en desarrollo', 'info');
    }

    // === ACCIONES RÁPIDAS ===
    handleQuickAction(actionId) {
        switch (actionId) {
            case 'quick-mood-check':
                this.openQuickMoodCheck();
                break;
            case 'quick-breathing':
                this.startExercise('breathing');
                break;
            case 'quick-reflection':
                this.scrollToReflection();
                break;
            case 'view-progress':
                this.scrollToProgress();
                break;
        }
    }

    openQuickMoodCheck() {
        // Crear modal rápido para registro de estado de ánimo
        const modal = document.createElement('div');
        modal.className = 'quick-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Registro Rápido de Estado de Ánimo</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>¿Cómo te sientes ahora?</p>
                    <div class="quick-mood-buttons">
                        <button class="quick-mood-btn" data-mood="calm">😌 Tranquilo</button>
                        <button class="quick-mood-btn" data-mood="relaxed">😊 Relajado</button>
                        <button class="quick-mood-btn" data-mood="neutral">😐 Neutral</button>
                        <button class="quick-mood-btn" data-mood="anxious">😰 Ansioso</button>
                        <button class="quick-mood-btn" data-mood="overwhelmed">😵 Abrumado</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelectorAll('.quick-mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.target.dataset.mood;
                this.saveQuickMood(mood);
                document.body.removeChild(modal);
            });
        });
    }

    saveQuickMood(mood) {
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: mood,
            text: 'Registro rápido de estado de ánimo',
            tags: ['rápido'],
            wordCount: 5,
            characterCount: 35
        };
        
        this.entries.unshift(entry);
        this.saveEntries();
        this.loadEntriesList();
        this.updateProgressSummary();
        
        this.showNotification('Estado de ánimo registrado', 'success');
    }

    scrollToReflection() {
        const reflectionSection = document.querySelector('.reflection-section-enhanced');
        if (reflectionSection) {
            reflectionSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    scrollToProgress() {
        const progressSection = document.querySelector('.calendar-section-enhanced');
        if (progressSection) {
            progressSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // === MÉTODOS DE INICIALIZACIÓN ADICIONALES ===
    initializeAnxietyTracking() {
        // Configurar seguimiento de ansiedad
        this.updateAnxietyChart();
    }

    checkForPersonalizedPlan() {
        // Verificar si hay un plan personalizado
        if (this.personalizedPlan) {
            const planSection = document.getElementById('personalized-plan-section');
            if (planSection) {
                planSection.style.display = 'block';
                this.loadPersonalizedPlanData();
            }
        }
    }

    loadPersonalizedPlanData() {
        // Cargar datos del plan personalizado
        const anxietyLevel = document.getElementById('current-anxiety-level');
        const weeklyGoal = document.getElementById('weekly-goal');
        const planProgress = document.getElementById('plan-progress');
        
        if (anxietyLevel) {
            anxietyLevel.textContent = this.personalizedPlan.anxietyLevel || 'Moderado';
        }
        
        if (weeklyGoal) {
            weeklyGoal.textContent = this.personalizedPlan.weeklyGoal || '5 actividades';
        }
        
        if (planProgress) {
            const progress = this.calculatePlanProgress();
            planProgress.textContent = `${progress}%`;
            const progressFill = document.getElementById('progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
        }
    }

    calculatePlanProgress() {
        // Calcular progreso del plan personalizado
        const weekDays = this.getWeekDays();
        const completedDays = weekDays.filter(day => {
            const activities = this.dailyActivities[day] || [];
            return activities.some(a => a.completed);
        }).length;
        
        return Math.round((completedDays / 7) * 100);
    }

    initializeAnxietyChart() {
        // Inicializar gráfico de ansiedad
        this.updateAnxietyChart();
    }

    initializeQuickActions() {
        // Configurar acciones rápidas
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleQuickAction(e.target.closest('.quick-action-btn').id);
            });
        });
    }

    initializeAchievements() {
        // Configurar logros
        this.loadAchievementsList();
    }

    initializeReminders() {
        // Configurar recordatorios
        this.setupReminders();
    }

    setupReminders() {
        // Configurar recordatorios inteligentes
        if (this.reminders.morning.enabled) {
            this.scheduleReminder('morning', this.reminders.morning.time);
        }
        
        if (this.reminders.evening.enabled) {
            this.scheduleReminder('evening', this.reminders.evening.time);
        }
    }

    scheduleReminder(type, time) {
        // Programar recordatorio
        const [hours, minutes] = time.split(':');
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showReminder(type);
            this.scheduleReminder(type, time); // Programar siguiente recordatorio
        }, timeUntilReminder);
    }

    showReminder(type) {
        const messages = {
            morning: {
                title: 'Buenos días',
                message: 'Es hora de tu sesión matutina de bienestar. ¿Cómo te sientes hoy?',
                action: 'Registrar Estado de Ánimo'
            },
            evening: {
                title: 'Buenas tardes',
                message: 'Momento de reflexionar sobre tu día. ¿Qué tal ha ido todo?',
                action: 'Escribir Reflexión'
            }
        };
        
        const reminder = messages[type];
        if (reminder) {
            this.showSmartReminder(reminder.title, reminder.message, reminder.action);
        }
    }

    showSmartReminder(title, message, actionText) {
        const reminder = document.createElement('div');
        reminder.className = 'smart-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <div class="reminder-header">
                    <i class="fas fa-bell"></i>
                    <h4>${title}</h4>
                    <button class="reminder-close">&times;</button>
                </div>
                <p class="reminder-message">${message}</p>
                <div class="reminder-actions">
                    <button class="btn-reminder-action" onclick="diaryWellness.handleReminderAction('${actionText}')">
                        <i class="fas fa-heart"></i>
                        ${actionText}
                    </button>
                    <button class="btn-reminder-action secondary" onclick="diaryWellness.dismissReminder(this)">
                        <i class="fas fa-times"></i>
                        Más tarde
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(reminder);
        
        // Auto-dismiss después de 30 segundos
        setTimeout(() => {
            if (document.body.contains(reminder)) {
                document.body.removeChild(reminder);
            }
        }, 30000);
    }

    handleReminderAction(action) {
        if (action.includes('Estado de Ánimo')) {
            this.openQuickMoodCheck();
        } else if (action.includes('Reflexión')) {
            this.scrollToReflection();
        }
        
        // Cerrar recordatorio
        const reminder = document.querySelector('.smart-reminder');
        if (reminder) {
            document.body.removeChild(reminder);
        }
    }

    dismissReminder(button) {
        const reminder = button.closest('.smart-reminder');
        if (reminder) {
            document.body.removeChild(reminder);
        }
    }

    initializeAnalytics() {
        // Configurar analytics
        this.loadAnalyticsData();
    }

    loadAnalyticsData() {
        // Cargar datos de analytics
        this.updateMoodPatterns();
        this.updateEffectivenessChart();
        this.updateInsights();
    }

    updateMoodPatterns() {
        const moodPatterns = document.getElementById('mood-patterns');
        if (!moodPatterns) return;
        
        const moodCounts = {};
        this.entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });
        
        const total = this.entries.length;
        if (total === 0) {
            moodPatterns.innerHTML = '<p>No hay datos suficientes</p>';
            return;
        }
        
        moodPatterns.innerHTML = Object.entries(moodCounts).map(([mood, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="mood-pattern-item">
                    <div class="mood-emoji">${this.getMoodEmoji(mood)}</div>
                    <div class="mood-info">
                        <span class="mood-label">${this.getMoodLabel(mood)}</span>
                        <div class="mood-bar">
                            <div class="mood-fill" style="width: ${percentage}%"></div>
                        </div>
                        <span class="mood-percentage">${percentage.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMoodEmoji(mood) {
        const emojis = {
            calm: '😌',
            relaxed: '😊',
            neutral: '😐',
            anxious: '😰',
            overwhelmed: '😵'
        };
        return emojis[mood] || '😐';
    }

    updateEffectivenessChart() {
        const effectivenessChart = document.getElementById('effectiveness-chart');
        if (!effectivenessChart) return;
        
        const exerciseCounts = {};
        Object.values(this.dailyActivities).flat().forEach(activity => {
            if (activity.completed) {
                exerciseCounts[activity.exercise] = (exerciseCounts[activity.exercise] || 0) + 1;
            }
        });
        
        if (Object.keys(exerciseCounts).length === 0) {
            effectivenessChart.innerHTML = '<p>No hay datos de ejercicios</p>';
            return;
        }
        
        effectivenessChart.innerHTML = Object.entries(exerciseCounts).map(([exercise, count]) => {
            const exerciseData = this.getExerciseData(exercise);
            return `
                <div class="effectiveness-item">
                    <div class="exercise-name">${exerciseData.title}</div>
                    <div class="effectiveness-bar">
                        <div class="effectiveness-fill" style="width: ${Math.min(count * 10, 100)}%"></div>
                    </div>
                    <div class="effectiveness-stats">
                        <span class="effectiveness-score">${count} sesiones</span>
                        <span class="exercise-count">Completadas</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateInsights() {
        const insightsList = document.getElementById('insights-list');
        if (!insightsList) return;
        
        const insights = this.generateInsights();
        
        insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <div class="insight-icon">
                    <i class="fas fa-${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            </div>
        `).join('');
    }

    generateInsights() {
        const insights = [];
        
        // Insight sobre consistencia
        if (this.currentStreak >= 7) {
            insights.push({
                type: 'positive',
                icon: 'fire',
                title: '¡Excelente consistencia!',
                description: `Has mantenido una racha de ${this.currentStreak} días. ¡Sigue así!`
            });
        }
        
        // Insight sobre ejercicios
        const totalExercises = Object.values(this.dailyActivities).flat().filter(a => a.completed).length;
        if (totalExercises >= 10) {
            insights.push({
                type: 'positive',
                icon: 'star',
                title: 'Maestro del ejercicio',
                description: `Has completado ${totalExercises} ejercicios. Tu dedicación es admirable.`
            });
        }
        
        // Insight sobre estado de ánimo
        if (this.entries.length >= 5) {
            const recentMoods = this.entries.slice(0, 5).map(e => e.mood);
            const positiveMoods = recentMoods.filter(m => ['calm', 'relaxed'].includes(m)).length;
            
            if (positiveMoods >= 3) {
                insights.push({
                    type: 'positive',
                    icon: 'smile',
                    title: 'Estado de ánimo positivo',
                    description: 'Tu estado de ánimo ha sido mayormente positivo últimamente.'
                });
            }
        }
        
        // Insight de sugerencia
        if (this.currentStreak < 3 && this.entries.length > 0) {
            insights.push({
                type: 'suggestion',
                icon: 'lightbulb',
                title: 'Consejo de consistencia',
                description: 'Intenta mantener una rutina diaria para ver mejores resultados.'
            });
        }
        
        return insights;
    }

    initializeTags() {
        // Configurar sistema de etiquetas
        const tagsInput = document.getElementById('entry-tags');
        if (tagsInput) {
            tagsInput.addEventListener('input', (e) => {
                this.showTagSuggestions(e.target.value);
            });
            
            tagsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(e.target.value.trim());
                    e.target.value = '';
                    this.hideTagSuggestions();
                }
            });
        }
    }

    initializeAutoSave() {
        // Configurar respaldo automático
        this.autoSaveInterval = setInterval(() => {
            this.performAutoSave();
        }, 30000); // Cada 30 segundos
    }

    performAutoSave() {
        // Realizar respaldo automático
        this.saveEntries();
        this.saveAnxietyLevels();
        this.saveDailyActivities();
        this.updateLastSaveTime();
    }

    updateLastSaveTime() {
        const lastSaveTime = document.getElementById('last-save-time');
        if (lastSaveTime) {
            this.lastSaveTime = new Date();
            lastSaveTime.textContent = this.lastSaveTime.toLocaleTimeString('es-ES');
        }
    }

    initializeAccessibility() {
        // Configurar accesibilidad
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // Configurar navegación por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Cerrar modales abiertos
                const openModal = document.querySelector('.modal.active');
                if (openModal) {
                    openModal.classList.remove('active');
                }
            }
        });
    }

    setupScreenReaderSupport() {
        // Configurar soporte para lectores de pantalla
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    initializeGoals() {
        // Configurar objetivos
        this.loadGoalsList();
    }

    loadGoalsList() {
        const goalsList = document.getElementById('goals-list');
        if (!goalsList) return;
        
        if (this.goals.length === 0) {
            goalsList.innerHTML = `
                <div class="no-goals-message">
                    <i class="fas fa-bullseye"></i>
                    <h3>No tienes objetivos aún</h3>
                    <p>Crea tu primer objetivo para mantenerte motivado en tu viaje de bienestar.</p>
                </div>
            `;
        } else {
            goalsList.innerHTML = this.goals.map(goal => this.createGoalHTML(goal)).join('');
        }
        
        this.updateGoalsProgress();
    }

    createGoalHTML(goal) {
        const progress = (goal.progress / goal.target) * 100;
        const isCompleted = goal.progress >= goal.target;
        
        return `
            <div class="goal-card ${isCompleted ? 'completed' : ''}">
                <div class="goal-header">
                    <h4 class="goal-title">${goal.title}</h4>
                    <div class="goal-actions">
                        <button class="btn-goal-action" onclick="diaryWellness.editGoal(${goal.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-goal-action" onclick="diaryWellness.deleteGoal(${goal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="goal-content">
                    <p class="goal-description">${goal.description}</p>
                    <div class="goal-progress">
                        <div class="progress-info">
                            <span class="progress-text">Progreso</span>
                            <span class="progress-percentage">${progress.toFixed(0)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div class="goal-meta">
                        <span class="goal-category">${goal.category}</span>
                        ${goal.deadline ? `<span class="goal-deadline">Hasta ${new Date(goal.deadline).toLocaleDateString('es-ES')}</span>` : ''}
                    </div>
                </div>
                <div class="goal-controls">
                    <button class="btn-goal-update" onclick="diaryWellness.updateGoalProgress(${goal.id})">
                        <i class="fas fa-plus"></i>
                        Actualizar Progreso
                    </button>
                </div>
            </div>
        `;
    }

    updateGoalsProgress() {
        const goalsProgress = document.getElementById('goals-progress');
        if (goalsProgress) {
            const completed = this.goals.filter(g => g.progress >= g.target).length;
            const total = this.goals.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            goalsProgress.textContent = `${completed}/${total} objetivos completados (${percentage}%)`;
        }
    }

    initializeSmartReminders() {
        // Configurar recordatorios inteligentes
        this.setupSmartReminders();
    }

    setupSmartReminders() {
        // Configurar recordatorios basados en patrones de uso
        this.analyzeUsagePatterns();
    }

    analyzeUsagePatterns() {
        // Analizar patrones de uso para sugerir recordatorios
        const usageData = this.getUsageData();
        
        if (usageData.mostActiveHour) {
            this.scheduleSmartReminder(usageData.mostActiveHour);
        }
    }

    getUsageData() {
        // Obtener datos de uso
        const entries = this.entries.map(e => new Date(e.date));
        const activities = Object.values(this.dailyActivities).flat().map(a => new Date(a.date));
        
        const allTimes = [...entries, ...activities];
        const hours = allTimes.map(t => t.getHours());
        
        // Encontrar la hora más activa
        const hourCounts = {};
        hours.forEach(hour => {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        
        const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
            hourCounts[a] > hourCounts[b] ? a : b
        );
        
        return {
            mostActiveHour: parseInt(mostActiveHour),
            totalSessions: allTimes.length,
            averageSessionsPerDay: allTimes.length / 30
        };
    }

    scheduleSmartReminder(hour) {
        // Programar recordatorio inteligente
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(hour, 0, 0, 0);
        
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showSmartReminder(
                'Momento de bienestar',
                'Basado en tus patrones de uso, este es un buen momento para tu sesión de bienestar.',
                'Comenzar Sesión'
            );
        }, timeUntilReminder);
    }

    initializeAdvancedAnalytics() {
        // Configurar analytics avanzados
        this.loadAdvancedAnalytics();
    }

    loadAdvancedAnalytics() {
        // Cargar analytics avanzados
        this.updateTrendsDisplay();
        this.updateInsightsDisplay();
    }

    updateTrendsDisplay() {
        const trendsDisplay = document.getElementById('trends-display');
        if (!trendsDisplay) return;
        
        const trends = this.calculateTrends();
        
        trendsDisplay.innerHTML = `
            <div class="trends-grid">
                <div class="trend-card">
                    <h4>Tendencia de Estado de Ánimo</h4>
                    <p>${trends.moodTrend}</p>
                </div>
                <div class="trend-card">
                    <h4>Consistencia</h4>
                    <p>${trends.consistencyTrend}</p>
                </div>
                <div class="trend-card">
                    <h4>Ejercicios</h4>
                    <p>${trends.exerciseTrend}</p>
                </div>
            </div>
        `;
    }

    calculateTrends() {
        const recentEntries = this.entries.slice(0, 7);
        const recentActivities = Object.values(this.dailyActivities).flat().slice(0, 7);
        
        return {
            moodTrend: recentEntries.length >= 3 ? 'Mejorando' : 'Necesita más datos',
            consistencyTrend: this.currentStreak >= 5 ? 'Excelente' : 'Puede mejorar',
            exerciseTrend: recentActivities.length >= 5 ? 'Muy activo' : 'Moderado'
        };
    }

    updateInsightsDisplay() {
        const insightsDisplay = document.getElementById('insights-display');
        if (!insightsDisplay) return;
        
        const insights = this.generateAdvancedInsights();
        
        insightsDisplay.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `).join('');
    }

    generateAdvancedInsights() {
        const insights = [];
        
        // Insight sobre patrones temporales
        const morningEntries = this.entries.filter(e => new Date(e.date).getHours() < 12).length;
        const eveningEntries = this.entries.filter(e => new Date(e.date).getHours() >= 18).length;
        
        if (morningEntries > eveningEntries) {
            insights.push({
                type: 'positive',
                title: 'Persona matutina',
                description: 'Prefieres hacer tus reflexiones por la mañana. Esto puede ayudarte a empezar el día con claridad.'
            });
        } else if (eveningEntries > morningEntries) {
            insights.push({
                type: 'positive',
                title: 'Persona nocturna',
                description: 'Prefieres reflexionar por la noche. Esto te ayuda a procesar el día y relajarte.'
            });
        }
        
        // Insight sobre ejercicios favoritos
        const exerciseCounts = {};
        Object.values(this.dailyActivities).flat().forEach(a => {
            if (a.completed) {
                exerciseCounts[a.exercise] = (exerciseCounts[a.exercise] || 0) + 1;
            }
        });
        
        const favoriteExercise = Object.keys(exerciseCounts).reduce((a, b) => 
            exerciseCounts[a] > exerciseCounts[b] ? a : b, null
        );
        
        if (favoriteExercise) {
            const exerciseData = this.getExerciseData(favoriteExercise);
            insights.push({
                type: 'info',
                title: 'Ejercicio favorito',
                description: `Tu ejercicio más realizado es "${exerciseData.title}". Considera explorar otros ejercicios para variedad.`
            });
        }
        
        return insights;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.diaryWellness = new DiaryWellness();
        });

        // Calendario
        document.getElementById('prev-month').addEventListener('click', () => {
            this.changeMonth(-1);
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.changeMonth(1);
        });

        // Filtros de entradas
        document.getElementById('date-filter').addEventListener('change', () => {
            this.filterEntries();
        });

        document.getElementById('mood-filter').addEventListener('change', () => {
            this.filterEntries();
        });

        // Búsqueda de entradas
        const searchInput = document.getElementById('search-entries');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterEntries();
            });
        }

        // Filtro por ejercicio
        const exerciseFilter = document.getElementById('exercise-filter');
        if (exerciseFilter) {
            exerciseFilter.addEventListener('change', () => {
                this.filterEntries();
            });
        }

        // Filtro por etiquetas
        const tagFilter = document.getElementById('tag-filter');
        if (tagFilter) {
            tagFilter.addEventListener('change', () => {
                this.filterEntries();
            });
        }

        // Botones de exportación
        const exportJSONBtn = document.getElementById('export-json');
        if (exportJSONBtn) {
            exportJSONBtn.addEventListener('click', () => {
                this.exportToJSON();
            });
        }

        const exportPDFBtn = document.getElementById('export-pdf');
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => {
                this.exportToPDF();
            });
        }

        const exportCSVBtn = document.getElementById('export-csv');
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }

        document.getElementById('load-more').addEventListener('click', () => {
            this.loadMoreEntries();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.id === 'exercise-modal') {
                this.closeExerciseModal();
            }
        });

        // Seguimiento de ansiedad
        const anxietyScale = document.getElementById('anxiety-scale');
        if (anxietyScale) {
            anxietyScale.addEventListener('input', (e) => {
                this.updateAnxietyLevelDisplay(e.target.value);
            });
        }

        const saveAnxietyBtn = document.getElementById('save-anxiety-level');
        if (saveAnxietyBtn) {
            saveAnxietyBtn.addEventListener('click', () => {
                this.saveAnxietyLevel();
            });
        }

        // Modal de actividades diarias
        const closeActivityModal = document.getElementById('close-activity-modal');
        if (closeActivityModal) {
            closeActivityModal.addEventListener('click', () => {
                this.closeDailyActivityModal();
            });
        }

        const dailyActivityModal = document.getElementById('daily-activity-modal');
        if (dailyActivityModal) {
            dailyActivityModal.addEventListener('click', (e) => {
                if (e.target.id === 'daily-activity-modal') {
                    this.closeDailyActivityModal();
                }
            });
        }

        // Quick Actions
        const quickMoodCheck = document.getElementById('quick-mood-check');
        if (quickMoodCheck) {
            quickMoodCheck.addEventListener('click', () => {
                this.showQuickMoodCheck();
            });
        }

        const quickBreathing = document.getElementById('quick-breathing');
        if (quickBreathing) {
            quickBreathing.addEventListener('click', () => {
                this.startExercise('breathing');
            });
        }

        const quickReflection = document.getElementById('quick-reflection');
        if (quickReflection) {
            quickReflection.addEventListener('click', () => {
                this.scrollToReflection();
            });
        }

        const viewProgress = document.getElementById('view-progress');
        if (viewProgress) {
            viewProgress.addEventListener('click', () => {
                this.scrollToProgress();
            });
        }

        // Recordatorios
        document.querySelectorAll('.reminder-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateReminderSettings(e.target.id, e.target.checked);
            });
        });
    }

    // === EJERCICIOS DE ANSIEDAD ===
    startExercise(exerciseType) {
        this.currentExercise = exerciseType;
        const modal = document.getElementById('exercise-modal');
        const title = document.getElementById('modal-title');
        const instructions = document.getElementById('exercise-instructions');

        // Configurar ejercicio según el tipo
        const exerciseData = this.getExerciseData(exerciseType);
        title.textContent = exerciseData.title;
        instructions.innerHTML = exerciseData.instructions;

        // Mostrar modal
        modal.classList.add('active');
        
        // Iniciar timer
        this.startTimer(exerciseData.duration);
    }

    getExerciseData(exerciseType) {
        const exercises = {
            breathing: {
                title: 'Ejercicio de Respiración Profunda',
                duration: 300, // 5 minutos
                instructions: `
                    <h4>Instrucciones:</h4>
                    <ol>
                        <li>Siéntate cómodamente con la espalda recta</li>
                        <li>Cierra los ojos y relaja los hombros</li>
                        <li>Inhala lentamente por la nariz contando hasta 4</li>
                        <li>Mantén la respiración contando hasta 4</li>
                        <li>Exhala lentamente por la boca contando hasta 6</li>
                        <li>Repite este ciclo durante 5 minutos</li>
                    </ol>
                    <p><strong>Consejo:</strong> Concéntrate en la sensación del aire entrando y saliendo de tu cuerpo.</p>
                `
            },
            meditation: {
                title: 'Meditación Mindfulness',
                duration: 600, // 10 minutos
                instructions: `
                    <h4>Instrucciones:</h4>
                    <ol>
                        <li>Encuentra una posición cómoda y cierra los ojos</li>
                        <li>Concéntrate en tu respiración natural</li>
                        <li>Cuando notes que tu mente divaga, regresa suavemente a la respiración</li>
                        <li>Observa tus pensamientos sin juzgarlos</li>
                        <li>Permite que las emociones fluyan sin resistirte</li>
                        <li>Mantén esta práctica durante 10 minutos</li>
                    </ol>
                    <p><strong>Consejo:</strong> Es normal que la mente divague. La práctica consiste en regresar gentilmente al presente.</p>
                `
            },
            'progressive-relaxation': {
                title: 'Relajación Progresiva',
                duration: 900, // 15 minutos
                instructions: `
                    <h4>Instrucciones:</h4>
                    <ol>
                        <li>Acuéstate o siéntate cómodamente</li>
                        <li>Tensa cada grupo muscular por 5 segundos</li>
                        <li>Luego relaja completamente por 10 segundos</li>
                        <li>Comienza con los dedos de los pies</li>
                        <li>Sube gradualmente por todo el cuerpo</li>
                        <li>Termina con los músculos faciales</li>
                    </ol>
                    <p><strong>Consejo:</strong> Presta atención a la diferencia entre tensión y relajación.</p>
                `
            },
            grounding: {
                title: 'Técnica de Grounding 5-4-3-2-1',
                duration: 300, // 5 minutos
                instructions: `
                    <h4>Instrucciones:</h4>
                    <ol>
                        <li>Identifica 5 cosas que puedes VER</li>
                        <li>Identifica 4 cosas que puedes TOCAR</li>
                        <li>Identifica 3 cosas que puedes OÍR</li>
                        <li>Identifica 2 cosas que puedes OLER</li>
                        <li>Identifica 1 cosa que puedes SABOREAR</li>
                    </ol>
                    <p><strong>Consejo:</strong> Esta técnica te ayuda a conectarte con el presente y reducir la ansiedad.</p>
                `
            }
        };

        return exercises[exerciseType] || exercises.breathing;
    }

    startTimer(duration) {
        this.exerciseTimer = duration;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.exerciseTimer--;
            this.updateTimerDisplay();
            
            if (this.exerciseTimer <= 0) {
                this.completeExercise();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.exerciseTimer / 60);
        const seconds = this.exerciseTimer % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.querySelector('.timer-display').textContent = display;
    }

    toggleTimer() {
        const pauseBtn = document.getElementById('pause-timer');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            pauseBtn.textContent = 'Reanudar';
        } else {
            this.startTimer(this.exerciseTimer);
            pauseBtn.textContent = 'Pausar';
        }
    }

    completeExercise() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Mostrar mensaje de completado
        const instructions = document.getElementById('exercise-instructions');
        instructions.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3 style="color: #4ade80; margin-bottom: 1rem;">¡Ejercicio Completado! 🎉</h3>
                <p>Has completado el ejercicio de ${this.currentExercise}.</p>
                <p>¿Cómo te sientes ahora? Continúa con la reflexión.</p>
            </div>
        `;

        // Ocultar timer
        document.getElementById('exercise-timer').style.display = 'none';

        // Actualizar estadísticas
        this.totalSessions++;
        this.updateProgressSummary();

        // Cerrar modal después de 3 segundos
        setTimeout(() => {
            this.closeExerciseModal();
        }, 3000);
    }

    closeExerciseModal() {
        const modal = document.getElementById('exercise-modal');
        modal.classList.remove('active');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Resetear modal
        document.getElementById('exercise-timer').style.display = 'block';
        document.getElementById('pause-timer').textContent = 'Pausar';
        this.currentExercise = null;
    }

    // === REFLEXIÓN ===
    selectMood(mood) {
        // Remover selección anterior (compatible con ambas versiones)
        document.querySelectorAll('.mood-btn, .mood-btn-enhanced').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Seleccionar nuevo estado
        const selectedBtn = document.querySelector(`[data-mood="${mood}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        this.currentMood = mood;

        this.toggleSaveButton();
    }

    updateCharacterCount() {
        const textarea = document.getElementById('reflection-text');
        const count = document.getElementById('char-count');
        count.textContent = textarea.value.length;
    }

    toggleSaveButton() {
        const textarea = document.getElementById('reflection-text');
        const saveBtn = document.getElementById('save-reflection');
        
        const hasText = textarea.value.trim().length > 0;
        const hasMood = this.currentMood !== null;
        
        saveBtn.disabled = !(hasText && hasMood);
    }

    addPrompt(promptType) {
        const textarea = document.getElementById('reflection-text');
        const prompts = {
            feelings: '¿Cómo me siento ahora después del ejercicio? ',
            thoughts: '¿Qué pensamientos tengo en este momento? ',
            gratitude: '¿Por qué me siento agradecido hoy? ',
            insights: '¿Qué aprendí sobre mí mismo hoy? '
        };

        const prompt = prompts[promptType];
        if (prompt) {
            textarea.value += prompt;
            textarea.focus();
            this.updateCharacterCount();
            this.toggleSaveButton();
        }
    }

    clearReflection() {
        if (confirm('¿Estás seguro de que quieres limpiar la reflexión?')) {
            document.getElementById('reflection-text').value = '';
            document.querySelectorAll('.mood-btn, .mood-btn-enhanced').forEach(btn => {
                btn.classList.remove('selected');
            });
            this.currentMood = null;
            this.tags = [];
            this.updateTagDisplay();
            this.updateCharacterCount();
            this.toggleSaveButton();
        }
    }

    async saveReflection() {
        const textarea = document.getElementById('reflection-text');
        const content = textarea.value.trim();
        
        if (!content || !this.currentMood) {
            alert('Por favor selecciona un estado de ánimo y escribe tu reflexión.');
            return;
        }

        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            mood: this.currentMood,
            content: content,
            exercise: this.currentExercise || 'none',
            wordCount: content.split(' ').length,
            tags: this.tags.map(tag => tag.name)
        };

        // Guardar en Firebase si está disponible
        if (window.firebaseServices) {
            try {
                await window.firebaseServices.saveDiaryEntry({
                    mood: this.currentMood,
                    content: content,
                    exercise: this.currentExercise || 'none',
                    isPrivate: false
                });
                console.log('✅ Reflexión guardada en Firebase');
            } catch (error) {
                console.error('❌ Error guardando en Firebase:', error);
                // Fallback a localStorage
                this.saveToLocalStorage(entry);
            }
        } else {
            // Fallback a localStorage
            this.saveToLocalStorage(entry);
        }

        this.entries.unshift(entry);
        this.updateStreak();
        this.loadEntriesList();
        this.updateQuickActionsState();
        this.updateTagFilter();
        this.clearReflection();
        
        // Mostrar mensaje de éxito
        this.showNotification('Reflexión guardada exitosamente', 'success');
    }

    saveToLocalStorage(entry) {
        this.entries.unshift(entry);
        this.saveEntries();
    }

    // === CALENDARIO ===
    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarGrid = document.getElementById('calendar-grid');
        calendarGrid.innerHTML = '';

        // Días de la semana
        const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.fontWeight = '600';
            dayHeader.style.color = 'var(--diary-text-light)';
            calendarGrid.appendChild(dayHeader);
        });

        // Generar días del mes
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            if (this.isToday(date)) {
                dayElement.classList.add('today');
            }
            
            if (this.hasEntry(date)) {
                dayElement.classList.add('completed');
            }
            
            // Añadir event listener para mostrar actividades diarias
            dayElement.addEventListener('click', () => {
                this.showDailyActivities(date);
            });
            
            calendarGrid.appendChild(dayElement);
        }

        // Actualizar título del mes
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        document.getElementById('current-month').textContent = 
            `${monthNames[month]} ${year}`;
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.generateCalendar();
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    hasEntry(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.entries.some(entry => 
            entry.date.split('T')[0] === dateString
        );
    }

    // === ENTRADAS ===
    loadEntriesList() {
        const entriesList = document.getElementById('entries-list');
        const dateFilter = document.getElementById('date-filter').value;
        const moodFilter = document.getElementById('mood-filter').value;
        const searchQuery = document.getElementById('search-entries')?.value || '';
        const exerciseFilter = document.getElementById('exercise-filter')?.value || 'all';
        const tagFilter = document.getElementById('tag-filter')?.value || 'all';
        
        let filteredEntries = this.entries;

        // Aplicar filtros
        if (dateFilter !== 'all') {
            filteredEntries = this.filterByDate(filteredEntries, dateFilter);
        }
        
        if (moodFilter !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.mood === moodFilter);
        }

        if (exerciseFilter !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.exercise === exerciseFilter);
        }

        if (tagFilter !== 'all') {
            filteredEntries = filteredEntries.filter(entry => 
                entry.tags && entry.tags.includes(tagFilter)
            );
        }

        // Aplicar búsqueda por texto
        if (searchQuery.trim()) {
            filteredEntries = this.searchEntries(filteredEntries, searchQuery);
        }

        // Mostrar entradas
        entriesList.innerHTML = '';
        if (filteredEntries.length === 0) {
            entriesList.innerHTML = `
                <div class="no-entries-message">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron entradas</h3>
                    <p>Intenta ajustar los filtros o términos de búsqueda</p>
                </div>
            `;
        } else {
            filteredEntries.forEach(entry => {
                const entryElement = this.createEntryElement(entry);
                entriesList.appendChild(entryElement);
            });
        }

        // Actualizar contador de resultados
        this.updateResultsCounter(filteredEntries.length);
    }

    filterByDate(entries, filter) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filter) {
            case 'today':
                return entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= today;
                });
            case 'week':
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= weekAgo;
                });
            case 'month':
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return entries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate >= monthAgo;
                });
            default:
                return entries;
        }
    }

    createEntryElement(entry) {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        const moodEmojis = {
            calm: '😌',
            relaxed: '😊',
            neutral: '😐',
            anxious: '😰',
            overwhelmed: '😵'
        };

        const moodLabels = {
            calm: 'Tranquilo',
            relaxed: 'Relajado',
            neutral: 'Neutral',
            anxious: 'Ansioso',
            overwhelmed: 'Abrumado'
        };

        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Generar etiquetas HTML
        const tagsHTML = entry.tags && entry.tags.length > 0 ? 
            `<div class="entry-tags">
                ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
            </div>` : '';

        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${formattedDate}</div>
                <div class="entry-mood">
                    <span class="emoji">${moodEmojis[entry.mood]}</span>
                    <span>${moodLabels[entry.mood]}</span>
                </div>
            </div>
            <div class="entry-content">${entry.content}</div>
            ${tagsHTML}
            <div class="entry-actions">
                <button onclick="diaryWellness.editEntry(${entry.id})">Editar</button>
                <button onclick="diaryWellness.deleteEntry(${entry.id})">Eliminar</button>
            </div>
        `;

        return entryDiv;
    }

    filterEntries() {
        this.loadEntriesList();
    }

    searchEntries(entries, query) {
        const searchTerm = query.toLowerCase().trim();
        return entries.filter(entry => 
            entry.content.toLowerCase().includes(searchTerm) ||
            entry.mood.toLowerCase().includes(searchTerm) ||
            entry.exercise.toLowerCase().includes(searchTerm) ||
            (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    }

    updateResultsCounter(count) {
        const counter = document.getElementById('results-counter');
        if (counter) {
            counter.textContent = `${count} entrada${count !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
    }

    loadMoreEntries() {
        // Implementar carga de más entradas si es necesario
        this.showNotification('Todas las entradas han sido cargadas', 'info');
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (entry) {
            document.getElementById('reflection-text').value = entry.content;
            this.selectMood(entry.mood);
            this.updateCharacterCount();
            this.toggleSaveButton();
            
            // Scroll a la sección de reflexión
            document.querySelector('.reflection-section').scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    deleteEntry(entryId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
            this.entries = this.entries.filter(e => e.id !== entryId);
            this.saveEntries();
            this.updateStreak();
            this.loadEntriesList();
            this.showNotification('Entrada eliminada', 'success');
        }
    }

    // === RACHAS Y PROGRESO ===
    updateStreak() {
        if (this.entries.length === 0) {
            this.currentStreak = 0;
            this.updateProgressSummary();
            return;
        }

        // Ordenar entradas por fecha
        const sortedEntries = [...this.entries].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedEntries.length; i++) {
            const entryDate = new Date(sortedEntries[i].date);
            entryDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }

        this.currentStreak = streak;
        
        // Actualizar mejor racha
        if (streak > this.bestStreak) {
            this.bestStreak = streak;
        }

        this.updateProgressSummary();
    }

    updateProgressSummary() {
        this.animateCounter('current-streak', this.currentStreak);
        this.animateCounter('total-sessions', this.totalSessions);
        this.animateCounter('best-streak', this.bestStreak);
        
        // Actualizar estadísticas del calendario
        document.getElementById('weekly-progress').textContent = this.getWeeklyProgress();
        document.getElementById('monthly-goal').textContent = this.getMonthlyProgress();
    }

    animateCounters() {
        // Animar contadores del hero
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            this.animateCounter(stat.id, target);
        });
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000; // 2 segundos
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Función de easing (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = targetValue;
            }
        };

        requestAnimationFrame(animate);
    }

    getWeeklyProgress() {
        const now = new Date();
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const weeklyEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekAgo;
        });
        
        return `${weeklyEntries.length}/7`;
    }

    getMonthlyProgress() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyEntries = this.entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= monthStart;
        });
        
        return `${monthlyEntries.length}/30`;
    }

    // === ALMACENAMIENTO ===
    saveEntries() {
        const data = {
            entries: this.entries,
            currentStreak: this.currentStreak,
            totalSessions: this.totalSessions,
            bestStreak: this.bestStreak
        };
        localStorage.setItem('diaryWellness', JSON.stringify(data));
    }

    loadEntries() {
        const data = localStorage.getItem('diaryWellness');
        if (data) {
            const parsed = JSON.parse(data);
            this.entries = parsed.entries || [];
            this.currentStreak = parsed.currentStreak || 0;
            this.totalSessions = parsed.totalSessions || 0;
            this.bestStreak = parsed.bestStreak || 0;
        }
        return this.entries;
    }

    // === SEGUIMIENTO DE ANSIEDAD ===
    initializeAnxietyTracking() {
        // Cargar nivel de ansiedad del día actual si existe
        const today = new Date().toISOString().split('T')[0];
        const todayAnxiety = this.anxietyLevels.find(level => 
            level.date.split('T')[0] === today
        );
        
        if (todayAnxiety) {
            const anxietyScale = document.getElementById('anxiety-scale');
            if (anxietyScale) {
                anxietyScale.value = todayAnxiety.level;
                this.updateAnxietyLevelDisplay(todayAnxiety.level);
            }
        }
    }

    updateAnxietyLevelDisplay(level) {
        const levelDisplay = document.getElementById('current-level-display');
        const levelDescription = document.getElementById('level-description');
        
        if (levelDisplay) {
            levelDisplay.textContent = level;
        }
        
        if (levelDescription) {
            const descriptions = {
                1: 'Muy tranquilo',
                2: 'Tranquilo',
                3: 'Relajado',
                4: 'Ligeramente relajado',
                5: 'Moderado',
                6: 'Ligeramente ansioso',
                7: 'Ansioso',
                8: 'Muy ansioso',
                9: 'Extremadamente ansioso',
                10: 'Pánico'
            };
            levelDescription.textContent = descriptions[level] || 'Moderado';
        }
    }

    async saveAnxietyLevel() {
        const anxietyScale = document.getElementById('anxiety-scale');
        if (!anxietyScale) return;

        const level = parseInt(anxietyScale.value);
        const today = new Date().toISOString();
        
        const anxietyData = {
            date: today,
            level: level,
            timestamp: Date.now()
        };

        // Guardar en Firebase si está disponible
        if (window.firebaseServices) {
            try {
                await window.firebaseServices.saveAnxietyLevel(anxietyData);
                console.log('✅ Nivel de ansiedad guardado en Firebase');
            } catch (error) {
                console.error('❌ Error guardando en Firebase:', error);
                this.saveAnxietyLevelToLocal(anxietyData);
            }
        } else {
            this.saveAnxietyLevelToLocal(anxietyData);
        }

        this.anxietyLevels.unshift(anxietyData);
        this.updateAnxietyChart();
        this.updateAnxietyStats();
        this.updateQuickActionsState();
        this.showNotification('Nivel de ansiedad guardado', 'success');
    }

    saveAnxietyLevelToLocal(anxietyData) {
        this.anxietyLevels.unshift(anxietyData);
        this.saveAnxietyLevels();
    }

    // === PLAN PERSONALIZADO ===
    checkForPersonalizedPlan() {
        // Verificar si hay datos de evaluación de ansiedad
        const evaluationData = this.loadEvaluationData();
        if (evaluationData && evaluationData.anxietyLevel) {
            this.generatePersonalizedPlan(evaluationData.anxietyLevel);
            this.showPersonalizedPlan();
        } else {
            // Simular datos de evaluación para demostración
            this.simulateEvaluationData();
        }
    }

    simulateEvaluationData() {
        // Simular datos de evaluación de ansiedad para demostración
        const simulatedData = {
            anxietyLevel: 6, // Nivel moderado-alto
            testType: 'gad7',
            score: 12,
            maxScore: 21,
            completedAt: new Date().toISOString()
        };
        
        localStorage.setItem('evaluationData', JSON.stringify(simulatedData));
        this.generatePersonalizedPlan(simulatedData.anxietyLevel);
        this.showPersonalizedPlan();
    }

    generatePersonalizedPlan(anxietyLevel) {
        const plans = {
            low: {
                level: 'Bajo',
                description: 'Tu nivel de ansiedad es bajo. Mantén las buenas prácticas.',
                weeklyGoal: 3,
                recommendations: [
                    {
                        title: 'Meditación diaria',
                        description: '10 minutos de meditación mindfulness',
                        duration: '10 min',
                        frequency: 'Diario',
                        priority: 'Alta'
                    },
                    {
                        title: 'Ejercicio físico',
                        description: '30 minutos de actividad física moderada',
                        duration: '30 min',
                        frequency: '3x/semana',
                        priority: 'Media'
                    },
                    {
                        title: 'Respiración profunda',
                        description: 'Técnica de respiración 4-7-8',
                        duration: '5 min',
                        frequency: '2x/día',
                        priority: 'Media'
                    }
                ]
            },
            moderate: {
                level: 'Moderado',
                description: 'Tu nivel de ansiedad requiere atención regular.',
                weeklyGoal: 5,
                recommendations: [
                    {
                        title: 'Respiración profunda',
                        description: 'Ejercicio de respiración guiada',
                        duration: '10 min',
                        frequency: '2x/día',
                        priority: 'Alta'
                    },
                    {
                        title: 'Relajación progresiva',
                        description: 'Técnica de relajación muscular',
                        duration: '15 min',
                        frequency: 'Diario',
                        priority: 'Alta'
                    },
                    {
                        title: 'Grounding 5-4-3-2-1',
                        description: 'Técnica de conexión con el presente',
                        duration: '5 min',
                        frequency: 'Cuando sea necesario',
                        priority: 'Alta'
                    },
                    {
                        title: 'Meditación mindfulness',
                        description: 'Práctica de atención plena',
                        duration: '15 min',
                        frequency: 'Diario',
                        priority: 'Media'
                    },
                    {
                        title: 'Ejercicio físico',
                        description: 'Actividad física regular',
                        duration: '30 min',
                        frequency: '4x/semana',
                        priority: 'Media'
                    }
                ]
            },
            high: {
                level: 'Alto',
                description: 'Tu nivel de ansiedad requiere atención intensiva.',
                weeklyGoal: 7,
                recommendations: [
                    {
                        title: 'Respiración profunda',
                        description: 'Ejercicio de respiración guiada',
                        duration: '15 min',
                        frequency: '3x/día',
                        priority: 'Alta'
                    },
                    {
                        title: 'Grounding 5-4-3-2-1',
                        description: 'Técnica de conexión con el presente',
                        duration: '10 min',
                        frequency: '2x/día',
                        priority: 'Alta'
                    },
                    {
                        title: 'Relajación progresiva',
                        description: 'Técnica de relajación muscular completa',
                        duration: '20 min',
                        frequency: '2x/día',
                        priority: 'Alta'
                    },
                    {
                        title: 'Meditación mindfulness',
                        description: 'Práctica de atención plena',
                        duration: '20 min',
                        frequency: '2x/día',
                        priority: 'Alta'
                    },
                    {
                        title: 'Ejercicio físico',
                        description: 'Actividad física regular',
                        duration: '45 min',
                        frequency: '5x/semana',
                        priority: 'Media'
                    },
                    {
                        title: 'Técnica de visualización',
                        description: 'Imágenes guiadas para relajación',
                        duration: '15 min',
                        frequency: 'Diario',
                        priority: 'Media'
                    },
                    {
                        title: 'Registro de pensamientos',
                        description: 'Anotar pensamientos ansiosos',
                        duration: '10 min',
                        frequency: 'Diario',
                        priority: 'Media'
                    }
                ]
            }
        };

        let planType = 'moderate';
        if (anxietyLevel <= 3) planType = 'low';
        else if (anxietyLevel >= 7) planType = 'high';

        this.personalizedPlan = plans[planType];
        this.savePersonalizedPlan();
    }

    showPersonalizedPlan() {
        const planSection = document.getElementById('personalized-plan-section');
        if (!planSection || !this.personalizedPlan) return;

        // Actualizar estadísticas del plan
        document.getElementById('current-anxiety-level').textContent = this.personalizedPlan.level;
        document.getElementById('anxiety-description').textContent = this.personalizedPlan.description;
        document.getElementById('weekly-goal').textContent = `${this.personalizedPlan.weeklyGoal} actividades`;

        // Generar recomendaciones
        this.generateRecommendations();

        // Mostrar la sección
        planSection.style.display = 'block';
        planSection.scrollIntoView({ behavior: 'smooth' });
    }

    generateRecommendations() {
        const recommendationsGrid = document.getElementById('recommendations-grid');
        if (!recommendationsGrid || !this.personalizedPlan) return;

        recommendationsGrid.innerHTML = '';
        
        this.personalizedPlan.recommendations.forEach((rec, index) => {
            const recCard = document.createElement('div');
            recCard.className = 'recommendation-card';
            recCard.innerHTML = `
                <div class="rec-header">
                    <h4>${rec.title}</h4>
                    <span class="priority-badge priority-${rec.priority.toLowerCase()}">${rec.priority}</span>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-details">
                    <div class="rec-detail">
                        <i class="fas fa-clock"></i>
                        <span>${rec.duration}</span>
                    </div>
                    <div class="rec-detail">
                        <i class="fas fa-repeat"></i>
                        <span>${rec.frequency}</span>
                    </div>
                </div>
                <button class="btn-cta-secondary start-recommendation" data-recommendation="${index}">
                    <i class="fas fa-play"></i>
                    Comenzar
                </button>
            `;
            recommendationsGrid.appendChild(recCard);
        });

        // Añadir event listeners a los botones
        recommendationsGrid.querySelectorAll('.start-recommendation').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.recommendation);
                this.startRecommendation(index);
            });
        });
    }

    startRecommendation(index) {
        const recommendation = this.personalizedPlan.recommendations[index];
        if (!recommendation) return;

        // Mapear recomendaciones a ejercicios existentes
        const exerciseMap = {
            'Respiración profunda': 'breathing',
            'Meditación mindfulness': 'meditation',
            'Relajación progresiva': 'progressive-relaxation',
            'Grounding 5-4-3-2-1': 'grounding'
        };

        const exerciseType = exerciseMap[recommendation.title];
        if (exerciseType) {
            this.startExercise(exerciseType);
        } else {
            this.showNotification(`Iniciando: ${recommendation.title}`, 'info');
        }
    }

    // === ACTIVIDADES DIARIAS ===
    generateDailyActivities(date) {
        const activities = [];
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Actividades base
        activities.push({
            id: 'morning-breathing',
            title: 'Respiración matutina',
            description: '5 minutos de respiración profunda para comenzar el día',
            duration: '5 min',
            time: '08:00',
            completed: false,
            priority: 'Alta'
        });

        if (!isWeekend) {
            activities.push({
                id: 'work-break',
                title: 'Pausa de trabajo',
                description: 'Técnica de grounding durante el trabajo',
                duration: '3 min',
                time: '14:00',
                completed: false,
                priority: 'Media'
            });
        }

        activities.push({
            id: 'evening-reflection',
            title: 'Reflexión nocturna',
            description: 'Escribe sobre tu día y cómo te sientes',
            duration: '10 min',
            time: '20:00',
            completed: false,
            priority: 'Alta'
        });

        if (isWeekend) {
            activities.push({
                id: 'weekend-exercise',
                title: 'Ejercicio físico',
                description: '30 minutos de actividad física',
                duration: '30 min',
                time: '10:00',
                completed: false,
                priority: 'Media'
            });
        }

        return activities;
    }

    showDailyActivities(date) {
        const modal = document.getElementById('daily-activity-modal');
        const activityDate = document.getElementById('activity-date');
        const dailyActivities = document.getElementById('daily-activities');
        
        if (!modal || !activityDate || !dailyActivities) return;

        const dateStr = date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        activityDate.textContent = `Actividades para ${dateStr}`;

        const activities = this.generateDailyActivities(date);
        dailyActivities.innerHTML = '';

        activities.forEach(activity => {
            const activityCard = document.createElement('div');
            activityCard.className = `activity-card ${activity.completed ? 'completed' : ''}`;
            activityCard.innerHTML = `
                <div class="activity-header">
                    <h4>${activity.title}</h4>
                    <span class="activity-time">${activity.time}</span>
                </div>
                <p class="activity-description">${activity.description}</p>
                <div class="activity-details">
                    <div class="activity-duration">
                        <i class="fas fa-clock"></i>
                        <span>${activity.duration}</span>
                    </div>
                    <div class="activity-priority priority-${activity.priority.toLowerCase()}">
                        <i class="fas fa-flag"></i>
                        <span>${activity.priority}</span>
                    </div>
                </div>
                <button class="btn-cta-primary complete-activity" data-activity="${activity.id}">
                    <i class="fas fa-check"></i>
                    ${activity.completed ? 'Completado' : 'Completar'}
                </button>
            `;
            dailyActivities.appendChild(activityCard);
        });

        // Añadir event listeners
        dailyActivities.querySelectorAll('.complete-activity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const activityId = e.target.dataset.activity;
                this.toggleActivityCompletion(activityId, activities);
            });
        });

        modal.classList.add('active');
    }

    toggleActivityCompletion(activityId, activities) {
        const activity = activities.find(a => a.id === activityId);
        if (!activity) return;

        activity.completed = !activity.completed;
        this.updateDailyProgress(activities);
        this.showDailyActivities(new Date()); // Refrescar modal
    }

    updateDailyProgress(activities) {
        const completed = activities.filter(a => a.completed).length;
        const total = activities.length;
        const percentage = (completed / total) * 100;

        const progressFill = document.getElementById('daily-progress-fill');
        const progressText = document.getElementById('daily-progress-text');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${completed}/${total} actividades completadas`;
        }
    }

    closeDailyActivityModal() {
        const modal = document.getElementById('daily-activity-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // === GRÁFICO DE ANSIEDAD ===
    initializeAnxietyChart() {
        const canvas = document.getElementById('anxiety-chart');
        if (!canvas) return;

        this.updateAnxietyChart();
    }

    updateAnxietyChart() {
        const canvas = document.getElementById('anxiety-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.anxietyLevels.slice(0, 7).reverse(); // Últimos 7 días

        if (data.length === 0) {
            ctx.fillStyle = '#e5e7eb';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos suficientes', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Configurar gráfico
        const padding = 40;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        const stepX = chartWidth / (data.length - 1);

        // Dibujar ejes
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Dibujar línea de datos
        ctx.strokeStyle = '#7c8ce0';
        ctx.lineWidth = 3;
        ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (index * stepX);
            const y = canvas.height - padding - ((point.level - 1) / 9) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Dibujar puntos
        ctx.fillStyle = '#7c8ce0';
        data.forEach((point, index) => {
            const x = padding + (index * stepX);
            const y = canvas.height - padding - ((point.level - 1) / 9) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    updateAnxietyStats() {
        if (this.anxietyLevels.length === 0) return;

        // Promedio semanal
        const weeklyData = this.anxietyLevels.slice(0, 7);
        const weeklyAverage = (weeklyData.reduce((sum, level) => sum + level.level, 0) / weeklyData.length).toFixed(1);
        
        const weeklyAverageEl = document.getElementById('weekly-average');
        if (weeklyAverageEl) {
            weeklyAverageEl.textContent = weeklyAverage;
        }

        // Tendencia
        if (this.anxietyLevels.length >= 2) {
            const recent = this.anxietyLevels[0].level;
            const previous = this.anxietyLevels[1].level;
            const trend = recent < previous ? 'Mejorando' : recent > previous ? 'Empeorando' : 'Estable';
            
            const trendEl = document.getElementById('anxiety-trend');
            if (trendEl) {
                trendEl.textContent = trend;
                trendEl.className = `stat-value trend-${trend.toLowerCase()}`;
            }
        }
    }

    // === ALMACENAMIENTO ADICIONAL ===
    loadAnxietyLevels() {
        const data = localStorage.getItem('anxietyLevels');
        return data ? JSON.parse(data) : [];
    }

    saveAnxietyLevels() {
        localStorage.setItem('anxietyLevels', JSON.stringify(this.anxietyLevels));
    }

    loadPersonalizedPlan() {
        const data = localStorage.getItem('personalizedPlan');
        return data ? JSON.parse(data) : null;
    }

    savePersonalizedPlan() {
        localStorage.setItem('personalizedPlan', JSON.stringify(this.personalizedPlan));
    }

    loadDailyActivities() {
        const data = localStorage.getItem('dailyActivities');
        return data ? JSON.parse(data) : {};
    }

    saveDailyActivities() {
        localStorage.setItem('dailyActivities', JSON.stringify(this.dailyActivities));
    }

    loadEvaluationData() {
        const data = localStorage.getItem('evaluationData');
        return data ? JSON.parse(data) : null;
    }

    // === QUICK ACTIONS ===
    initializeQuickActions() {
        // Las quick actions ya están configuradas en setupEventListeners
        this.updateQuickActionsState();
    }

    showQuickMoodCheck() {
        // Scroll a la sección de seguimiento de ansiedad
        const anxietySection = document.querySelector('.anxiety-tracking-section');
        if (anxietySection) {
            anxietySection.scrollIntoView({ behavior: 'smooth' });
            // Resaltar el slider
            setTimeout(() => {
                const slider = document.getElementById('anxiety-scale');
                if (slider) {
                    slider.focus();
                    slider.style.boxShadow = '0 0 0 3px rgba(124, 140, 224, 0.3)';
                    setTimeout(() => {
                        slider.style.boxShadow = '';
                    }, 2000);
                }
            }, 500);
        }
    }

    scrollToReflection() {
        const reflectionSection = document.querySelector('.reflection-section-enhanced');
        if (reflectionSection) {
            reflectionSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    scrollToProgress() {
        const calendarSection = document.querySelector('.calendar-section-enhanced');
        if (calendarSection) {
            calendarSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateQuickActionsState() {
        // Actualizar estado de las quick actions basado en el progreso del día
        const today = new Date().toISOString().split('T')[0];
        const todayAnxiety = this.anxietyLevels.find(level => 
            level.date.split('T')[0] === today
        );
        const todayEntry = this.entries.find(entry => 
            entry.date.split('T')[0] === today
        );

        // Actualizar botones con estado visual
        const quickMoodBtn = document.getElementById('quick-mood-check');
        const quickReflectionBtn = document.getElementById('quick-reflection');

        if (quickMoodBtn) {
            if (todayAnxiety) {
                quickMoodBtn.classList.add('completed');
                quickMoodBtn.innerHTML = '<i class="fas fa-check"></i><span>Completado</span>';
            }
        }

        if (quickReflectionBtn) {
            if (todayEntry) {
                quickReflectionBtn.classList.add('completed');
                quickReflectionBtn.innerHTML = '<i class="fas fa-check"></i><span>Completado</span>';
            }
        }
    }

    // === LOGROS Y MOTIVACIÓN ===
    initializeAchievements() {
        this.loadAchievements();
        this.updateMotivationQuote();
    }

    loadAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid) return;

        const achievements = this.calculateAchievements();
        achievementsGrid.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementCard = document.createElement('div');
            achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <div class="achievement-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${achievement.progress}%"></div>
                        </div>
                        <span class="progress-text">${achievement.progress}%</span>
                    </div>
                </div>
            `;
            achievementsGrid.appendChild(achievementCard);
        });
    }

    calculateAchievements() {
        const achievements = [
            {
                id: 'first_entry',
                title: 'Primer Paso',
                description: 'Escribe tu primera reflexión',
                icon: 'fas fa-pen',
                unlocked: this.entries.length > 0,
                progress: Math.min((this.entries.length / 1) * 100, 100)
            },
            {
                id: 'week_streak',
                title: 'Constancia',
                description: '7 días consecutivos de reflexión',
                icon: 'fas fa-calendar-check',
                unlocked: this.currentStreak >= 7,
                progress: Math.min((this.currentStreak / 7) * 100, 100)
            },
            {
                id: 'month_streak',
                title: 'Dedicación',
                description: '30 días consecutivos de reflexión',
                icon: 'fas fa-trophy',
                unlocked: this.currentStreak >= 30,
                progress: Math.min((this.currentStreak / 30) * 100, 100)
            },
            {
                id: 'exercises_master',
                title: 'Maestro de Ejercicios',
                description: 'Completa 50 sesiones de ejercicios',
                icon: 'fas fa-dumbbell',
                unlocked: this.totalSessions >= 50,
                progress: Math.min((this.totalSessions / 50) * 100, 100)
            },
            {
                id: 'mood_tracker',
                title: 'Observador de Emociones',
                description: 'Registra tu estado de ánimo por 14 días',
                icon: 'fas fa-heart',
                unlocked: this.anxietyLevels.length >= 14,
                progress: Math.min((this.anxietyLevels.length / 14) * 100, 100)
            },
            {
                id: 'wellness_journey',
                title: 'Viajero del Bienestar',
                description: '100 entradas en tu diario',
                icon: 'fas fa-book',
                unlocked: this.entries.length >= 100,
                progress: Math.min((this.entries.length / 100) * 100, 100)
            }
        ];

        return achievements;
    }

    updateMotivationQuote() {
        const motivationText = document.getElementById('motivation-text');
        if (!motivationText) return;

        const quotes = [
            "Cada pequeño paso hacia el bienestar es una victoria que merece ser celebrada.",
            "La constancia es la clave del éxito en tu viaje hacia el bienestar mental.",
            "Recuerda: el progreso, no la perfección, es lo que importa.",
            "Tu bienestar mental es una inversión, no un gasto.",
            "Cada día es una nueva oportunidad para cuidar de ti mismo.",
            "La ansiedad es temporal, pero tu fuerza es permanente.",
            "Celebra cada logro, por pequeño que sea.",
            "Tu bienestar es tu superpoder más importante."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        motivationText.textContent = randomQuote;
    }

    // === RECORDATORIOS ===
    initializeReminders() {
        this.loadReminderSettings();
        this.updateReminderCount();
    }

    loadReminderSettings() {
        const settings = this.getReminderSettings();
        
        document.getElementById('morning-reminder').checked = settings.morning;
        document.getElementById('evening-reminder').checked = settings.evening;
        document.getElementById('weekly-reminder').checked = settings.weekly;
    }

    getReminderSettings() {
        const settings = localStorage.getItem('reminderSettings');
        return settings ? JSON.parse(settings) : {
            morning: true,
            evening: true,
            weekly: false
        };
    }

    saveReminderSettings(settings) {
        localStorage.setItem('reminderSettings', JSON.stringify(settings));
    }

    updateReminderSettings(reminderId, enabled) {
        const settings = this.getReminderSettings();
        
        switch (reminderId) {
            case 'morning-reminder':
                settings.morning = enabled;
                break;
            case 'evening-reminder':
                settings.evening = enabled;
                break;
            case 'weekly-reminder':
                settings.weekly = enabled;
                break;
        }
        
        this.saveReminderSettings(settings);
        this.updateReminderCount();
        this.showNotification(
            enabled ? 'Recordatorio activado' : 'Recordatorio desactivado', 
            'success'
        );
    }

    updateReminderCount() {
        const settings = this.getReminderSettings();
        const count = Object.values(settings).filter(Boolean).length;
        
        const countElement = document.getElementById('active-reminders-count');
        if (countElement) {
            countElement.textContent = `${count} recordatorio${count !== 1 ? 's' : ''} configurado${count !== 1 ? 's' : ''}`;
        }
    }

    // === ANÁLISIS E INSIGHTS ===
    initializeAnalytics() {
        this.generateMoodPatterns();
        this.generateEffectivenessChart();
        this.generateInsights();
    }

    generateMoodPatterns() {
        const moodPatterns = document.getElementById('mood-patterns');
        if (!moodPatterns || this.entries.length === 0) return;

        // Analizar patrones de estado de ánimo
        const moodCounts = {};
        this.entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        const totalEntries = this.entries.length;
        const moodLabels = {
            calm: 'Tranquilo',
            relaxed: 'Relajado',
            neutral: 'Neutral',
            anxious: 'Ansioso',
            overwhelmed: 'Abrumado'
        };

        const moodEmojis = {
            calm: '😌',
            relaxed: '😊',
            neutral: '😐',
            anxious: '😰',
            overwhelmed: '😵'
        };

        moodPatterns.innerHTML = '';
        Object.entries(moodCounts).forEach(([mood, count]) => {
            const percentage = Math.round((count / totalEntries) * 100);
            const patternItem = document.createElement('div');
            patternItem.className = 'mood-pattern-item';
            patternItem.innerHTML = `
                <div class="mood-emoji">${moodEmojis[mood]}</div>
                <div class="mood-info">
                    <span class="mood-label">${moodLabels[mood]}</span>
                    <div class="mood-bar">
                        <div class="mood-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span class="mood-percentage">${percentage}%</span>
                </div>
            `;
            moodPatterns.appendChild(patternItem);
        });
    }

    generateEffectivenessChart() {
        const effectivenessChart = document.getElementById('effectiveness-chart');
        if (!effectivenessChart) return;

        // Simular datos de efectividad de ejercicios
        const exerciseData = {
            'breathing': { count: 15, effectiveness: 85 },
            'meditation': { count: 12, effectiveness: 78 },
            'progressive-relaxation': { count: 8, effectiveness: 92 },
            'grounding': { count: 10, effectiveness: 88 }
        };

        effectivenessChart.innerHTML = '';
        Object.entries(exerciseData).forEach(([exercise, data]) => {
            const exerciseItem = document.createElement('div');
            exerciseItem.className = 'effectiveness-item';
            exerciseItem.innerHTML = `
                <div class="exercise-name">${this.getExerciseName(exercise)}</div>
                <div class="effectiveness-bar">
                    <div class="effectiveness-fill" style="width: ${data.effectiveness}%"></div>
                </div>
                <div class="effectiveness-stats">
                    <span class="effectiveness-score">${data.effectiveness}%</span>
                    <span class="exercise-count">${data.count} sesiones</span>
                </div>
            `;
            effectivenessChart.appendChild(exerciseItem);
        });
    }

    getExerciseName(exerciseType) {
        const names = {
            'breathing': 'Respiración Profunda',
            'meditation': 'Meditación',
            'progressive-relaxation': 'Relajación Progresiva',
            'grounding': 'Grounding'
        };
        return names[exerciseType] || exerciseType;
    }

    generateInsights() {
        const insightsList = document.getElementById('insights-list');
        if (!insightsList) return;

        const insights = this.calculateInsights();
        insightsList.innerHTML = '';

        insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.className = `insight-item ${insight.type}`;
            insightItem.innerHTML = `
                <div class="insight-icon">
                    <i class="${insight.icon}"></i>
                </div>
                <div class="insight-content">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            `;
            insightsList.appendChild(insightItem);
        });
    }

    calculateInsights() {
        const insights = [];

        // Insight sobre constancia
        if (this.currentStreak >= 7) {
            insights.push({
                type: 'positive',
                icon: 'fas fa-fire',
                title: '¡Excelente constancia!',
                description: `Llevas ${this.currentStreak} días consecutivos cuidando tu bienestar mental.`
            });
        }

        // Insight sobre progreso de ansiedad
        if (this.anxietyLevels.length >= 7) {
            const recentLevels = this.anxietyLevels.slice(0, 7).map(l => l.level);
            const average = recentLevels.reduce((a, b) => a + b, 0) / recentLevels.length;
            
            if (average < 5) {
                insights.push({
                    type: 'positive',
                    icon: 'fas fa-trending-down',
                    title: '¡Buen control de la ansiedad!',
                    description: 'Tu nivel promedio de ansiedad ha sido bajo en la última semana.'
                });
            } else if (average > 7) {
                insights.push({
                    type: 'suggestion',
                    icon: 'fas fa-lightbulb',
                    title: 'Considera más ejercicios',
                    description: 'Tu nivel de ansiedad ha estado alto. Te recomendamos más sesiones de relajación.'
                });
            }
        }

        // Insight sobre ejercicios favoritos
        if (this.totalSessions > 0) {
            insights.push({
                type: 'info',
                icon: 'fas fa-star',
                title: 'Actividad regular',
                description: `Has completado ${this.totalSessions} sesiones de ejercicios. ¡Sigue así!`
            });
        }

        // Insight sobre reflexiones
        if (this.entries.length > 0) {
            const avgWords = this.entries.reduce((sum, entry) => sum + entry.wordCount, 0) / this.entries.length;
            if (avgWords > 50) {
                insights.push({
                    type: 'positive',
                    icon: 'fas fa-pen-fancy',
                    title: 'Reflexiones detalladas',
                    description: 'Tus reflexiones son muy detalladas, lo que ayuda en tu proceso de autoconocimiento.'
                });
            }
        }

        return insights.slice(0, 3); // Mostrar máximo 3 insights
    }

    // === SISTEMA DE ETIQUETAS ===
    initializeTags() {
        this.setupTagEventListeners();
        this.updateTagSuggestions();
    }

    setupTagEventListeners() {
        // Event listener para el input de etiquetas
        const tagInput = document.getElementById('entry-tags');
        if (tagInput) {
            tagInput.addEventListener('input', (e) => {
                this.handleTagInput(e);
            });

            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    this.addTagFromInput();
                }
            });
        }

        // Event listener para sugerencias de etiquetas
        const tagSuggestions = document.getElementById('tag-suggestions');
        if (tagSuggestions) {
            tagSuggestions.addEventListener('click', (e) => {
                if (e.target.classList.contains('tag-suggestion')) {
                    this.addTag(e.target.dataset.tag);
                }
            });
        }

        // Event listener para etiquetas existentes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                this.removeTag(e.target.dataset.tag);
            }
        });
    }

    handleTagInput(e) {
        const input = e.target;
        const value = input.value.trim();
        
        if (value.length > 0) {
            this.showTagSuggestions(value);
        } else {
            this.hideTagSuggestions();
        }
    }

    showTagSuggestions(query) {
        const suggestions = this.getTagSuggestions(query);
        const container = document.getElementById('tag-suggestions');
        
        if (!container) return;

        container.innerHTML = '';
        
        if (suggestions.length === 0) {
            container.innerHTML = `
                <div class="tag-suggestion" data-tag="${query}">
                    <i class="fas fa-plus"></i>
                    Crear "${query}"
                </div>
            `;
        } else {
            suggestions.forEach(tag => {
                const suggestion = document.createElement('div');
                suggestion.className = 'tag-suggestion';
                suggestion.dataset.tag = tag.name;
                suggestion.innerHTML = `
                    <i class="fas fa-tag"></i>
                    ${tag.name}
                    <span class="tag-count">${tag.count}</span>
                `;
                container.appendChild(suggestion);
            });
        }
        
        container.style.display = 'block';
    }

    hideTagSuggestions() {
        const container = document.getElementById('tag-suggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    getTagSuggestions(query) {
        const queryLower = query.toLowerCase();
        return this.availableTags
            .filter(tag => tag.name.toLowerCase().includes(queryLower))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    addTagFromInput() {
        const input = document.getElementById('entry-tags');
        if (!input) return;

        const tagName = input.value.trim();
        if (tagName && !this.hasTag(tagName)) {
            this.addTag(tagName);
            input.value = '';
            this.hideTagSuggestions();
        }
    }

    addTag(tagName) {
        if (!tagName || this.hasTag(tagName)) return;

        const tag = {
            id: Date.now(),
            name: tagName.toLowerCase(),
            color: this.getTagColor(),
            createdAt: new Date().toISOString()
        };

        this.tags.push(tag);
        this.updateAvailableTags();
        this.updateTagDisplay();
        this.saveTags();
        this.showNotification(`Etiqueta "${tagName}" añadida`, 'success');
    }

    removeTag(tagName) {
        this.tags = this.tags.filter(tag => tag.name !== tagName);
        this.updateAvailableTags();
        this.updateTagDisplay();
        this.saveTags();
        this.showNotification(`Etiqueta "${tagName}" eliminada`, 'info');
    }

    hasTag(tagName) {
        return this.tags.some(tag => tag.name === tagName.toLowerCase());
    }

    getTagColor() {
        const colors = [
            '#7c8ce0', '#4ade80', '#fbbf24', '#f87171', 
            '#a78bfa', '#06b6d4', '#f97316', '#84cc16'
        ];
        return colors[this.tags.length % colors.length];
    }

    updateTagDisplay() {
        const container = document.getElementById('selected-tags');
        if (!container) return;

        container.innerHTML = '';
        
        this.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.style.backgroundColor = tag.color;
            tagElement.innerHTML = `
                ${tag.name}
                <button class="tag-remove" data-tag="${tag.name}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(tagElement);
        });
    }

    updateAvailableTags() {
        const tagCounts = {};
        
        // Contar etiquetas de entradas existentes
        this.entries.forEach(entry => {
            if (entry.tags) {
                entry.tags.forEach(tag => {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                });
            }
        });

        // Actualizar lista de etiquetas disponibles
        this.availableTags = Object.entries(tagCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }

    updateTagSuggestions() {
        this.updateAvailableTags();
    }

    updateTagFilter() {
        const tagFilter = document.getElementById('tag-filter');
        if (!tagFilter) return;

        // Limpiar opciones existentes excepto "Todas las etiquetas"
        tagFilter.innerHTML = '<option value="all">Todas las etiquetas</option>';

        // Añadir etiquetas disponibles
        this.availableTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.name;
            option.textContent = `${tag.name} (${tag.count})`;
            tagFilter.appendChild(option);
        });
    }

    updateLastSaveTime() {
        const lastSaveTimeElement = document.getElementById('last-save-time');
        if (lastSaveTimeElement) {
            lastSaveTimeElement.textContent = this.getLastSaveTime();
        }
    }

    // === RESPALDO AUTOMÁTICO ===
    initializeAutoSave() {
        // Respaldo automático cada 30 segundos
        this.autoSaveInterval = setInterval(() => {
            this.performAutoSave();
        }, 30000);

        // Respaldo al cerrar la página
        window.addEventListener('beforeunload', () => {
            this.performAutoSave();
        });

        // Respaldo cuando se pierde el foco de la ventana
        window.addEventListener('blur', () => {
            this.performAutoSave();
        });
    }

    performAutoSave() {
        try {
            // Guardar datos principales
            this.saveEntries();
            this.saveAnxietyLevels();
            this.savePersonalizedPlan();
            this.saveTags();
            this.saveDailyActivities();

            // Actualizar timestamp del último respaldo
            this.lastSaveTime = new Date().toISOString();
            localStorage.setItem('lastAutoSave', this.lastSaveTime);

            // Mostrar indicador de respaldo (opcional)
            this.showAutoSaveIndicator();
        } catch (error) {
            console.error('Error en respaldo automático:', error);
        }
    }

    showAutoSaveIndicator() {
        // Crear indicador visual sutil
        const indicator = document.createElement('div');
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--diary-success);
            color: white;
            padding: 0.5rem;
            border-radius: 50%;
            font-size: 0.875rem;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(indicator);

        // Mostrar indicador
        setTimeout(() => {
            indicator.style.opacity = '1';
        }, 100);

        // Ocultar indicador después de 2 segundos
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            }, 300);
        }, 2000);
    }

    getLastSaveTime() {
        const lastSave = localStorage.getItem('lastAutoSave');
        return lastSave ? new Date(lastSave).toLocaleString('es-ES') : 'Nunca';
    }

    // === ACCESIBILIDAD ===
    initializeAccessibility() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupHighContrastMode();
    }

    setupKeyboardNavigation() {
        // Navegación por teclado para ejercicios
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                if (target.classList.contains('start-exercise')) {
                    e.preventDefault();
                    target.click();
                }
            }
        });

        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para guardar reflexión
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const saveBtn = document.getElementById('save-reflection');
                if (saveBtn && !saveBtn.disabled) {
                    saveBtn.click();
                }
            }

            // Ctrl + N para nueva reflexión
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.clearReflection();
            }

            // Escape para cerrar modales
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Tab para navegación mejorada
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }
        });
    }

    setupScreenReaderSupport() {
        // Añadir roles ARIA a elementos dinámicos
        this.addAriaRoles();
        
        // Configurar live regions para actualizaciones dinámicas
        this.setupLiveRegions();
        
        // Mejorar etiquetas para lectores de pantalla
        this.enhanceScreenReaderLabels();
    }

    addAriaRoles() {
        // Ejercicios
        document.querySelectorAll('.exercise-card').forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Ejercicio: ${card.querySelector('h3').textContent}`);
        });

        // Estados de ánimo
        document.querySelectorAll('.mood-btn, .mood-btn-enhanced').forEach(btn => {
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
        });

        // Modal de ejercicio
        const exerciseModal = document.getElementById('exercise-modal');
        if (exerciseModal) {
            exerciseModal.setAttribute('role', 'dialog');
            exerciseModal.setAttribute('aria-modal', 'true');
            exerciseModal.setAttribute('aria-labelledby', 'modal-title');
        }
    }

    setupLiveRegions() {
        // Crear región live para notificaciones
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    enhanceScreenReaderLabels() {
        // Mejorar etiquetas de formularios
        const textarea = document.getElementById('reflection-text');
        if (textarea) {
            textarea.setAttribute('aria-label', 'Escribe tu reflexión personal');
            textarea.setAttribute('aria-describedby', 'char-count');
        }

        // Mejorar etiquetas de filtros
        const searchInput = document.getElementById('search-entries');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Buscar en reflexiones');
            searchInput.setAttribute('aria-describedby', 'results-counter');
        }

        // Mejorar etiquetas de etiquetas
        const tagInput = document.getElementById('entry-tags');
        if (tagInput) {
            tagInput.setAttribute('aria-label', 'Añadir etiquetas a tu reflexión');
            tagInput.setAttribute('aria-describedby', 'selected-tags');
        }
    }

    setupFocusManagement() {
        // Manejar foco en modales
        this.setupModalFocus();
        
        // Restaurar foco después de acciones
        this.setupFocusRestoration();
    }

    setupModalFocus() {
        const modals = document.querySelectorAll('.exercise-modal, .daily-activity-modal');
        modals.forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(modal, e);
                }
            });
        });
    }

    trapFocus(modal, e) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupFocusRestoration() {
        let lastFocusedElement = null;
        
        document.addEventListener('focusin', (e) => {
            lastFocusedElement = e.target;
        });

        // Restaurar foco después de cerrar modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal')) {
                setTimeout(() => {
                    if (lastFocusedElement) {
                        lastFocusedElement.focus();
                    }
                }, 100);
            }
        });
    }

    setupHighContrastMode() {
        // Detectar preferencia de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Escuchar cambios en preferencias
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    handleTabNavigation(e) {
        // Mejorar navegación con Tab
        const focusableElements = document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Navegación hacia atrás
            if (currentIndex > 0) {
                focusableElements[currentIndex - 1].focus();
            } else {
                focusableElements[focusableElements.length - 1].focus();
            }
        } else {
            // Navegación hacia adelante
            if (currentIndex < focusableElements.length - 1) {
                focusableElements[currentIndex + 1].focus();
            } else {
                focusableElements[0].focus();
            }
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.exercise-modal, .daily-activity-modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // === SISTEMA DE OBJETIVOS ===
    initializeGoals() {
        this.goals = this.loadGoals();
        this.setupGoalEventListeners();
        this.updateGoalsDisplay();
        this.updateGoalProgress();
    }

    setupGoalEventListeners() {
        // Botón para crear objetivo
        const createGoalBtn = document.getElementById('create-goal');
        if (createGoalBtn) {
            createGoalBtn.addEventListener('click', () => {
                this.showCreateGoalModal();
            });
        }

        // Botón para cerrar modal de objetivo
        const closeGoalModal = document.getElementById('close-goal-modal');
        if (closeGoalModal) {
            closeGoalModal.addEventListener('click', () => {
                this.closeGoalModal();
            });
        }

        // Formulario de creación de objetivo
        const goalForm = document.getElementById('goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const isEditing = goalForm.dataset.editing;
                if (isEditing) {
                    this.updateGoal(parseInt(isEditing));
                } else {
                    this.createGoal();
                }
            });
        }

        // Botón cancelar objetivo
        const cancelGoalBtn = document.getElementById('cancel-goal');
        if (cancelGoalBtn) {
            cancelGoalBtn.addEventListener('click', () => {
                this.closeGoalModal();
            });
        }
    }

    showCreateGoalModal() {
        const modal = document.getElementById('goal-modal');
        if (modal) {
            modal.classList.add('active');
            // Enfocar el primer campo
            const titleInput = document.getElementById('goal-title');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 100);
            }
        }
    }

    closeGoalModal() {
        const modal = document.getElementById('goal-modal');
        if (modal) {
            modal.classList.remove('active');
            const form = document.getElementById('goal-form');
            form.reset();
            delete form.dataset.editing;
        }
    }

    createGoal() {
        const title = document.getElementById('goal-title').value.trim();
        const description = document.getElementById('goal-description').value.trim();
        const targetValue = parseInt(document.getElementById('goal-target').value);
        const category = document.getElementById('goal-category').value;
        const deadline = document.getElementById('goal-deadline').value;

        if (!title || !targetValue) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        const goal = {
            id: Date.now(),
            title,
            description,
            targetValue,
            currentValue: 0,
            category,
            deadline: deadline ? new Date(deadline).toISOString() : null,
            createdAt: new Date().toISOString(),
            completed: false,
            completedAt: null
        };

        this.goals.push(goal);
        this.saveGoals();
        this.updateGoalsDisplay();
        this.closeGoalModal();
        this.showNotification('Objetivo creado exitosamente', 'success');
        this.announceToScreenReader(`Nuevo objetivo creado: ${title}`);
    }

    updateGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const title = document.getElementById('goal-title').value.trim();
        const description = document.getElementById('goal-description').value.trim();
        const targetValue = parseInt(document.getElementById('goal-target').value);
        const category = document.getElementById('goal-category').value;
        const deadline = document.getElementById('goal-deadline').value;

        if (!title || !targetValue) {
            this.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        // Actualizar objetivo existente
        goal.title = title;
        goal.description = description;
        goal.targetValue = targetValue;
        goal.category = category;
        goal.deadline = deadline ? new Date(deadline).toISOString() : null;

        // Si el progreso actual supera el nuevo objetivo, ajustarlo
        if (goal.currentValue > targetValue) {
            goal.currentValue = targetValue;
        }

        // Verificar si está completado
        if (goal.currentValue >= targetValue && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
        } else if (goal.currentValue < targetValue && goal.completed) {
            goal.completed = false;
            goal.completedAt = null;
        }

        this.saveGoals();
        this.updateGoalsDisplay();
        this.closeGoalModal();
        this.showNotification('Objetivo actualizado exitosamente', 'success');
        this.announceToScreenReader(`Objetivo actualizado: ${title}`);
    }

    updateGoalsDisplay() {
        const goalsContainer = document.getElementById('goals-list');
        if (!goalsContainer) return;

        goalsContainer.innerHTML = '';

        if (this.goals.length === 0) {
            goalsContainer.innerHTML = `
                <div class="no-goals-message">
                    <i class="fas fa-bullseye"></i>
                    <h3>No tienes objetivos aún</h3>
                    <p>Crea tu primer objetivo para comenzar a mejorar tu bienestar</p>
                </div>
            `;
            return;
        }

        this.goals.forEach(goal => {
            const goalElement = this.createGoalElement(goal);
            goalsContainer.appendChild(goalElement);
        });
    }

    createGoalElement(goal) {
        const goalDiv = document.createElement('div');
        goalDiv.className = `goal-card ${goal.completed ? 'completed' : ''}`;
        goalDiv.setAttribute('role', 'article');
        goalDiv.setAttribute('aria-labelledby', `goal-title-${goal.id}`);

        const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
        const daysLeft = goal.deadline ? this.getDaysLeft(goal.deadline) : null;

        goalDiv.innerHTML = `
            <div class="goal-header">
                <h3 id="goal-title-${goal.id}" class="goal-title">${goal.title}</h3>
                <div class="goal-actions">
                    <button class="btn-goal-action" onclick="diaryWellness.editGoal(${goal.id})" aria-label="Editar objetivo">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-goal-action" onclick="diaryWellness.deleteGoal(${goal.id})" aria-label="Eliminar objetivo">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="goal-content">
                <p class="goal-description">${goal.description}</p>
                
                <div class="goal-progress">
                    <div class="progress-info">
                        <span class="progress-text">${goal.currentValue}/${goal.targetValue}</span>
                        <span class="progress-percentage">${Math.round(progress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="goal-meta">
                    <span class="goal-category">${this.getCategoryLabel(goal.category)}</span>
                    ${daysLeft !== null ? `<span class="goal-deadline">${daysLeft} días restantes</span>` : ''}
                </div>
            </div>

            <div class="goal-controls">
                <button class="btn-goal-update" onclick="diaryWellness.updateGoalProgress(${goal.id})">
                    <i class="fas fa-plus"></i>
                    Actualizar Progreso
                </button>
            </div>
        `;

        return goalDiv;
    }

    getCategoryLabel(category) {
        const categories = {
            'exercises': 'Ejercicios',
            'reflections': 'Reflexiones',
            'streak': 'Racha',
            'wellness': 'Bienestar',
            'custom': 'Personalizado'
        };
        return categories[category] || category;
    }

    getDaysLeft(deadline) {
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    updateGoalProgress(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const increment = prompt(`¿Cuánto quieres añadir al progreso de "${goal.title}"?`, '1');
        if (increment === null) return;

        const value = parseInt(increment);
        if (isNaN(value) || value <= 0) {
            this.showNotification('Por favor ingresa un número válido', 'error');
            return;
        }

        goal.currentValue = Math.min(goal.currentValue + value, goal.targetValue);
        
        if (goal.currentValue >= goal.targetValue && !goal.completed) {
            goal.completed = true;
            goal.completedAt = new Date().toISOString();
            this.showNotification(`¡Objetivo completado: ${goal.title}!`, 'success');
            this.announceToScreenReader(`Objetivo completado: ${goal.title}`);
        }

        this.saveGoals();
        this.updateGoalsDisplay();
        this.updateGoalProgress();
    }

    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        // Llenar formulario con datos existentes
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-description').value = goal.description;
        document.getElementById('goal-target').value = goal.targetValue;
        document.getElementById('goal-category').value = goal.category;
        document.getElementById('goal-deadline').value = goal.deadline ? goal.deadline.split('T')[0] : '';

        this.showCreateGoalModal();
        
        // Cambiar comportamiento del formulario para edición
        const form = document.getElementById('goal-form');
        form.dataset.editing = goalId;
    }

    deleteGoal(goalId) {
        if (confirm('¿Estás seguro de que quieres eliminar este objetivo?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveGoals();
            this.updateGoalsDisplay();
            this.showNotification('Objetivo eliminado', 'info');
        }
    }

    updateGoalProgress() {
        // Actualizar progreso general de objetivos
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(g => g.completed).length;
        const progressPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

        const progressElement = document.getElementById('goals-progress');
        if (progressElement) {
            progressElement.textContent = `${completedGoals}/${totalGoals} objetivos completados (${progressPercentage}%)`;
        }
    }

    // === RECORDATORIOS INTELIGENTES ===
    initializeSmartReminders() {
        this.reminders = this.loadReminders();
        this.reminderPatterns = this.loadReminderPatterns();
        this.setupReminderEventListeners();
        this.analyzeUserPatterns();
        this.scheduleSmartReminders();
    }

    setupReminderEventListeners() {
        // Botón para configurar recordatorios
        const setupRemindersBtn = document.getElementById('setup-reminders');
        if (setupRemindersBtn) {
            setupRemindersBtn.addEventListener('click', () => {
                this.showReminderSetupModal();
            });
        }

        // Botón para cerrar modal de recordatorios
        const closeReminderModal = document.getElementById('close-reminder-modal');
        if (closeReminderModal) {
            closeReminderModal.addEventListener('click', () => {
                this.closeReminderModal();
            });
        }

        // Formulario de configuración de recordatorios
        const reminderForm = document.getElementById('reminder-form');
        if (reminderForm) {
            reminderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveReminderSettings();
            });
        }

        // Botón para desactivar recordatorios
        const disableRemindersBtn = document.getElementById('disable-reminders');
        if (disableRemindersBtn) {
            disableRemindersBtn.addEventListener('click', () => {
                this.disableAllReminders();
            });
        }
    }

    analyzeUserPatterns() {
        if (this.entries.length < 7) return; // Necesitamos al menos una semana de datos

        const patterns = {
            mostActiveDays: this.getMostActiveDays(),
            preferredTimes: this.getPreferredTimes(),
            moodPatterns: this.getMoodPatterns(),
            exercisePatterns: this.getExercisePatterns(),
            streakPatterns: this.getStreakPatterns()
        };

        this.userPatterns = patterns;
        this.generateSmartReminders(patterns);
    }

    getMostActiveDays() {
        const dayCounts = {};
        this.entries.forEach(entry => {
            const day = new Date(entry.date).getDay();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        return Object.entries(dayCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([day, count]) => ({ day: parseInt(day), count }));
    }

    getPreferredTimes() {
        const timeCounts = {};
        this.entries.forEach(entry => {
            const hour = new Date(entry.date).getHours();
            const timeSlot = this.getTimeSlot(hour);
            timeCounts[timeSlot] = (timeCounts[timeSlot] || 0) + 1;
        });

        return Object.entries(timeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([slot, count]) => ({ slot, count }));
    }

    getTimeSlot(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 18) return 'afternoon';
        if (hour >= 18 && hour < 22) return 'evening';
        return 'night';
    }

    getMoodPatterns() {
        const moodCounts = {};
        this.entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
        });

        const total = this.entries.length;
        return Object.entries(moodCounts)
            .map(([mood, count]) => ({ mood, count, percentage: (count / total) * 100 }))
            .sort((a, b) => b.count - a.count);
    }

    getExercisePatterns() {
        const exerciseCounts = {};
        this.entries.forEach(entry => {
            if (entry.exercise && entry.exercise !== 'none') {
                exerciseCounts[entry.exercise] = (exerciseCounts[entry.exercise] || 0) + 1;
            }
        });

        return Object.entries(exerciseCounts)
            .sort(([,a], [,b]) => b - a)
            .map(([exercise, count]) => ({ exercise, count }));
    }

    getStreakPatterns() {
        const streaks = [];
        let currentStreak = 0;
        let lastDate = null;

        this.entries
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(entry => {
                const entryDate = new Date(entry.date).toDateString();
                if (lastDate && this.isConsecutiveDay(lastDate, entryDate)) {
                    currentStreak++;
                } else {
                    if (currentStreak > 0) {
                        streaks.push(currentStreak);
                    }
                    currentStreak = 1;
                }
                lastDate = entryDate;
            });

        if (currentStreak > 0) {
            streaks.push(currentStreak);
        }

        return {
            average: streaks.length > 0 ? streaks.reduce((a, b) => a + b, 0) / streaks.length : 0,
            longest: Math.max(...streaks, 0),
            current: currentStreak
        };
    }

    isConsecutiveDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    generateSmartReminders(patterns) {
        const smartReminders = [];

        // Recordatorio basado en días más activos
        if (patterns.mostActiveDays.length > 0) {
            const mostActiveDay = patterns.mostActiveDays[0];
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            
            smartReminders.push({
                id: 'active-day-reminder',
                type: 'pattern_based',
                title: 'Día de mayor actividad',
                message: `Los ${dayNames[mostActiveDay.day]} son tus días más productivos. ¿Cómo te sientes hoy?`,
                trigger: 'day_of_week',
                dayOfWeek: mostActiveDay.day,
                time: '09:00',
                enabled: true,
                priority: 'medium'
            });
        }

        // Recordatorio basado en horarios preferidos
        if (patterns.preferredTimes.length > 0) {
            const preferredTime = patterns.preferredTimes[0];
            const timeMap = {
                'morning': '08:00',
                'afternoon': '14:00',
                'evening': '19:00',
                'night': '21:00'
            };

            smartReminders.push({
                id: 'preferred-time-reminder',
                type: 'pattern_based',
                title: 'Momento ideal para reflexionar',
                message: 'Es tu horario preferido para escribir en el diario. ¿Qué tal si compartes cómo te sientes?',
                trigger: 'daily',
                time: timeMap[preferredTime.slot],
                enabled: true,
                priority: 'high'
            });
        }

        // Recordatorio basado en patrones de estado de ánimo
        if (patterns.moodPatterns.length > 0) {
            const dominantMood = patterns.moodPatterns[0];
            if (dominantMood.percentage > 40) {
                smartReminders.push({
                    id: 'mood-pattern-reminder',
                    type: 'pattern_based',
                    title: 'Seguimiento de estado de ánimo',
                    message: `Has estado sintiéndote ${this.getMoodLabel(dominantMood.mood)} últimamente. ¿Cómo te sientes hoy?`,
                    trigger: 'daily',
                    time: '18:00',
                    enabled: true,
                    priority: 'medium'
                });
            }
        }

        // Recordatorio basado en ejercicios preferidos
        if (patterns.exercisePatterns.length > 0) {
            const favoriteExercise = patterns.exercisePatterns[0];
            smartReminders.push({
                id: 'exercise-pattern-reminder',
                type: 'pattern_based',
                title: 'Tu ejercicio favorito',
                message: `¿Te gustaría practicar ${this.getExerciseLabel(favoriteExercise.exercise)}? Te ha ayudado mucho últimamente.`,
                trigger: 'daily',
                time: '20:00',
                enabled: true,
                priority: 'low'
            });
        }

        // Recordatorio basado en rachas
        if (patterns.streakPatterns.current > 0) {
            smartReminders.push({
                id: 'streak-reminder',
                type: 'pattern_based',
                title: '¡Mantén tu racha!',
                message: `¡Increíble! Llevas ${patterns.streakPatterns.current} días seguidos. ¿Quieres continuar?`,
                trigger: 'daily',
                time: '21:30',
                enabled: true,
                priority: 'high'
            });
        }

        this.smartReminders = smartReminders;
        this.saveSmartReminders();
    }

    getMoodLabel(mood) {
        const moodLabels = {
            'excellent': 'excelente',
            'good': 'bien',
            'okay': 'regular',
            'bad': 'mal',
            'terrible': 'terrible'
        };
        return moodLabels[mood] || mood;
    }

    getExerciseLabel(exercise) {
        const exerciseLabels = {
            'breathing': 'Respiración Profunda',
            'meditation': 'Meditación',
            'progressive-relaxation': 'Relajación Progresiva',
            'grounding': 'Grounding'
        };
        return exerciseLabels[exercise] || exercise;
    }

    scheduleSmartReminders() {
        // Limpiar recordatorios existentes
        this.clearExistingReminders();

        // Programar recordatorios inteligentes
        this.smartReminders.forEach(reminder => {
            if (reminder.enabled) {
                this.scheduleReminder(reminder);
            }
        });

        // Programar recordatorios personalizados
        this.reminders.forEach(reminder => {
            if (reminder.enabled) {
                this.scheduleReminder(reminder);
            }
        });
    }

    scheduleReminder(reminder) {
        const now = new Date();
        const [hours, minutes] = reminder.time.split(':').map(Number);
        
        let nextTrigger = new Date();
        nextTrigger.setHours(hours, minutes, 0, 0);

        // Si ya pasó la hora de hoy, programar para mañana
        if (nextTrigger <= now) {
            nextTrigger.setDate(nextTrigger.getDate() + 1);
        }

        // Ajustar según el tipo de trigger
        if (reminder.trigger === 'day_of_week') {
            const targetDay = reminder.dayOfWeek;
            const currentDay = nextTrigger.getDay();
            const daysUntilTarget = (targetDay - currentDay + 7) % 7;
            nextTrigger.setDate(nextTrigger.getDate() + daysUntilTarget);
        }

        const timeUntilTrigger = nextTrigger.getTime() - now.getTime();
        
        setTimeout(() => {
            this.showReminder(reminder);
            // Programar el siguiente recordatorio
            this.scheduleReminder(reminder);
        }, timeUntilTrigger);
    }

    showReminder(reminder) {
        // Verificar si el usuario ya escribió hoy
        const today = new Date().toDateString();
        const hasEntryToday = this.entries.some(entry => 
            new Date(entry.date).toDateString() === today
        );

        if (hasEntryToday && reminder.priority !== 'high') {
            return; // No mostrar recordatorios de baja prioridad si ya escribió
        }

        // Crear notificación de recordatorio
        const reminderElement = document.createElement('div');
        reminderElement.className = 'smart-reminder';
        reminderElement.innerHTML = `
            <div class="reminder-content">
                <div class="reminder-header">
                    <i class="fas fa-bell"></i>
                    <h4>${reminder.title}</h4>
                    <button class="reminder-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
                <p class="reminder-message">${reminder.message}</p>
                <div class="reminder-actions">
                    <button class="btn-reminder-action" onclick="diaryWellness.handleReminderAction('${reminder.id}', 'accept')">
                        <i class="fas fa-check"></i>
                        Escribir Ahora
                    </button>
                    <button class="btn-reminder-action secondary" onclick="diaryWellness.handleReminderAction('${reminder.id}', 'snooze')">
                        <i class="fas fa-clock"></i>
                        Recordar en 1 hora
                    </button>
                    <button class="btn-reminder-action secondary" onclick="diaryWellness.handleReminderAction('${reminder.id}', 'dismiss')">
                        <i class="fas fa-times"></i>
                        Descartar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(reminderElement);

        // Auto-remover después de 30 segundos si no hay interacción
        setTimeout(() => {
            if (reminderElement.parentNode) {
                reminderElement.remove();
            }
        }, 30000);
    }

    handleReminderAction(reminderId, action) {
        const reminder = this.smartReminders.find(r => r.id === reminderId) || 
                        this.reminders.find(r => r.id === reminderId);

        if (!reminder) return;

        switch (action) {
            case 'accept':
                // Scroll a la sección de reflexión
                document.getElementById('reflection-section')?.scrollIntoView({ behavior: 'smooth' });
                // Enfocar el textarea
                setTimeout(() => {
                    document.getElementById('reflection-text')?.focus();
                }, 500);
                break;
            case 'snooze':
                // Programar recordatorio para 1 hora después
                setTimeout(() => {
                    this.showReminder(reminder);
                }, 60 * 60 * 1000);
                break;
            case 'dismiss':
                // Desactivar recordatorio por hoy
                this.dismissReminderForToday(reminderId);
                break;
        }

        // Remover el elemento de recordatorio
        document.querySelectorAll('.smart-reminder').forEach(el => el.remove());
    }

    dismissReminderForToday(reminderId) {
        const today = new Date().toDateString();
        const dismissed = JSON.parse(localStorage.getItem('dismissedReminders') || '{}');
        dismissed[reminderId] = today;
        localStorage.setItem('dismissedReminders', JSON.stringify(dismissed));
    }

    clearExistingReminders() {
        // Limpiar timeouts existentes
        if (this.reminderTimeouts) {
            this.reminderTimeouts.forEach(timeout => clearTimeout(timeout));
        }
        this.reminderTimeouts = [];
    }

    showReminderSetupModal() {
        const modal = document.getElementById('reminder-modal');
        if (modal) {
            modal.classList.add('active');
            this.loadReminderSettings();
        }
    }

    closeReminderModal() {
        const modal = document.getElementById('reminder-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    loadReminderSettings() {
        // Cargar configuración actual de recordatorios
        const settings = this.loadReminderSettings();
        if (settings) {
            document.getElementById('reminder-time').value = settings.time || '20:00';
            document.getElementById('reminder-frequency').value = settings.frequency || 'daily';
            document.getElementById('reminder-enabled').checked = settings.enabled !== false;
        }
    }

    saveReminderSettings() {
        const settings = {
            time: document.getElementById('reminder-time').value,
            frequency: document.getElementById('reminder-frequency').value,
            enabled: document.getElementById('reminder-enabled').checked,
            lastUpdated: new Date().toISOString()
        };

        this.saveReminderSettings(settings);
        this.scheduleSmartReminders();
        this.closeReminderModal();
        this.showNotification('Configuración de recordatorios guardada', 'success');
    }

    disableAllReminders() {
        this.smartReminders.forEach(reminder => {
            reminder.enabled = false;
        });
        this.reminders.forEach(reminder => {
            reminder.enabled = false;
        });
        
        this.saveSmartReminders();
        this.saveReminders();
        this.clearExistingReminders();
        this.showNotification('Todos los recordatorios han sido desactivados', 'info');
    }

    // === ALMACENAMIENTO DE RECORDATORIOS ===
    loadReminders() {
        const data = localStorage.getItem('diaryReminders');
        return data ? JSON.parse(data) : [];
    }

    saveReminders() {
        localStorage.setItem('diaryReminders', JSON.stringify(this.reminders));
    }

    loadReminderPatterns() {
        const data = localStorage.getItem('reminderPatterns');
        return data ? JSON.parse(data) : {};
    }

    saveReminderPatterns() {
        localStorage.setItem('reminderPatterns', JSON.stringify(this.reminderPatterns));
    }

    loadSmartReminders() {
        const data = localStorage.getItem('smartReminders');
        return data ? JSON.parse(data) : [];
    }

    saveSmartReminders() {
        localStorage.setItem('smartReminders', JSON.stringify(this.smartReminders));
    }

    loadReminderSettings() {
        const data = localStorage.getItem('reminderSettings');
        return data ? JSON.parse(data) : null;
    }

    saveReminderSettings(settings) {
        localStorage.setItem('reminderSettings', JSON.stringify(settings));
    }

    // === ALMACENAMIENTO DE OBJETIVOS ===
    loadGoals() {
        const data = localStorage.getItem('diaryGoals');
        return data ? JSON.parse(data) : [];
    }

    saveGoals() {
        localStorage.setItem('diaryGoals', JSON.stringify(this.goals));
    }

    // === ESTADÍSTICAS AVANZADAS ===
    initializeAdvancedAnalytics() {
        this.analytics = this.loadAnalytics();
        this.setupAnalyticsEventListeners();
        this.generateAdvancedReports();
        this.updateAnalyticsDisplay();
    }

    setupAnalyticsEventListeners() {
        // Botón para generar reporte completo
        const generateReportBtn = document.getElementById('generate-report');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateFullReport();
            });
        }

        // Botón para exportar estadísticas
        const exportStatsBtn = document.getElementById('export-stats');
        if (exportStatsBtn) {
            exportStatsBtn.addEventListener('click', () => {
                this.exportStatistics();
            });
        }

        // Filtros de fecha para estadísticas
        const statsDateFrom = document.getElementById('stats-date-from');
        const statsDateTo = document.getElementById('stats-date-to');
        
        if (statsDateFrom) {
            statsDateFrom.addEventListener('change', () => {
                this.updateAnalyticsDisplay();
            });
        }
        
        if (statsDateTo) {
            statsDateTo.addEventListener('change', () => {
                this.updateAnalyticsDisplay();
            });
        }
    }

    generateAdvancedReports() {
        if (this.entries.length === 0) return;

        const reports = {
            moodAnalysis: this.generateMoodAnalysis(),
            exerciseAnalysis: this.generateExerciseAnalysis(),
            writingPatterns: this.generateWritingPatterns(),
            wellnessTrends: this.generateWellnessTrends(),
            goalProgress: this.generateGoalProgressReport(),
            insights: this.generateInsights()
        };

        this.analytics = reports;
        this.saveAnalytics();
    }

    generateMoodAnalysis() {
        const moodCounts = {};
        const moodByDay = {};
        const moodByHour = {};
        const moodTrends = [];

        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const day = date.getDay();
            const hour = date.getHours();
            const dateStr = date.toISOString().split('T')[0];

            // Conteo general
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;

            // Por día de la semana
            moodByDay[day] = moodByDay[day] || {};
            moodByDay[day][entry.mood] = (moodByDay[day][entry.mood] || 0) + 1;

            // Por hora
            moodByHour[hour] = moodByHour[hour] || {};
            moodByHour[hour][entry.mood] = (moodByHour[hour][entry.mood] || 0) + 1;

            // Tendencias
            moodTrends.push({
                date: dateStr,
                mood: entry.mood,
                value: this.getMoodValue(entry.mood)
            });
        });

        const total = this.entries.length;
        const moodPercentages = Object.entries(moodCounts)
            .map(([mood, count]) => ({
                mood,
                count,
                percentage: (count / total) * 100
            }))
            .sort((a, b) => b.count - a.count);

        return {
            distribution: moodPercentages,
            byDay: moodByDay,
            byHour: moodByHour,
            trends: moodTrends,
            average: this.calculateAverageMood(moodTrends),
            mostCommon: moodPercentages[0]?.mood || 'good',
            leastCommon: moodPercentages[moodPercentages.length - 1]?.mood || 'good'
        };
    }

    getMoodValue(mood) {
        const values = {
            'excellent': 5,
            'good': 4,
            'okay': 3,
            'bad': 2,
            'terrible': 1
        };
        return values[mood] || 3;
    }

    calculateAverageMood(trends) {
        if (trends.length === 0) return 0;
        const sum = trends.reduce((acc, trend) => acc + trend.value, 0);
        return sum / trends.length;
    }

    generateExerciseAnalysis() {
        const exerciseCounts = {};
        const exerciseEffectiveness = {};
        const exerciseByMood = {};

        this.entries.forEach(entry => {
            if (entry.exercise && entry.exercise !== 'none') {
                exerciseCounts[entry.exercise] = (exerciseCounts[entry.exercise] || 0) + 1;
                
                // Efectividad del ejercicio (mejora del estado de ánimo)
                if (!exerciseEffectiveness[entry.exercise]) {
                    exerciseEffectiveness[entry.exercise] = [];
                }
                exerciseEffectiveness[entry.exercise].push(this.getMoodValue(entry.mood));

                // Ejercicio por estado de ánimo
                exerciseByMood[entry.mood] = exerciseByMood[entry.mood] || {};
                exerciseByMood[entry.mood][entry.exercise] = (exerciseByMood[entry.mood][entry.exercise] || 0) + 1;
            }
        });

        // Calcular efectividad promedio
        const exerciseStats = Object.entries(exerciseCounts).map(([exercise, count]) => {
            const effectiveness = exerciseEffectiveness[exercise];
            const avgEffectiveness = effectiveness.length > 0 
                ? effectiveness.reduce((a, b) => a + b, 0) / effectiveness.length 
                : 0;

            return {
                exercise,
                count,
                averageEffectiveness: avgEffectiveness,
                percentage: (count / this.entries.length) * 100
            };
        }).sort((a, b) => b.count - a.count);

        return {
            distribution: exerciseStats,
            byMood: exerciseByMood,
            mostEffective: exerciseStats.sort((a, b) => b.averageEffectiveness - a.averageEffectiveness)[0]?.exercise,
            mostUsed: exerciseStats[0]?.exercise,
            totalWithExercise: Object.values(exerciseCounts).reduce((a, b) => a + b, 0),
            exerciseRate: (Object.values(exerciseCounts).reduce((a, b) => a + b, 0) / this.entries.length) * 100
        };
    }

    generateWritingPatterns() {
        const patterns = {
            wordCounts: [],
            writingTimes: [],
            writingDays: {},
            consistency: 0,
            averageWords: 0,
            longestEntry: 0,
            shortestEntry: Infinity
        };

        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const day = date.getDay();
            const hour = date.getHours();
            const wordCount = entry.wordCount || 0;

            patterns.wordCounts.push(wordCount);
            patterns.writingTimes.push(hour);
            patterns.writingDays[day] = (patterns.writingDays[day] || 0) + 1;

            if (wordCount > patterns.longestEntry) {
                patterns.longestEntry = wordCount;
            }
            if (wordCount < patterns.shortestEntry) {
                patterns.shortestEntry = wordCount;
            }
        });

        patterns.averageWords = patterns.wordCounts.length > 0 
            ? patterns.wordCounts.reduce((a, b) => a + b, 0) / patterns.wordCounts.length 
            : 0;

        // Calcular consistencia (días consecutivos)
        const sortedEntries = this.entries
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(entry => new Date(entry.date).toDateString());

        let currentStreak = 0;
        let maxStreak = 0;
        let lastDate = null;

        sortedEntries.forEach(dateStr => {
            if (lastDate && this.isConsecutiveDay(lastDate, dateStr)) {
                currentStreak++;
            } else {
                maxStreak = Math.max(maxStreak, currentStreak);
                currentStreak = 1;
            }
            lastDate = dateStr;
        });
        maxStreak = Math.max(maxStreak, currentStreak);

        patterns.consistency = maxStreak;
        patterns.averageWords = Math.round(patterns.averageWords);

        return patterns;
    }

    generateWellnessTrends() {
        const trends = {
            weekly: this.calculateWeeklyTrends(),
            monthly: this.calculateMonthlyTrends(),
            seasonal: this.calculateSeasonalTrends(),
            improvements: this.calculateImprovements(),
            challenges: this.calculateChallenges()
        };

        return trends;
    }

    calculateWeeklyTrends() {
        const weeklyData = {};
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const day = date.getDay();
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - day);
            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                    week: weekKey,
                    entries: 0,
                    averageMood: 0,
                    totalWords: 0,
                    exercises: 0
                };
            }

            weeklyData[weekKey].entries++;
            weeklyData[weekKey].averageMood += this.getMoodValue(entry.mood);
            weeklyData[weekKey].totalWords += entry.wordCount || 0;
            if (entry.exercise && entry.exercise !== 'none') {
                weeklyData[weekKey].exercises++;
            }
        });

        // Calcular promedios
        Object.values(weeklyData).forEach(week => {
            week.averageMood = week.entries > 0 ? week.averageMood / week.entries : 0;
        });

        return Object.values(weeklyData).sort((a, b) => new Date(a.week) - new Date(b.week));
    }

    calculateMonthlyTrends() {
        const monthlyData = {};

        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    month: monthKey,
                    entries: 0,
                    averageMood: 0,
                    totalWords: 0,
                    exercises: 0,
                    uniqueDays: new Set()
                };
            }

            monthlyData[monthKey].entries++;
            monthlyData[monthKey].averageMood += this.getMoodValue(entry.mood);
            monthlyData[monthKey].totalWords += entry.wordCount || 0;
            monthlyData[monthKey].uniqueDays.add(date.toDateString());
            
            if (entry.exercise && entry.exercise !== 'none') {
                monthlyData[monthKey].exercises++;
            }
        });

        // Calcular promedios y métricas
        Object.values(monthlyData).forEach(month => {
            month.averageMood = month.entries > 0 ? month.averageMood / month.entries : 0;
            month.uniqueDays = month.uniqueDays.size;
            month.consistency = (month.uniqueDays / new Date(month.month + '-01').getDate()) * 100;
        });

        return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
    }

    calculateSeasonalTrends() {
        const seasonalData = {
            spring: { entries: 0, averageMood: 0, count: 0 },
            summer: { entries: 0, averageMood: 0, count: 0 },
            autumn: { entries: 0, averageMood: 0, count: 0 },
            winter: { entries: 0, averageMood: 0, count: 0 }
        };

        this.entries.forEach(entry => {
            const date = new Date(entry.date);
            const month = date.getMonth();
            let season;

            if (month >= 2 && month <= 4) season = 'spring';
            else if (month >= 5 && month <= 7) season = 'summer';
            else if (month >= 8 && month <= 10) season = 'autumn';
            else season = 'winter';

            seasonalData[season].entries++;
            seasonalData[season].averageMood += this.getMoodValue(entry.mood);
            seasonalData[season].count++;
        });

        // Calcular promedios
        Object.values(seasonalData).forEach(season => {
            season.averageMood = season.count > 0 ? season.averageMood / season.count : 0;
        });

        return seasonalData;
    }

    calculateImprovements() {
        if (this.entries.length < 7) return [];

        const improvements = [];
        const sortedEntries = this.entries
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Mejora en estado de ánimo
        const recentMood = this.calculateAverageMood(
            sortedEntries.slice(-7).map(entry => ({
                mood: entry.mood,
                value: this.getMoodValue(entry.mood)
            }))
        );
        const olderMood = this.calculateAverageMood(
            sortedEntries.slice(0, 7).map(entry => ({
                mood: entry.mood,
                value: this.getMoodValue(entry.mood)
            }))
        );

        if (recentMood > olderMood) {
            improvements.push({
                type: 'mood',
                description: 'Tu estado de ánimo ha mejorado significativamente',
                improvement: ((recentMood - olderMood) / olderMood * 100).toFixed(1) + '%'
            });
        }

        // Mejora en consistencia
        const recentConsistency = this.calculateConsistency(sortedEntries.slice(-14));
        const olderConsistency = this.calculateConsistency(sortedEntries.slice(0, 14));

        if (recentConsistency > olderConsistency) {
            improvements.push({
                type: 'consistency',
                description: 'Has sido más consistente escribiendo en el diario',
                improvement: recentConsistency + ' días consecutivos'
            });
        }

        return improvements;
    }

    calculateChallenges() {
        const challenges = [];

        // Días sin escribir
        const lastEntry = this.entries.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        if (lastEntry) {
            const daysSinceLastEntry = Math.floor(
                (new Date() - new Date(lastEntry.date)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceLastEntry > 3) {
                challenges.push({
                    type: 'consistency',
                    description: `No has escrito en el diario por ${daysSinceLastEntry} días`,
                    suggestion: 'Considera escribir una reflexión breve para mantener el hábito'
                });
            }
        }

        // Estado de ánimo bajo
        const recentMood = this.calculateAverageMood(
            this.entries.slice(-7).map(entry => ({
                mood: entry.mood,
                value: this.getMoodValue(entry.mood)
            }))
        );

        if (recentMood < 2.5) {
            challenges.push({
                type: 'mood',
                description: 'Tu estado de ánimo ha estado bajo últimamente',
                suggestion: 'Considera practicar ejercicios de relajación o buscar apoyo'
            });
        }

        return challenges;
    }

    calculateConsistency(entries) {
        if (entries.length === 0) return 0;

        let maxStreak = 0;
        let currentStreak = 0;
        let lastDate = null;

        entries
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(entry => {
                const entryDate = new Date(entry.date).toDateString();
                if (lastDate && this.isConsecutiveDay(lastDate, entryDate)) {
                    currentStreak++;
                } else {
                    maxStreak = Math.max(maxStreak, currentStreak);
                    currentStreak = 1;
                }
                lastDate = entryDate;
            });

        return Math.max(maxStreak, currentStreak);
    }

    generateGoalProgressReport() {
        if (!this.goals || this.goals.length === 0) {
            return {
                totalGoals: 0,
                completedGoals: 0,
                inProgress: 0,
                averageProgress: 0,
                goalsByCategory: {},
                upcomingDeadlines: []
            };
        }

        const completedGoals = this.goals.filter(g => g.completed).length;
        const inProgress = this.goals.filter(g => !g.completed).length;
        const averageProgress = this.goals.reduce((acc, goal) => {
            return acc + (goal.currentValue / goal.targetValue) * 100;
        }, 0) / this.goals.length;

        const goalsByCategory = {};
        this.goals.forEach(goal => {
            goalsByCategory[goal.category] = goalsByCategory[goal.category] || { total: 0, completed: 0 };
            goalsByCategory[goal.category].total++;
            if (goal.completed) {
                goalsByCategory[goal.category].completed++;
            }
        });

        const upcomingDeadlines = this.goals
            .filter(g => g.deadline && !g.completed)
            .map(goal => ({
                ...goal,
                daysLeft: this.getDaysLeft(goal.deadline)
            }))
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 5);

        return {
            totalGoals: this.goals.length,
            completedGoals,
            inProgress,
            averageProgress: Math.round(averageProgress),
            goalsByCategory,
            upcomingDeadlines
        };
    }

    generateInsights() {
        const insights = [];

        // Insight sobre patrones de escritura
        const writingPatterns = this.generateWritingPatterns();
        if (writingPatterns.averageWords > 100) {
            insights.push({
                type: 'writing',
                title: 'Escritor Prolífico',
                description: `Escribes un promedio de ${writingPatterns.averageWords} palabras por entrada`,
                positive: true
            });
        }

        // Insight sobre consistencia
        if (writingPatterns.consistency > 7) {
            insights.push({
                type: 'consistency',
                title: 'Muy Consistente',
                description: `Tu racha más larga es de ${writingPatterns.consistency} días`,
                positive: true
            });
        }

        // Insight sobre ejercicios
        const exerciseAnalysis = this.generateExerciseAnalysis();
        if (exerciseAnalysis.exerciseRate > 50) {
            insights.push({
                type: 'exercise',
                title: 'Muy Activo',
                description: `Practicas ejercicios en el ${exerciseAnalysis.exerciseRate.toFixed(1)}% de tus entradas`,
                positive: true
            });
        }

        // Insight sobre estado de ánimo
        const moodAnalysis = this.generateMoodAnalysis();
        if (moodAnalysis.average > 4) {
            insights.push({
                type: 'mood',
                title: 'Estado de Ánimo Positivo',
                description: 'Tu estado de ánimo general es muy positivo',
                positive: true
            });
        }

        return insights;
    }

    generateFullReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            period: {
                from: this.entries.length > 0 ? this.entries[this.entries.length - 1].date : null,
                to: this.entries.length > 0 ? this.entries[0].date : null,
                totalDays: this.entries.length
            },
            summary: {
                totalEntries: this.entries.length,
                totalWords: this.entries.reduce((acc, entry) => acc + (entry.wordCount || 0), 0),
                averageWordsPerEntry: Math.round(
                    this.entries.reduce((acc, entry) => acc + (entry.wordCount || 0), 0) / this.entries.length
                ),
                mostActiveDay: this.getMostActiveDay(),
                currentStreak: this.getCurrentStreak()
            },
            analytics: this.analytics,
            goals: this.generateGoalProgressReport(),
            recommendations: this.generateRecommendations()
        };

        this.downloadReport(report);
        this.showNotification('Reporte completo generado y descargado', 'success');
    }

    getMostActiveDay() {
        const dayCounts = {};
        this.entries.forEach(entry => {
            const day = new Date(entry.date).getDay();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const mostActive = Object.entries(dayCounts)
            .sort(([,a], [,b]) => b - a)[0];

        return mostActive ? dayNames[mostActive[0]] : 'N/A';
    }

    getCurrentStreak() {
        if (this.entries.length === 0) return 0;

        const sortedEntries = this.entries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(entry => new Date(entry.date).toDateString());

        let streak = 0;
        let lastDate = null;

        for (const dateStr of sortedEntries) {
            if (lastDate && this.isConsecutiveDay(dateStr, lastDate)) {
                streak++;
            } else if (!lastDate) {
                streak = 1;
            } else {
                break;
            }
            lastDate = dateStr;
        }

        return streak;
    }

    generateRecommendations() {
        const recommendations = [];

        // Recomendación basada en consistencia
        const currentStreak = this.getCurrentStreak();
        if (currentStreak < 3) {
            recommendations.push({
                type: 'consistency',
                title: 'Mejora tu consistencia',
                description: 'Intenta escribir en el diario al menos 3 días seguidos',
                action: 'Establece un recordatorio diario'
            });
        }

        // Recomendación basada en ejercicios
        const exerciseAnalysis = this.generateExerciseAnalysis();
        if (exerciseAnalysis.exerciseRate < 30) {
            recommendations.push({
                type: 'exercise',
                title: 'Incorpora más ejercicios',
                description: 'Los ejercicios de relajación pueden mejorar tu bienestar',
                action: 'Prueba diferentes ejercicios disponibles'
            });
        }

        // Recomendación basada en estado de ánimo
        const moodAnalysis = this.generateMoodAnalysis();
        if (moodAnalysis.average < 3) {
            recommendations.push({
                type: 'mood',
                title: 'Cuida tu estado de ánimo',
                description: 'Considera practicar ejercicios de relajación regularmente',
                action: 'Explora las técnicas de respiración y meditación'
            });
        }

        return recommendations;
    }

    downloadReport(report) {
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte-bienestar-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    exportStatistics() {
        const stats = {
            entries: this.entries,
            goals: this.goals || [],
            analytics: this.analytics,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `estadisticas-bienestar-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Estadísticas exportadas exitosamente', 'success');
    }

    updateAnalyticsDisplay() {
        // Actualizar gráficos y estadísticas en la interfaz
        this.updateMoodChart();
        this.updateExerciseChart();
        this.updateTrendsDisplay();
        this.updateInsightsDisplay();
    }

    updateMoodChart() {
        const moodAnalysis = this.analytics?.moodAnalysis;
        if (!moodAnalysis) return;

        const chartContainer = document.getElementById('mood-chart');
        if (!chartContainer) return;

        // Crear gráfico de distribución de estados de ánimo
        const ctx = chartContainer.getContext('2d');
        // Aquí se implementaría la lógica del gráfico
    }

    updateExerciseChart() {
        const exerciseAnalysis = this.analytics?.exerciseAnalysis;
        if (!exerciseAnalysis) return;

        const chartContainer = document.getElementById('exercise-chart');
        if (!chartContainer) return;

        // Crear gráfico de ejercicios
        const ctx = chartContainer.getContext('2d');
        // Aquí se implementaría la lógica del gráfico
    }

    updateTrendsDisplay() {
        const trends = this.analytics?.wellnessTrends;
        if (!trends) return;

        // Actualizar elementos de tendencias en la interfaz
        const trendsContainer = document.getElementById('trends-display');
        if (trendsContainer) {
            trendsContainer.innerHTML = this.createTrendsHTML(trends);
        }
    }

    updateInsightsDisplay() {
        const insights = this.analytics?.insights;
        if (!insights) return;

        const insightsContainer = document.getElementById('insights-display');
        if (insightsContainer) {
            insightsContainer.innerHTML = this.createInsightsHTML(insights);
        }
    }

    createTrendsHTML(trends) {
        return `
            <div class="trends-grid">
                <div class="trend-card">
                    <h4>Tendencia Semanal</h4>
                    <p>Últimas ${trends.weekly.length} semanas</p>
                </div>
                <div class="trend-card">
                    <h4>Tendencia Mensual</h4>
                    <p>Últimos ${trends.monthly.length} meses</p>
                </div>
            </div>
        `;
    }

    createInsightsHTML(insights) {
        return insights.map(insight => `
            <div class="insight-card ${insight.positive ? 'positive' : 'neutral'}">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `).join('');
    }

    // === ALMACENAMIENTO DE ANALÍTICAS ===
    loadAnalytics() {
        const data = localStorage.getItem('diaryAnalytics');
        return data ? JSON.parse(data) : null;
    }

    saveAnalytics() {
        localStorage.setItem('diaryAnalytics', JSON.stringify(this.analytics));
    }

    // === ALMACENAMIENTO DE ETIQUETAS ===
    loadTags() {
        const data = localStorage.getItem('diaryTags');
        return data ? JSON.parse(data) : [];
    }

    saveTags() {
        localStorage.setItem('diaryTags', JSON.stringify(this.tags));
    }

    loadAvailableTags() {
        const data = localStorage.getItem('availableTags');
        return data ? JSON.parse(data) : [];
    }

    saveAvailableTags() {
        localStorage.setItem('availableTags', JSON.stringify(this.availableTags));
    }

    // === EXPORTACIÓN DE DATOS ===
    exportToJSON() {
        const exportData = {
            entries: this.entries,
            anxietyLevels: this.anxietyLevels,
            personalizedPlan: this.personalizedPlan,
            stats: {
                currentStreak: this.currentStreak,
                totalSessions: this.totalSessions,
                bestStreak: this.bestStreak
            },
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `diario-bienestar-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Datos exportados exitosamente', 'success');
    }

    exportToPDF() {
        // Crear contenido HTML para el PDF
        const content = this.generatePDFContent();
        
        // Crear ventana nueva para imprimir
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mi Diario de Bienestar - ${new Date().toLocaleDateString('es-ES')}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #d7cdf2; padding-bottom: 20px; }
                    .entry { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
                    .entry-date { color: #6b7280; font-size: 0.9em; margin-bottom: 10px; }
                    .entry-mood { font-weight: bold; color: #7c8ce0; margin-bottom: 10px; }
                    .entry-content { margin-bottom: 10px; }
                    .entry-exercise { font-style: italic; color: #6b7280; font-size: 0.9em; }
                    .stats { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
                    .stats h3 { margin-top: 0; color: #1f2937; }
                    .stat-item { margin: 10px 0; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Esperar a que se cargue el contenido y luego imprimir
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);

        this.showNotification('PDF generado exitosamente', 'success');
    }

    generatePDFContent() {
        const currentDate = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let entriesHTML = '';
        this.entries.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const moodLabels = {
                calm: 'Tranquilo',
                relaxed: 'Relajado',
                neutral: 'Neutral',
                anxious: 'Ansioso',
                overwhelmed: 'Abrumado'
            };

            const exerciseLabels = {
                breathing: 'Respiración Profunda',
                meditation: 'Meditación',
                'progressive-relaxation': 'Relajación Progresiva',
                grounding: 'Grounding',
                none: 'Sin ejercicio'
            };

            entriesHTML += `
                <div class="entry">
                    <div class="entry-date">${date}</div>
                    <div class="entry-mood">Estado: ${moodLabels[entry.mood] || entry.mood}</div>
                    <div class="entry-content">${entry.content}</div>
                    <div class="entry-exercise">Ejercicio: ${exerciseLabels[entry.exercise] || entry.exercise}</div>
                </div>
            `;
        });

        return `
            <div class="header">
                <h1>Mi Diario de Bienestar</h1>
                <p>Generado el ${currentDate}</p>
            </div>
            
            <div class="stats">
                <h3>Estadísticas Generales</h3>
                <div class="stat-item"><strong>Racha actual:</strong> ${this.currentStreak} días</div>
                <div class="stat-item"><strong>Mejor racha:</strong> ${this.bestStreak} días</div>
                <div class="stat-item"><strong>Sesiones completadas:</strong> ${this.totalSessions}</div>
                <div class="stat-item"><strong>Total de entradas:</strong> ${this.entries.length}</div>
            </div>

            <h2>Mis Reflexiones</h2>
            ${entriesHTML || '<p>No hay entradas para mostrar.</p>'}
        `;
    }

    exportToCSV() {
        const headers = ['Fecha', 'Estado de Ánimo', 'Contenido', 'Ejercicio', 'Palabras'];
        const csvContent = [
            headers.join(','),
            ...this.entries.map(entry => [
                new Date(entry.date).toLocaleDateString('es-ES'),
                entry.mood,
                `"${entry.content.replace(/"/g, '""')}"`,
                entry.exercise,
                entry.wordCount || 0
            ].join(','))
        ].join('\n');

        const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `diario-bienestar-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('CSV exportado exitosamente', 'success');
    }

    // === UTILIDADES ===
    showNotification(message, type = 'info') {
        // Crear notificación temporal
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
    window.diaryWellness = new DiaryWellness();
});

// Agregar estilos para la animación de notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

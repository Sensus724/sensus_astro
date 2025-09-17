/*
 * Sensus - Diario de Bienestar
 * JavaScript para funcionalidades del diario con ejercicios de ansiedad
 * Incluye: ejercicios, reflexión, calendario, guardado y rachas
 */

class DiaryWellness {
    constructor() {
        this.currentStreak = 0;
        this.totalSessions = 0;
        this.bestStreak = 0;
        this.entries = this.loadEntries();
        this.currentExercise = null;
        this.exerciseTimer = null;
        this.timerInterval = null;
        this.currentMood = null;
        this.currentDate = new Date();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressSummary();
        this.generateCalendar();
        this.loadEntriesList();
        this.updateStreak();
        this.animateCounters();
    }

    setupEventListeners() {
        // Ejercicios
        document.querySelectorAll('.start-exercise').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exercise = e.target.closest('.exercise-card').dataset.exercise;
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

        // Estados de ánimo (compatible con ambas versiones)
        document.querySelectorAll('.mood-btn, .mood-btn-enhanced').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMood(e.target.closest('[class*="mood-btn"]').dataset.mood);
            });
        });

        // Área de escritura
        const textarea = document.getElementById('reflection-text');
        textarea.addEventListener('input', () => {
            this.updateCharacterCount();
            this.toggleSaveButton();
        });

        // Botones de escritura
        document.getElementById('clear-reflection').addEventListener('click', () => {
            this.clearReflection();
        });

        document.getElementById('save-reflection').addEventListener('click', () => {
            this.saveReflection();
        });

        // Prompts de escritura (compatible con ambas versiones)
        document.querySelectorAll('.prompt-btn, .prompt-btn-enhanced').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addPrompt(e.target.dataset.prompt);
            });
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

        document.getElementById('load-more').addEventListener('click', () => {
            this.loadMoreEntries();
        });

        // Cerrar modal al hacer clic fuera
        document.getElementById('exercise-modal').addEventListener('click', (e) => {
            if (e.target.id === 'exercise-modal') {
                this.closeExerciseModal();
            }
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
            wordCount: content.split(' ').length
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
        
        let filteredEntries = this.entries;

        // Aplicar filtros
        if (dateFilter !== 'all') {
            filteredEntries = this.filterByDate(filteredEntries, dateFilter);
        }
        
        if (moodFilter !== 'all') {
            filteredEntries = filteredEntries.filter(entry => entry.mood === moodFilter);
        }

        // Mostrar entradas
        entriesList.innerHTML = '';
        filteredEntries.forEach(entry => {
            const entryElement = this.createEntryElement(entry);
            entriesList.appendChild(entryElement);
        });
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

        entryDiv.innerHTML = `
            <div class="entry-header">
                <div class="entry-date">${formattedDate}</div>
                <div class="entry-mood">
                    <span class="emoji">${moodEmojis[entry.mood]}</span>
                    <span>${moodLabels[entry.mood]}</span>
                </div>
            </div>
            <div class="entry-content">${entry.content}</div>
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

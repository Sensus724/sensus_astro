/**
 * Calendario Mejorado - Sensus
 * Funcionalidad avanzada para el calendario de actividades diarias
 */

class CalendarEnhanced {
    constructor() {
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
        this.activities = this.loadActivities();
        this.streakData = this.loadStreakData();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderCalendar();
        this.updateProgressStats();
        this.updateStreakIndicator();
    }

    setupEventListeners() {
        // Navegación del calendario
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateMonth(-1));
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateMonth(1));
        }

        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.navigateMonth(-1);
            if (e.key === 'ArrowRight') this.navigateMonth(1);
        });
    }

    navigateMonth(direction) {
        this.currentMonth += direction;
        
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        
        this.renderCalendar();
        this.updateProgressStats();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const monthTitle = document.getElementById('current-month');
        
        if (!calendarGrid || !monthTitle) return;

        // Actualizar título del mes
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        monthTitle.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Limpiar calendario
        calendarGrid.innerHTML = '';

        // Añadir encabezados de días
        const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            dayHeader.style.cssText = `
                font-weight: 600;
                color: var(--diary-text-light);
                text-align: center;
                padding: 1rem 0;
                font-size: 0.875rem;
            `;
            calendarGrid.appendChild(dayHeader);
        });

        // Obtener primer día del mes y número de días
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Añadir días del mes anterior
        const prevMonth = new Date(this.currentYear, this.currentMonth - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            this.createDayElement(day, true, calendarGrid);
        }

        // Añadir días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            this.createDayElement(day, false, calendarGrid);
        }

        // Añadir días del mes siguiente para completar la cuadrícula
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6 filas x 7 días
        
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayElement(day, true, calendarGrid);
        }
    }

    createDayElement(day, isOtherMonth, container) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day-enhanced';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        // Verificar si es hoy
        const today = new Date();
        const isToday = !isOtherMonth && 
                       day === today.getDate() && 
                       this.currentMonth === today.getMonth() && 
                       this.currentYear === today.getFullYear();

        if (isToday) {
            dayElement.classList.add('today');
        }

        // Verificar estado de actividad
        if (!isOtherMonth) {
            const activityStatus = this.getActivityStatus(day);
            if (activityStatus) {
                dayElement.classList.add(activityStatus);
            }
        }

        // Crear contenido del día
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Añadir estado de actividad si no es otro mes
        if (!isOtherMonth) {
            const activityStatus = this.getActivityStatus(day);
            if (activityStatus) {
                const statusElement = document.createElement('div');
                statusElement.className = 'calendar-day-status';
                statusElement.textContent = this.getStatusText(activityStatus);
                dayElement.appendChild(statusElement);
            }
        }

        // Añadir evento de click
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                this.openDayModal(day);
            }
        });

        container.appendChild(dayElement);
    }

    getActivityStatus(day) {
        const dateKey = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const activity = this.activities[dateKey];
        
        if (!activity) return null;
        
        if (activity.completed) return 'completed';
        if (activity.partial) return 'partial';
        if (activity.missed) return 'missed';
        
        return null;
    }

    getStatusText(status) {
        const statusTexts = {
            'completed': '✓',
            'partial': '~',
            'missed': '✗'
        };
        return statusTexts[status] || '';
    }

    openDayModal(day) {
        // Implementar modal de actividad diaria
        console.log(`Abrir modal para el día ${day}`);
        // Aquí puedes implementar la funcionalidad del modal
    }

    updateProgressStats() {
        this.updateWeeklyProgress();
        this.updateMonthlyProgress();
        this.updateBestStreak();
    }

    updateWeeklyProgress() {
        const weeklyProgress = this.calculateWeeklyProgress();
        const weeklyElement = document.getElementById('weekly-progress');
        const weeklyFill = document.getElementById('weekly-progress-fill');
        
        if (weeklyElement) {
            weeklyElement.textContent = `${weeklyProgress.completed}/${weeklyProgress.total}`;
        }
        
        if (weeklyFill) {
            const percentage = (weeklyProgress.completed / weeklyProgress.total) * 100;
            weeklyFill.style.width = `${percentage}%`;
        }
    }

    updateMonthlyProgress() {
        const monthlyProgress = this.calculateMonthlyProgress();
        const monthlyElement = document.getElementById('monthly-goal');
        const monthlyFill = document.getElementById('monthly-progress-fill');
        
        if (monthlyElement) {
            monthlyElement.textContent = `${monthlyProgress.completed}/${monthlyProgress.goal}`;
        }
        
        if (monthlyFill) {
            const percentage = (monthlyProgress.completed / monthlyProgress.goal) * 100;
            monthlyFill.style.width = `${Math.min(percentage, 100)}%`;
        }
    }

    updateBestStreak() {
        const bestStreak = this.calculateBestStreak();
        const streakElement = document.getElementById('best-streak');
        const streakDots = document.getElementById('streak-dots');
        
        if (streakElement) {
            streakElement.textContent = bestStreak;
        }
        
        if (streakDots) {
            this.renderStreakDots(streakDots, bestStreak);
        }
    }

    renderStreakDots(container, streak) {
        container.innerHTML = '';
        const maxDots = 10; // Mostrar máximo 10 puntos
        
        for (let i = 0; i < maxDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'streak-dot';
            
            if (i < streak) {
                dot.classList.add('active');
            }
            
            container.appendChild(dot);
        }
    }

    calculateWeeklyProgress() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        let completed = 0;
        let total = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            if (date <= today) {
                total++;
                const dateKey = this.formatDateKey(date);
                if (this.activities[dateKey]?.completed) {
                    completed++;
                }
            }
        }
        
        return { completed, total };
    }

    calculateMonthlyProgress() {
        const today = new Date();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const goal = 30; // Meta mensual
        
        let completed = 0;
        
        for (let day = 1; day <= Math.min(daysInMonth, today.getDate()); day++) {
            const dateKey = this.formatDateKey(new Date(this.currentYear, this.currentMonth, day));
            if (this.activities[dateKey]?.completed) {
                completed++;
            }
        }
        
        return { completed, goal };
    }

    calculateBestStreak() {
        let bestStreak = 0;
        let currentStreak = 0;
        
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 30); // Revisar últimos 30 días
        
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateKey = this.formatDateKey(d);
            if (this.activities[dateKey]?.completed) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        return bestStreak;
    }

    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadActivities() {
        // Cargar actividades desde localStorage o API
        const saved = localStorage.getItem('sensus_activities');
        return saved ? JSON.parse(saved) : {};
    }

    loadStreakData() {
        // Cargar datos de racha desde localStorage
        const saved = localStorage.getItem('sensus_streak');
        return saved ? JSON.parse(saved) : { bestStreak: 0, currentStreak: 0 };
    }

    saveActivities() {
        localStorage.setItem('sensus_activities', JSON.stringify(this.activities));
    }

    saveStreakData() {
        localStorage.setItem('sensus_streak', JSON.stringify(this.streakData));
    }

    // Método para marcar una actividad como completada
    markActivityCompleted(day, status = 'completed') {
        const dateKey = this.formatDateKey(new Date(this.currentYear, this.currentMonth, day));
        
        if (!this.activities[dateKey]) {
            this.activities[dateKey] = {};
        }
        
        this.activities[dateKey][status] = true;
        this.saveActivities();
        
        // Re-renderizar calendario y estadísticas
        this.renderCalendar();
        this.updateProgressStats();
    }

    // Método para obtener estadísticas detalladas
    getDetailedStats() {
        return {
            weekly: this.calculateWeeklyProgress(),
            monthly: this.calculateMonthlyProgress(),
            bestStreak: this.calculateBestStreak(),
            totalActivities: Object.keys(this.activities).length
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.calendarEnhanced = new CalendarEnhanced();
});

// Exportar para uso global
window.CalendarEnhanced = CalendarEnhanced;

// Exportar por defecto para módulos ES6
export default CalendarEnhanced;

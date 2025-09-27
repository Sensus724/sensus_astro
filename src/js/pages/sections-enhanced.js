/**
 * Secciones Mejoradas - Sensus
 * Funcionalidad avanzada para todas las secciones del diario
 */

class SectionsEnhanced {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.updateStats();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Logros
        const shareAchievementsBtn = document.getElementById('share-achievements');
        const viewAllAchievementsBtn = document.getElementById('view-all-achievements');

        if (shareAchievementsBtn) {
            shareAchievementsBtn.addEventListener('click', () => this.shareAchievements());
        }

        if (viewAllAchievementsBtn) {
            viewAllAchievementsBtn.addEventListener('click', () => this.viewAllAchievements());
        }

        // Objetivos
        const createGoalBtn = document.getElementById('create-goal');
        if (createGoalBtn) {
            createGoalBtn.addEventListener('click', () => this.createGoal());
        }

        // Analytics
        const analyticsCards = document.querySelectorAll('.overview-card-enhanced');
        analyticsCards.forEach(card => {
            card.addEventListener('click', () => this.handleAnalyticsCard(card));
        });

        // CTA Final
        const ctaPrimaryBtn = document.querySelector('.btn-cta-primary-enhanced');
        const ctaSecondaryBtn = document.querySelector('.btn-cta-secondary-enhanced');

        if (ctaPrimaryBtn) {
            ctaPrimaryBtn.addEventListener('click', () => this.startDiary());
        }

        if (ctaSecondaryBtn) {
            ctaSecondaryBtn.addEventListener('click', () => this.viewExercises());
        }
    }

    loadData() {
        this.loadAchievements();
        this.loadReflections();
        this.loadGoals();
        this.loadAnalytics();
    }

    loadAchievements() {
        const achievements = this.getAchievements();
        this.renderAchievements(achievements);
        this.updateAchievementStats(achievements);
    }

    loadReflections() {
        const reflections = this.getReflections();
        this.updateReflectionStats(reflections);
    }

    loadGoals() {
        const goals = this.getGoals();
        this.updateGoalStats(goals);
        this.updateProgressCircle(goals);
    }

    loadAnalytics() {
        const analytics = this.getAnalytics();
        this.updateAnalyticsStats(analytics);
    }

    getAchievements() {
        const saved = localStorage.getItem('sensus_achievements');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                title: 'Primer Paso',
                description: 'Escribiste tu primera reflexión',
                icon: 'fas fa-pen',
                unlocked: true,
                date: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Constancia',
                description: '7 días consecutivos escribiendo',
                icon: 'fas fa-calendar-check',
                unlocked: false,
                date: null
            },
            {
                id: 3,
                title: 'Reflexión Profunda',
                description: 'Escribiste más de 500 palabras',
                icon: 'fas fa-brain',
                unlocked: false,
                date: null
            }
        ];
    }

    getReflections() {
        const saved = localStorage.getItem('sensus_reflections');
        return saved ? JSON.parse(saved) : [];
    }

    getGoals() {
        const saved = localStorage.getItem('sensus_goals');
        return saved ? JSON.parse(saved) : [
            {
                id: 1,
                title: 'Meditar 10 minutos diarios',
                description: 'Practicar mindfulness cada día',
                target: 30,
                current: 5,
                completed: false,
                created: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Escribir en el diario',
                description: 'Reflexionar sobre el día',
                target: 7,
                current: 3,
                completed: false,
                created: new Date().toISOString()
            }
        ];
    }

    getAnalytics() {
        return {
            insights: 12,
            trend: 'Positiva',
            score: 8.5,
            patterns: ['Mejor estado en las mañanas', 'Mayor ansiedad los lunes']
        };
    }

    renderAchievements(achievements) {
        const grid = document.getElementById('achievements-grid');
        if (!grid) return;

        grid.innerHTML = '';

        achievements.forEach(achievement => {
            const achievementCard = this.createAchievementCard(achievement);
            grid.appendChild(achievementCard);
        });
    }

    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card-enhanced ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        card.innerHTML = `
            <div class="achievement-icon-enhanced">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-content-enhanced">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                ${achievement.unlocked ? `<span class="achievement-date">Desbloqueado: ${new Date(achievement.date).toLocaleDateString()}</span>` : '<span class="achievement-locked">Bloqueado</span>'}
            </div>
        `;

        return card;
    }

    updateAchievementStats(achievements) {
        const totalElement = document.getElementById('total-achievements');
        const streakElement = document.getElementById('achievement-streak');

        if (totalElement) {
            const unlocked = achievements.filter(a => a.unlocked).length;
            totalElement.textContent = unlocked;
        }

        if (streakElement) {
            streakElement.textContent = this.calculateStreak();
        }
    }

    updateReflectionStats(reflections) {
        const totalElement = document.getElementById('total-reflections');
        const streakElement = document.getElementById('reflection-streak');
        const avgMoodElement = document.getElementById('avg-mood');

        if (totalElement) {
            totalElement.textContent = reflections.length;
        }

        if (streakElement) {
            streakElement.textContent = this.calculateReflectionStreak(reflections);
        }

        if (avgMoodElement) {
            avgMoodElement.textContent = this.calculateAverageMood(reflections);
        }
    }

    updateGoalStats(goals) {
        const totalElement = document.getElementById('total-goals');
        const completedElement = document.getElementById('completed-goals');
        const activeElement = document.getElementById('active-goals');

        if (totalElement) {
            totalElement.textContent = goals.length;
        }

        if (completedElement) {
            const completed = goals.filter(g => g.completed).length;
            completedElement.textContent = completed;
        }

        if (activeElement) {
            const active = goals.filter(g => !g.completed).length;
            activeElement.textContent = active;
        }
    }

    updateProgressCircle(goals) {
        const circle = document.getElementById('goals-progress-circle');
        const percentage = document.getElementById('goals-progress-percentage');

        if (!circle || !percentage) return;

        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.completed).length;
        const progressPercent = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        // Actualizar círculo de progreso
        circle.style.background = `conic-gradient(#10b981 ${progressPercent * 3.6}deg, #e5e7eb 0deg)`;
        percentage.textContent = `${Math.round(progressPercent)}%`;
    }

    updateAnalyticsStats(analytics) {
        const insightsElement = document.getElementById('insights-count');
        const trendElement = document.getElementById('current-trend');
        const scoreElement = document.getElementById('wellness-score');

        if (insightsElement) {
            insightsElement.textContent = analytics.insights;
        }

        if (trendElement) {
            trendElement.textContent = analytics.trend;
        }

        if (scoreElement) {
            scoreElement.textContent = `${analytics.score}/10`;
        }
    }

    calculateStreak() {
        // Calcular racha de logros
        return 5; // Placeholder
    }

    calculateReflectionStreak(reflections) {
        // Calcular racha de reflexiones
        return reflections.length > 0 ? 3 : 0; // Placeholder
    }

    calculateAverageMood(reflections) {
        if (reflections.length === 0) return 'N/A';
        
        const moods = reflections.map(r => r.mood || 5);
        const average = moods.reduce((a, b) => a + b, 0) / moods.length;
        
        const moodLabels = ['Muy Bajo', 'Bajo', 'Regular', 'Bueno', 'Muy Bueno'];
        return moodLabels[Math.round(average) - 1] || 'Regular';
    }

    setupAnimations() {
        // Intersection Observer para animaciones
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar elementos
        const elements = document.querySelectorAll('.achievement-card-enhanced, .summary-card-enhanced, .overview-card-enhanced');
        elements.forEach(element => {
            observer.observe(element);
        });
    }

    // Métodos de acción
    shareAchievements() {
        const achievements = this.getAchievements();
        const unlocked = achievements.filter(a => a.unlocked);
        
        if (unlocked.length === 0) {
            this.showNotification('No tienes logros para compartir aún', 'info');
            return;
        }

        const text = `¡He desbloqueado ${unlocked.length} logros en mi diario de bienestar! 🏆`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Mis Logros - Sensus',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text);
            this.showNotification('Logros copiados al portapapeles', 'success');
        }
    }

    viewAllAchievements() {
        this.showModal({
            title: 'Todos los Logros',
            content: this.generateAchievementsModal(),
            type: 'achievements'
        });
    }

    createGoal() {
        this.showModal({
            title: 'Crear Nuevo Objetivo',
            content: this.generateGoalForm(),
            type: 'goal'
        });
    }

    handleAnalyticsCard(card) {
        const title = card.querySelector('h3').textContent;
        this.showModal({
            title: title,
            content: this.generateAnalyticsContent(title),
            type: 'analytics'
        });
    }

    startDiary() {
        // Redirigir a la sección de reflexión
        const reflectionSection = document.querySelector('.reflection-section-enhanced');
        if (reflectionSection) {
            reflectionSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    viewExercises() {
        // Redirigir a la sección de ejercicios
        const exercisesSection = document.querySelector('.exercises-section');
        if (exercisesSection) {
            exercisesSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    generateAchievementsModal() {
        const achievements = this.getAchievements();
        return `
            <div class="modal-content-enhanced">
                <div class="achievements-list">
                    ${achievements.map(achievement => `
                        <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon">
                                <i class="${achievement.icon}"></i>
                            </div>
                            <div class="achievement-details">
                                <h4>${achievement.title}</h4>
                                <p>${achievement.description}</p>
                                ${achievement.unlocked ? `<small>Desbloqueado: ${new Date(achievement.date).toLocaleDateString()}</small>` : '<small>Bloqueado</small>'}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateGoalForm() {
        return `
            <div class="modal-content-enhanced">
                <form id="goal-form" class="goal-form-enhanced">
                    <div class="form-group">
                        <label for="goal-title">Título del Objetivo</label>
                        <input type="text" id="goal-title" required>
                    </div>
                    <div class="form-group">
                        <label for="goal-description">Descripción</label>
                        <textarea id="goal-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="goal-target">Meta (días)</label>
                        <input type="number" id="goal-target" min="1" max="365" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Crear Objetivo</button>
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-enhanced').style.display='none'">Cancelar</button>
                    </div>
                </form>
            </div>
        `;
    }

    generateAnalyticsContent(title) {
        const analytics = this.getAnalytics();
        
        switch (title) {
            case 'Progreso General':
                return `
                    <div class="modal-content-enhanced">
                        <h3>📊 Tu Progreso</h3>
                        <div class="progress-stats">
                            <div class="stat-item">
                                <span class="stat-value">${analytics.score}/10</span>
                                <span class="stat-label">Puntuación de Bienestar</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${analytics.insights}</span>
                                <span class="stat-label">Insights Generados</span>
                            </div>
                        </div>
                        <p>Tu progreso muestra una tendencia ${analytics.trend.toLowerCase()} en el bienestar mental.</p>
                    </div>
                `;
            case 'Insights IA':
                return `
                    <div class="modal-content-enhanced">
                        <h3>🧠 Análisis Inteligente</h3>
                        <ul>
                            ${analytics.patterns.map(pattern => `<li>${pattern}</li>`).join('')}
                        </ul>
                        <p>La IA ha identificado estos patrones en tu comportamiento y bienestar.</p>
                    </div>
                `;
            case 'Reportes':
                return `
                    <div class="modal-content-enhanced">
                        <h3>📄 Exportar Datos</h3>
                        <div class="export-options">
                            <button class="btn-export" onclick="this.exportData('pdf')">
                                <i class="fas fa-file-pdf"></i>
                                Exportar PDF
                            </button>
                            <button class="btn-export" onclick="this.exportData('csv')">
                                <i class="fas fa-file-csv"></i>
                                Exportar CSV
                            </button>
                        </div>
                        <p>Descarga tus datos y progreso en el formato que prefieras.</p>
                    </div>
                `;
            default:
                return '<div class="modal-content-enhanced"><p>Información no disponible.</p></div>';
        }
    }

    showModal({ title, content, type }) {
        // Crear modal si no existe
        let modal = document.getElementById('sections-modal');
        if (!modal) {
            modal = this.createModal();
        }

        // Configurar contenido
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-body');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        
        // Añadir clase de tipo
        modal.className = `modal-enhanced modal-${type}`;
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Configurar formulario si existe
        const form = modal.querySelector('#goal-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleGoalSubmit(e));
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'sections-modal';
        modal.className = 'modal-enhanced';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title"></h2>
                    <button class="modal-close" aria-label="Cerrar modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-modal-primary" id="modal-ok-btn">Cerrar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners del modal
        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('#modal-ok-btn');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        return modal;
    }

    handleGoalSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const goal = {
            id: Date.now(),
            title: document.getElementById('goal-title').value,
            description: document.getElementById('goal-description').value,
            target: parseInt(document.getElementById('goal-target').value),
            current: 0,
            completed: false,
            created: new Date().toISOString()
        };

        const goals = this.getGoals();
        goals.push(goal);
        localStorage.setItem('sensus_goals', JSON.stringify(goals));

        this.showNotification('Objetivo creado exitosamente', 'success');
        this.loadGoals();
        
        // Cerrar modal
        const modal = document.getElementById('sections-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sectionsEnhanced = new SectionsEnhanced();
});

// Exportar para uso global
window.SectionsEnhanced = SectionsEnhanced;

// Exportar por defecto para módulos ES6
export default SectionsEnhanced;
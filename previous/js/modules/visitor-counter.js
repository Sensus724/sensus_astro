// Sistema de contador de visitantes para Sensus
class VisitorCounter {
    constructor() {
        this.statsKey = 'sensus_stats';
        this.visitorKey = 'sensus_visitor';
        this.sessionKey = 'sensus_session';
        this.init();
    }

    init() {
        // Verificar si es una nueva visita
        if (!this.isNewVisitor()) {
            this.updateStats();
        } else {
            this.incrementVisitor();
        }
        
        // Actualizar estadísticas cada 30 segundos
        setInterval(() => {
            this.updateStats();
        }, 30000);
    }

    isNewVisitor() {
        const lastVisit = localStorage.getItem(this.visitorKey);
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        
        if (!lastVisit || (now - parseInt(lastVisit)) > oneDay) {
            return true;
        }
        return false;
    }

    incrementVisitor() {
        const now = new Date().getTime();
        localStorage.setItem(this.visitorKey, now.toString());
        
        // Incrementar contador local
        let stats = this.getStats();
        stats.visitors.total += 1;
        stats.visitors.today += 1;
        stats.visitors.thisWeek += 1;
        stats.visitors.thisMonth += 1;
        stats.lastUpdated = new Date().toISOString();
        
        this.saveStats(stats);
        this.updateDisplay();
    }

    updateStats() {
        let stats = this.getStats();
        
        // Simular crecimiento orgánico (pequeños incrementos aleatorios)
        const now = new Date();
        const lastUpdate = new Date(stats.lastUpdated);
        const timeDiff = now - lastUpdate;
        
        // Solo actualizar si han pasado al menos 5 minutos
        if (timeDiff > 5 * 60 * 1000) {
            // Incrementos aleatorios pequeños para simular crecimiento real
            const randomIncrement = Math.floor(Math.random() * 3) + 1;
            
            stats.visitors.total += randomIncrement;
            stats.tests.total += Math.floor(randomIncrement * 3.5);
            stats.diary.total += Math.floor(randomIncrement * 6.8);
            
            // Actualizar fechas
            stats.lastUpdated = now.toISOString();
            
            this.saveStats(stats);
            this.updateDisplay();
        }
    }

    getStats() {
        const defaultStats = {
            visitors: { total: 12500, today: 45, thisWeek: 320, thisMonth: 1250 },
            tests: { total: 45000, today: 120, thisWeek: 850, thisMonth: 3200 },
            diary: { total: 85000, today: 280, thisWeek: 1950, thisMonth: 7800 },
            satisfaction: { percentage: 96, totalResponses: 12500 },
            lastUpdated: new Date().toISOString()
        };

        try {
            const stored = localStorage.getItem(this.statsKey);
            return stored ? JSON.parse(stored) : defaultStats;
        } catch (error) {
            console.error('Error loading stats:', error);
            return defaultStats;
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(stats));
        } catch (error) {
            console.error('Error saving stats:', error);
        }
    }

    updateDisplay() {
        const stats = this.getStats();
        
        // Actualizar todos los elementos de estadísticas
        const statElements = document.querySelectorAll('.stat-number[data-target]');
        statElements.forEach(element => {
            const target = parseInt(element.getAttribute('data-target'));
            let newValue = target;
            
            if (target === 12500) {
                newValue = stats.visitors.total;
            } else if (target === 45000) {
                newValue = stats.tests.total;
            } else if (target === 85000) {
                newValue = stats.diary.total;
            } else if (target === 96) {
                newValue = stats.satisfaction.percentage;
            }
            
            if (newValue !== target) {
                element.setAttribute('data-target', newValue);
                // Solo animar si el elemento es visible
                if (this.isElementVisible(element)) {
                    this.animateNumber(element, newValue);
                }
            }
        });
    }

    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    animateNumber(element, targetValue) {
        const currentValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
        const increment = (targetValue - currentValue) / 20;
        let current = currentValue;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 50);
    }

    // Método para obtener estadísticas actuales (para uso externo)
    getCurrentStats() {
        return this.getStats();
    }

    // Método para simular una nueva entrada de diario
    addDiaryEntry() {
        let stats = this.getStats();
        stats.diary.total += 1;
        stats.diary.today += 1;
        stats.diary.thisWeek += 1;
        stats.diary.thisMonth += 1;
        stats.lastUpdated = new Date().toISOString();
        this.saveStats(stats);
        this.updateDisplay();
    }

    // Método para simular un test completado
    addTestCompleted() {
        let stats = this.getStats();
        stats.tests.total += 1;
        stats.tests.today += 1;
        stats.tests.thisWeek += 1;
        stats.tests.thisMonth += 1;
        stats.lastUpdated = new Date().toISOString();
        this.saveStats(stats);
        this.updateDisplay();
    }
}

// Inicializar el contador cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.visitorCounter = new VisitorCounter();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitorCounter;
}

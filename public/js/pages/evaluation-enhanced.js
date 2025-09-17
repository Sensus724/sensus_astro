/*
 * Sensus - Evaluation Page Enhanced Features
 * Funcionalidades avanzadas para la página de evaluación
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Evaluation Enhanced: Inicializando...');
    
    // === INICIALIZAR FUNCIONALIDADES AVANZADAS ===
    initializeCounterAnimations();
    initializeSearchFunctionality();
    initializeUserProgress();
    initializeRecommendations();
    initializeHelpModal();
    initializeAccessibility();
    initializeAnalytics();
});

// === ANIMACIONES DE CONTADORES ===
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000; // 2 segundos
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        if (element.getAttribute('data-count') === '10000') {
            element.textContent = Math.floor(current).toLocaleString() + '+';
        } else if (element.getAttribute('data-count') === '100') {
            element.textContent = Math.floor(current) + '%';
        } else {
            element.textContent = Math.floor(current) + '%';
        }
    }, 16);
}

// === FUNCIONALIDAD DE BÚSQUEDA ===
function initializeSearchFunctionality() {
    const searchInput = document.getElementById('test-search');
    const clearButton = document.querySelector('.clear-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            filterTestsBySearch(query);
            
            // Mostrar/ocultar botón de limpiar
            if (query.length > 0) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        });
        
        // Buscar con Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstResult = document.querySelector('.test-card[style*="block"]');
                if (firstResult) {
                    firstResult.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
}

function filterTestsBySearch(query) {
    const testCards = document.querySelectorAll('.test-card');
    
    testCards.forEach(card => {
        const title = card.querySelector('.test-title').textContent.toLowerCase();
        const description = card.querySelector('.test-description').textContent.toLowerCase();
        
        if (title.includes(query) || description.includes(query)) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Actualizar contador de resultados
    updateSearchResults();
}

function clearSearch() {
    const searchInput = document.getElementById('test-search');
    const clearButton = document.querySelector('.clear-search');
    
    searchInput.value = '';
    clearButton.style.display = 'none';
    
    // Mostrar todos los tests
    const testCards = document.querySelectorAll('.test-card');
    testCards.forEach(card => {
        card.style.display = 'block';
    });
    
    updateSearchResults();
}

function updateSearchResults() {
    const visibleTests = document.querySelectorAll('.test-card[style*="block"]').length;
    const totalTests = document.querySelectorAll('.test-card').length;
    
    // Crear o actualizar contador de resultados
    let resultsCounter = document.getElementById('search-results');
    if (!resultsCounter) {
        resultsCounter = document.createElement('div');
        resultsCounter.id = 'search-results';
        resultsCounter.className = 'search-results';
        document.querySelector('.test-search').appendChild(resultsCounter);
    }
    
    if (visibleTests < totalTests) {
        resultsCounter.textContent = `${visibleTests} de ${totalTests} tests encontrados`;
        resultsCounter.style.display = 'block';
    } else {
        resultsCounter.style.display = 'none';
    }
}

// === PROGRESO DEL USUARIO MEJORADO ===
function initializeUserProgress() {
    const userProgress = JSON.parse(localStorage.getItem('sensus_user_progress') || '{}');
    
    if (Object.keys(userProgress).length > 0) {
        showUserProgressSection(userProgress);
        updateTestCardsWithProgress(userProgress);
    }
}

function showUserProgressSection(progress) {
    const progressSection = document.getElementById('user-progress-section');
    const completedTests = document.getElementById('completed-tests');
    const lastTestDate = document.getElementById('last-test-date');
    const improvementTrend = document.getElementById('improvement-trend');
    
    if (progressSection) {
        progressSection.style.display = 'block';
        
        // Actualizar estadísticas
        const testCount = Object.keys(progress).length;
        completedTests.textContent = testCount;
        
        // Fecha de última evaluación
        const dates = Object.values(progress).map(test => new Date(test.date));
        const latestDate = new Date(Math.max(...dates));
        lastTestDate.textContent = latestDate.toLocaleDateString();
        
        // Tendencia de mejora
        const trend = calculateImprovementTrend(progress);
        improvementTrend.textContent = trend;
        improvementTrend.className = `progress-number trend-${trend.toLowerCase()}`;
    }
}

function updateTestCardsWithProgress(progress) {
    Object.entries(progress).forEach(([testType, data]) => {
        const progressElement = document.getElementById(`progress-${testType}`);
        const retakeButton = document.querySelector(`[data-test="${testType}"] .retake-button`);
        
        if (progressElement) {
            progressElement.style.display = 'block';
            
            // Actualizar barra de progreso
            const progressFill = progressElement.querySelector('.progress-fill');
            const progressPercentage = calculateProgressPercentage(data.score, testType);
            progressFill.style.width = `${progressPercentage}%`;
            
            // Actualizar información
            const lastScore = progressElement.querySelector('.last-score strong');
            const lastDate = progressElement.querySelector('.last-date strong');
            
            lastScore.textContent = data.score;
            lastDate.textContent = new Date(data.date).toLocaleDateString();
            
            // Mostrar botón de repetir
            if (retakeButton) {
                retakeButton.style.display = 'block';
            }
        }
    });
}

function calculateProgressPercentage(score, testType) {
    const maxScores = {
        'gad7': 21,
        'phq9': 27,
        'pss': 40,
        'wellness': 100,
        'selfesteem': 40
    };
    
    return Math.min((score / maxScores[testType]) * 100, 100);
}

function calculateImprovementTrend(progress) {
    if (Object.keys(progress).length < 2) return 'N/A';
    
    // Calcular tendencia basada en las últimas evaluaciones
    const scores = Object.values(progress).map(test => test.score);
    const recent = scores.slice(-3); // Últimas 3 evaluaciones
    
    if (recent.length < 2) return 'N/A';
    
    const trend = recent[recent.length - 1] - recent[0];
    
    if (trend > 0) return 'Mejorando';
    if (trend < 0) return 'Empeorando';
    return 'Estable';
}

// === RECOMENDACIONES PERSONALIZADAS ===
function initializeRecommendations() {
    const userProgress = JSON.parse(localStorage.getItem('sensus_user_progress') || '{}');
    
    if (Object.keys(userProgress).length > 0) {
        generateRecommendations(userProgress);
    }
}

function generateRecommendations(progress) {
    const recommendationsSection = document.getElementById('recommendations-section');
    const recommendationsGrid = recommendationsSection.querySelector('.recommendations-grid');
    
    if (!recommendationsSection) return;
    
    const recommendations = analyzeUserNeeds(progress);
    
    if (recommendations.length > 0) {
        recommendationsSection.style.display = 'block';
        
        recommendationsGrid.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-icon">
                    <i class="fas ${rec.icon}"></i>
                </div>
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <button class="btn btn-primary" onclick="startRecommendedTest('${rec.testType}')">
                    <i class="fas fa-play"></i>
                    ${rec.action}
                </button>
            </div>
        `).join('');
    }
}

function analyzeUserNeeds(progress) {
    const recommendations = [];
    
    // Analizar patrones en los resultados
    Object.entries(progress).forEach(([testType, data]) => {
        if (data.level === 'severa' || data.level === 'alta') {
            recommendations.push({
                testType: testType,
                title: `Seguimiento: ${getTestName(testType)}`,
                description: 'Te recomendamos repetir este test para monitorear tu progreso.',
                action: 'Repetir Test',
                icon: 'fa-redo'
            });
        }
    });
    
    // Recomendar tests complementarios
    const completedTests = Object.keys(progress);
    const allTests = ['gad7', 'phq9', 'pss', 'wellness', 'selfesteem'];
    const missingTests = allTests.filter(test => !completedTests.includes(test));
    
    missingTests.forEach(test => {
        recommendations.push({
            testType: test,
            title: `Completa tu evaluación: ${getTestName(test)}`,
            description: 'Este test te ayudará a tener una visión más completa de tu bienestar.',
            action: 'Comenzar Test',
            icon: 'fa-play'
        });
    });
    
    return recommendations.slice(0, 3); // Máximo 3 recomendaciones
}

function startRecommendedTest(testType) {
    window.location.href = `/test?test=${testType}`;
}

// === MODAL DE AYUDA ===
function initializeHelpModal() {
    // El modal se crea dinámicamente cuando se necesita
}

function showHelpModal() {
    const modal = document.createElement('div');
    modal.className = 'help-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>¿Necesitas Ayuda?</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="help-sections">
                    <div class="help-section">
                        <h4><i class="fas fa-question-circle"></i> ¿Cómo funcionan los tests?</h4>
                        <p>Nuestros tests son herramientas de screening validadas científicamente que te ayudan a evaluar tu bienestar mental.</p>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-shield-alt"></i> ¿Son seguros mis datos?</h4>
                        <p>Todos tus datos están protegidos con encriptación de grado médico y nunca se comparten con terceros.</p>
                    </div>
                    
                    <div class="help-section">
                        <h4><i class="fas fa-user-md"></i> ¿Cuándo buscar ayuda profesional?</h4>
                        <p>Si experimentas síntomas severos o persistentes, te recomendamos consultar con un profesional de la salud mental.</p>
                    </div>
                </div>
                
                <div class="help-resources">
                    <h4>Recursos de Ayuda</h4>
                    <div class="resource-links">
                        <a href="#" class="resource-link">
                            <i class="fas fa-phone"></i>
                            Línea de Crisis: 911
                        </a>
                        <a href="#" class="resource-link">
                            <i class="fas fa-globe"></i>
                            Encuentra un Psicólogo
                        </a>
                        <a href="#" class="resource-link">
                            <i class="fas fa-book"></i>
                            Recursos de Autoayuda
                        </a>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary close-modal">
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Bind close buttons
    modal.querySelectorAll('.close-modal, .modal-backdrop').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.remove();
        });
    });
}

// === ACCESIBILIDAD MEJORADA ===
function initializeAccessibility() {
    // Navegación por teclado mejorada
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Cerrar modales abiertos
            const openModals = document.querySelectorAll('.modal-backdrop');
            openModals.forEach(modal => {
                modal.click();
            });
        }
    });
    
    // Focus management
    const focusableElements = document.querySelectorAll('button, input, [tabindex]');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary)';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
        });
    });
    
    // Announcements para screen readers
    announceToScreenReader = function(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };
}

// === ANALÍTICAS ===
function initializeAnalytics() {
    // Track test card interactions
    document.querySelectorAll('.test-card').forEach(card => {
        card.addEventListener('click', function() {
            const testType = this.getAttribute('data-test');
            trackEvent('test_card_clicked', { test_type: testType });
        });
    });
    
    // Track filter usage
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            trackEvent('filter_used', { filter: filter });
        });
    });
    
    // Track search usage
    const searchInput = document.getElementById('test-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (this.value.length > 2) {
                    trackEvent('search_performed', { query: this.value });
                }
            }, 500);
        });
    }
}

function trackEvent(eventName, properties = {}) {
    // Implementar tracking de eventos
    console.log('Event tracked:', eventName, properties);
    
    // Aquí puedes integrar con Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
}

// === UTILIDADES ===
function getTestName(testType) {
    const testNames = {
        'gad7': 'Test de Ansiedad (GAD-7)',
        'phq9': 'Test de Depresión (PHQ-9)',
        'pss': 'Test de Estrés (PSS)',
        'wellness': 'Test de Bienestar General',
        'selfesteem': 'Test de Autoestima (RSES)'
    };
    return testNames[testType] || testType;
}

// === EXPORT FUNCTIONS ===
window.EvaluationEnhanced = {
    initializeCounterAnimations,
    initializeSearchFunctionality,
    initializeUserProgress,
    initializeRecommendations,
    showHelpModal,
    initializeAccessibility,
    initializeAnalytics,
    trackEvent
};

// Sensus - Script principal

// Ocultar el loader cuando la página esté completamente cargada
window.addEventListener('load', function() {
    const pageLoader = document.querySelector('.page-loader');
    if (pageLoader) {
        setTimeout(function() {
            pageLoader.classList.add('hidden');
        }, 500);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar módulos de compatibilidad primero
    if (typeof CrossBrowserCompatibility !== 'undefined') {
        // Los módulos de compatibilidad se inicializan automáticamente
    }
    
    // Inicializar módulos responsive
    if (typeof initResponsiveModule !== 'undefined') {
        initResponsiveModule();
    }
    
    // Inicializar optimizaciones de imágenes
    if (typeof initImageOptimizer !== 'undefined') {
        initImageOptimizer();
    }
    
    // Inicializar interacciones táctiles
    if (typeof initTouchInteractions !== 'undefined') {
        initTouchInteractions();
    }
    
    // Inicializar componentes principales
    initThemeToggle();
    initMobileMenu();
    initAuthModal();
    initFAQAccordion();
    initTestForm();
    initDiaryForm();
    initTestimonialSlider();
    initAnimations();
    
    // Detectar la página actual y ejecutar funciones específicas
    const currentPage = getCurrentPage();
    console.log('Página actual:', currentPage);
    
    // Marcar el enlace de navegación activo
    highlightActiveNavLink(currentPage);
    
    // Aplicar optimizaciones finales
    applyFinalOptimizations();
});

// Obtener la página actual basada en la URL
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    if (!page || page === '' || page === 'index.html') {
        return 'index';
    }
    
    return page.replace('.html', '');
}

// Resaltar el enlace de navegación activo
function highlightActiveNavLink(currentPage) {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const linkPage = link.getAttribute('href').replace('.html', '');
        if (linkPage === currentPage || (linkPage === 'index' && currentPage === '')) {
            link.classList.add('active');
        }
    });
}

// Inicializar animaciones
function initAnimations() {
    // Añadir efecto hover a los botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
    });
    
    // Añadir efecto de animación a los elementos del menú
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach((item, index) => {
        item.style.animationDelay = `${0.1 * index}s`;
        item.style.animation = 'fadeInDown 0.5s forwards';
    });
    
    // Añadir efecto de animación a las tarjetas de características
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${0.2 + (0.1 * index)}s`;
        card.style.animation = 'fadeIn 0.8s forwards';
    });
    
    // Inicializar animación de estadísticas
    initStatsAnimation();
    
    // Inicializar sección Cómo Empezar
    initGettingStartedSection();
    
    // Inicializar botones de navegación
    initNavigationButtons();
    
    // Inicializar contador de visitantes
    initVisitorCounter();
    
    // Inicializar test interactivo
    initInteractiveTest();
}

// Inicializar animación de estadísticas
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (!statNumbers.length) return;
    
    // Crear observer para animar cuando las estadísticas sean visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Animar números de estadísticas
function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 segundos
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// Inicializar sección Cómo Empezar
function initGettingStartedSection() {
    const stepCards = document.querySelectorAll('.step-card');
    const startNowBtn = document.getElementById('start-now-btn');
    
    // Animación de entrada para las tarjetas de pasos
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    stepCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Evento para el botón "Comenzar Ahora"
    if (startNowBtn) {
        startNowBtn.addEventListener('click', function() {
            // Scroll suave al formulario de registro
            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.click();
            }
        });
    }
    
    // Efecto hover mejorado para las tarjetas
    stepCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Inicializar botones de navegación
function initNavigationButtons() {
    // Botón "COMENZAR AHORA" del hero - Lleva al Test
    const startJourneyBtn = document.getElementById('start-journey-btn');
    if (startJourneyBtn) {
        startJourneyBtn.addEventListener('click', function() {
            // Navegar a la página de test
            window.location.href = 'test.html';
        });
    }
    
    // Botón "SABER MÁS" del hero - Lleva a Síntomas
    const learnMoreBtn = document.getElementById('learn-more-btn');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            // Navegar a la página de Síntomas
            window.location.href = 'ansiedad.html';
        });
    }
    
    // Botón "CREAR CUENTA AHORA" del CTA
    const ctaRegisterBtn = document.getElementById('cta-register-btn');
    if (ctaRegisterBtn) {
        ctaRegisterBtn.addEventListener('click', function() {
            // Abrir modal de registro
            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.click();
            }
        });
    }
    
    // Botón "CREAR CUENTA" de la sección Cómo Empezar
    const registerStepBtn = document.getElementById('register-step-btn');
    if (registerStepBtn) {
        registerStepBtn.addEventListener('click', function() {
            // Abrir modal de registro
            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.click();
            }
        });
    }
    
    // Botón "COMENZAR AHORA" de la sección Cómo Empezar
    const startNowBtn = document.getElementById('start-now-btn');
    if (startNowBtn) {
        startNowBtn.addEventListener('click', function() {
            // Abrir modal de registro
            const registerBtn = document.getElementById('register-btn');
            if (registerBtn) {
                registerBtn.click();
            }
        });
    }
    
    // Añadir eventos a todos los botones de autenticación en toda la página
    const allAuthButtons = document.querySelectorAll('[id*="login"], [id*="register"], [id*="auth"]');
    allAuthButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const buttonId = this.id;
            
            if (buttonId.includes('login')) {
                // Abrir modal con tab de login
                const loginBtn = document.getElementById('login-btn');
                if (loginBtn) {
                    loginBtn.click();
                }
            } else if (buttonId.includes('register')) {
                // Abrir modal con tab de registro
                const registerBtn = document.getElementById('register-btn');
                if (registerBtn) {
                    registerBtn.click();
                }
            }
        });
    });
    
    // Añadir scroll suave a todos los enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"], a[href$=".html"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Si es un enlace a una página HTML, permitir navegación normal
            if (href.endsWith('.html')) {
                return;
            }
            
            // Si es un enlace interno (#), hacer scroll suave
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Añadir efecto de scroll para el header
    initScrollHeader();
}

// Inicializar efecto de scroll para el header
function initScrollHeader() {
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Inicializar contador de visitantes
function initVisitorCounter() {
    // Cargar el módulo de contador de visitantes
    if (typeof VisitorCounter !== 'undefined') {
        window.visitorCounter = new VisitorCounter();
    }
}

// Inicializar test interactivo
function initInteractiveTest() {
    const testForm = document.getElementById('anxiety-test');
    const progressFill = document.getElementById('progress-fill');
    const currentQuestionSpan = document.getElementById('current-question');
    const totalQuestionsSpan = document.getElementById('total-questions');
    
    if (!testForm || !progressFill) return;
    
    const totalQuestions = 7;
    let currentQuestion = 1;
    
    if (totalQuestionsSpan) {
        totalQuestionsSpan.textContent = totalQuestions;
    }
    
    // Actualizar progreso
    function updateProgress() {
        const answeredQuestions = testForm.querySelectorAll('input[type="radio"]:checked').length;
        const progress = (answeredQuestions / totalQuestions) * 100;
        
        progressFill.style.width = `${progress}%`;
        
        if (currentQuestionSpan) {
            currentQuestionSpan.textContent = answeredQuestions + 1;
        }
        
        // Resaltar preguntas sin responder
        const questionContainers = testForm.querySelectorAll('.question-container');
        questionContainers.forEach((container, index) => {
            const questionNumber = index + 1;
            const hasAnswer = container.querySelector('input[type="radio"]:checked');
            
            if (questionNumber <= answeredQuestions + 1) {
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            } else {
                container.style.opacity = '0.6';
                container.style.transform = 'translateY(10px)';
            }
            
            if (questionNumber === answeredQuestions + 1) {
                container.style.borderColor = 'var(--primary-color)';
                container.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            } else {
                container.style.borderColor = 'transparent';
                container.style.boxShadow = 'none';
            }
        });
    }
    
    // Añadir eventos a las opciones
    const optionCards = testForm.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        const radio = card.querySelector('input[type="radio"]');
        
        card.addEventListener('click', function() {
            // Desmarcar otras opciones del mismo grupo
            const name = radio.name;
            const groupRadios = testForm.querySelectorAll(`input[name="${name}"]`);
            groupRadios.forEach(r => r.checked = false);
            
            // Marcar la opción seleccionada
            radio.checked = true;
            
            // Añadir efecto visual
            card.style.borderColor = 'var(--primary-color)';
            card.style.backgroundColor = 'rgba(215, 205, 242, 0.1)';
            
            // Actualizar progreso
            updateProgress();
            
            // Scroll suave a la siguiente pregunta
            setTimeout(() => {
                const nextQuestion = card.closest('.question-container').nextElementSibling;
                if (nextQuestion) {
                    nextQuestion.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }, 300);
        });
        
        // Efecto hover
        card.addEventListener('mouseenter', function() {
            if (!radio.checked) {
                card.style.borderColor = 'var(--primary-color)';
                card.style.transform = 'translateY(-2px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!radio.checked) {
                card.style.borderColor = 'var(--light)';
                card.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Inicializar progreso
    updateProgress();
    
    // Añadir animación de entrada a las preguntas
    const questionContainers = testForm.querySelectorAll('.question-container');
    questionContainers.forEach((container, index) => {
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        container.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Inicializar el toggle de tema claro/oscuro
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) return;
    
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Inicializar menú móvil
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Animar las barras del menú hamburguesa
        const bars = menuToggle.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.toggle('active'));
    });
    
    // Cerrar menú al hacer clic en un enlace
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            
            const bars = menuToggle.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.remove('active'));
        });
    });
}

// Inicializar modal de autenticación
function initAuthModal() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = document.querySelector('.close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    if (!authModal) return;
    
    // Abrir modal con tab de login
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            authModal.classList.add('active');
            showAuthTab('login');
        });
    }
    
    // Abrir modal con tab de registro
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            authModal.classList.add('active');
            showAuthTab('register');
        });
    }
    
    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            authModal.classList.remove('active');
        });
    }
    
    // Cambiar entre tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showAuthTab(tabName);
        });
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            authModal.classList.remove('active');
        }
    });
    
    // Prevenir envío de formularios (para demo)
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            alert('Funcionalidad de autenticación en desarrollo.');
        });
    });
}

// Mostrar tab específico en el modal de autenticación
function showAuthTab(tabName) {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Desactivar todos los tabs y formularios
    authTabs.forEach(tab => tab.classList.remove('active'));
    authForms.forEach(form => form.classList.remove('active'));
    
    // Activar el tab y formulario seleccionado
    document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-form`).classList.add('active');
}

// Inicializar acordeón de preguntas frecuentes
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    if (!faqItems.length) return;
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // Cerrar otros items abiertos
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Alternar estado del item actual
            item.classList.toggle('active');
        });
    });
}

// Inicializar formulario de test GAD-7
function initTestForm() {
    const testForm = document.querySelector('.test-form');
    
    if (!testForm) return;
    
    testForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Calcular puntuación
        let score = 0;
        const questions = testForm.querySelectorAll('.test-question');
        
        questions.forEach(question => {
            const selectedOption = question.querySelector('input[type="radio"]:checked');
            
            if (selectedOption) {
                score += parseInt(selectedOption.value);
            }
        });
        
        // Mostrar resultado
        showTestResult(score);
    });
}

// Mostrar resultado del test GAD-7
function showTestResult(score) {
    const resultElement = document.querySelector('.test-result');
    
    if (!resultElement) return;
    
    // Eliminar clases previas
    resultElement.classList.remove('result-mild', 'result-moderate', 'result-severe');
    
    // Determinar nivel de ansiedad
    let anxietyLevel, resultClass, recommendation;
    
    if (score >= 0 && score <= 4) {
        anxietyLevel = 'Mínima';
        resultClass = 'result-mild';
        recommendation = 'Tu nivel de ansiedad es mínimo. Continúa monitoreando tus emociones y practica técnicas de autocuidado regularmente.';
    } else if (score >= 5 && score <= 9) {
        anxietyLevel = 'Leve';
        resultClass = 'result-mild';
        recommendation = 'Presentas síntomas de ansiedad leve. Te recomendamos implementar técnicas de relajación y mindfulness en tu rutina diaria.';
    } else if (score >= 10 && score <= 14) {
        anxietyLevel = 'Moderada';
        resultClass = 'result-moderate';
        recommendation = 'Presentas síntomas de ansiedad moderada. Considera consultar con un profesional de la salud mental para recibir orientación adicional.';
    } else {
        anxietyLevel = 'Severa';
        resultClass = 'result-severe';
        recommendation = 'Presentas síntomas de ansiedad severa. Te recomendamos buscar ayuda profesional lo antes posible para recibir el apoyo adecuado.';
    }
    
    // Actualizar contenido
    resultElement.innerHTML = `
        <h3>Resultado: Ansiedad ${anxietyLevel}</h3>
        <p>Puntuación: ${score} / 21</p>
        <p>${recommendation}</p>
        <div class="result-actions">
            <button class="btn btn-primary" id="save-result">Guardar resultado</button>
            <button class="btn btn-outline" id="retake-test">Realizar test nuevamente</button>
        </div>
    `;
    
    // Añadir clase correspondiente
    resultElement.classList.add(resultClass);
    
    // Mostrar resultado
    resultElement.style.display = 'block';
    
    // Scroll al resultado
    resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Evento para guardar resultado (demo)
    const saveButton = document.getElementById('save-result');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            alert('Resultado guardado correctamente.');
        });
    }
    
    // Evento para reiniciar test
    const retakeButton = document.getElementById('retake-test');
    if (retakeButton) {
        retakeButton.addEventListener('click', function() {
            testForm.reset();
            resultElement.style.display = 'none';
            window.scrollTo({ top: testForm.offsetTop, behavior: 'smooth' });
        });
    }
}

// Inicializar formulario del diario emocional
function initDiaryForm() {
    const diaryForm = document.querySelector('.diary-form');
    const moodButtons = document.querySelectorAll('.mood-btn');
    
    if (!diaryForm || !moodButtons.length) return;
    
    // Selección de estado de ánimo
    moodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Deseleccionar todos los botones
            moodButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Seleccionar el botón actual
            this.classList.add('selected');
            
            // Actualizar campo oculto
            const moodInput = document.getElementById('mood-input');
            if (moodInput) {
                moodInput.value = this.getAttribute('data-mood');
            }
        });
    });
    
    // Envío del formulario
    diaryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const moodInput = document.getElementById('mood-input');
        const entryText = document.getElementById('entry-text');
        
        if (!moodInput || !entryText) return;
        
        // Validar que se haya seleccionado un estado de ánimo
        if (!moodInput.value) {
            alert('Por favor, selecciona cómo te sientes hoy.');
            return;
        }
        
        // Validar que se haya escrito una entrada
        if (!entryText.value.trim()) {
            alert('Por favor, escribe algo en tu entrada del diario.');
            return;
        }
        
        // Simular guardado (para demo)
        saveDiaryEntry(moodInput.value, entryText.value);
        
        // Reiniciar formulario
        diaryForm.reset();
        moodButtons.forEach(btn => btn.classList.remove('selected'));
        
        // Mostrar mensaje de éxito
        alert('Entrada guardada correctamente. ¡Continúa con tu racha!');
        
        // Actualizar lista de entradas (en una implementación real)
        // updateDiaryEntries();
    });
}

// Simular guardado de entrada del diario
function saveDiaryEntry(mood, text) {
    console.log('Guardando entrada:', { mood, text, date: new Date() });
    // En una implementación real, aquí se guardaría en Firebase
}

// Inicializar slider de testimonios
function initTestimonialSlider() {
    const testimonials = document.querySelectorAll('.testimonial');
    const prevButton = document.querySelector('.prev-testimonial');
    const nextButton = document.querySelector('.next-testimonial');
    
    if (!testimonials.length || !prevButton || !nextButton) return;
    
    let currentIndex = 0;
    
    // Mostrar solo el testimonio actual
    function updateSlider() {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.display = index === currentIndex ? 'block' : 'none';
        });
    }
    
    // Inicializar
    updateSlider();
    
    // Evento para testimonio anterior
    prevButton.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
        updateSlider();
    });
    
    // Evento para testimonio siguiente
    nextButton.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    });
    
    // Cambio automático cada 5 segundos
    setInterval(function() {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateSlider();
    }, 5000);
}

// Animación de elementos al hacer scroll
document.addEventListener('scroll', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    animatedElements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight * 0.8) {
            element.classList.add('animated');
        }
    });
});

// Aplicar optimizaciones finales
function applyFinalOptimizations() {
    // Optimizar performance
    optimizePerformance();
    
    // Configurar service worker si está disponible
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
    
    // Configurar PWA si es posible
    setupPWA();
    
    // Aplicar optimizaciones específicas del dispositivo
    applyDeviceSpecificOptimizations();
}

// Optimizar performance general
function optimizePerformance() {
    // Preload recursos críticos
    preloadCriticalResources();
    
    // Optimizar animaciones según el dispositivo
    optimizeAnimations();
    
    // Configurar lazy loading para elementos no críticos
    setupLazyLoadingForNonCritical();
}

// Precargar recursos críticos
function preloadCriticalResources() {
    const criticalImages = document.querySelectorAll('img[data-preload="true"]');
    criticalImages.forEach(img => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src || img.dataset.src;
        document.head.appendChild(link);
    });
}

// Optimizar animaciones según el dispositivo
function optimizeAnimations() {
    const deviceInfo = window.deviceInfo;
    if (!deviceInfo) return;
    
    // Reducir animaciones en dispositivos de baja potencia
    if (deviceInfo.isMobile && deviceInfo.prefersReducedMotion) {
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }
}

// Configurar lazy loading para elementos no críticos
function setupLazyLoadingForNonCritical() {
    const nonCriticalElements = document.querySelectorAll('[data-lazy="true"]');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Cargar contenido lazy
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                    }
                    
                    if (element.dataset.background) {
                        element.style.backgroundImage = `url(${element.dataset.background})`;
                    }
                    
                    observer.unobserve(element);
                }
            });
        }, { rootMargin: '50px' });
        
        nonCriticalElements.forEach(element => {
            observer.observe(element);
        });
    }
}

// Registrar service worker
function registerServiceWorker() {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('Service Worker registrado correctamente:', registration.scope);
            })
            .catch(function(error) {
                console.log('Error al registrar Service Worker:', error);
            });
    });
}

// Configurar PWA
function setupPWA() {
    // Detectar si la app se puede instalar
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botón de instalación si es necesario
        showInstallButton();
    });
    
    // Detectar si la app se instaló
    window.addEventListener('appinstalled', function() {
        console.log('PWA instalada correctamente');
        hideInstallButton();
    });
}

// Mostrar botón de instalación
function showInstallButton() {
    // Solo mostrar en móviles y si no está ya instalada
    if (window.deviceInfo?.isMobile && !window.matchMedia('(display-mode: standalone)').matches) {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-pwa-btn';
        installBtn.className = 'btn btn-primary install-pwa-btn';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideUp 0.3s ease;
        `;
        
        installBtn.addEventListener('click', function() {
            if (window.deferredPrompt) {
                window.deferredPrompt.prompt();
                window.deferredPrompt.userChoice.then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Usuario aceptó instalar la PWA');
                    }
                    window.deferredPrompt = null;
                });
            }
        });
        
        document.body.appendChild(installBtn);
    }
}

// Ocultar botón de instalación
function hideInstallButton() {
    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn) {
        installBtn.remove();
    }
}

// Aplicar optimizaciones específicas del dispositivo
function applyDeviceSpecificOptimizations() {
    const deviceInfo = window.deviceInfo;
    if (!deviceInfo) return;
    
    // Optimizaciones para móviles
    if (deviceInfo.isMobile) {
        // Reducir calidad de imágenes en móviles de baja potencia
        if (deviceInfo.width < 768) {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                img.style.imageRendering = 'auto';
            });
        }
        
        // Optimizar scroll en iOS
        if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            document.body.style.webkitOverflowScrolling = 'touch';
        }
    }
    
    // Optimizaciones para pantallas de alta densidad
    if (deviceInfo.isHighDensity) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.style.imageRendering = 'crisp-edges';
        });
    }
}

// Funciones para abrir modal de autenticación
function openAuthModal(tab) {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('active');
        showAuthTab(tab);
    }
}

// Funciones para autenticación social
function loginWithGoogle() {
    // Simular login con Google
    console.log('Iniciando login con Google...');
    alert('Funcionalidad de Google en desarrollo. Por ahora, usa el formulario de registro.');
}

function loginWithApple() {
    // Simular login con Apple
    console.log('Iniciando login con Apple...');
    alert('Funcionalidad de Apple en desarrollo. Por ahora, usa el formulario de registro.');
}
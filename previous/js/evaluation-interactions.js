// Sensus - Interacciones de la Página de Evaluación
// JavaScript para feedback táctil y animaciones suaves

document.addEventListener('DOMContentLoaded', function() {
    // ===== MENÚ HAMBURGUESA =====
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            
            // Cerrar menú al hacer clic en enlaces
            const navItems = navLinks.querySelectorAll('a');
            navItems.forEach(link => {
                link.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                });
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // ===== ANIMACIONES DE ENTRADA =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar elementos para animaciones
    const animatedElements = document.querySelectorAll('.test-card, .info-card, .ethical-warning, .cta-content');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // ===== FEEDBACK TÁCTIL EN TESTS =====
    const testCards = document.querySelectorAll('.test-card');
    testCards.forEach(card => {
        // Efecto hover suave
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Vibración suave al hacer clic
        card.addEventListener('click', function(e) {
            // Prevenir clic si no es en el botón
            if (!e.target.classList.contains('test-button')) {
                return;
            }
            
            // Añadir clase de vibración
            this.classList.add('gentle-vibration');
            
            // Remover clase después de la animación
            setTimeout(() => {
                this.classList.remove('gentle-vibration');
            }, 100);
        });
    });

    // ===== EFECTOS EN BOTONES =====
    const buttons = document.querySelectorAll('.test-button, .cta-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-1px)';
        });
    });

    // ===== SMOOTH SCROLL PARA ENLACES INTERNOS =====
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== EFECTO DE PULSO EN ELEMENTOS IMPORTANTES =====
    const importantElements = document.querySelectorAll('.ethical-warning, .test-validation');
    importantElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // ===== DETECCIÓN DE DISPOSITIVO TÁCTIL =====
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        
        // Añadir efectos táctiles específicos
        testCards.forEach(card => {
            card.addEventListener('touchstart', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // ===== MEJORA DE ACCESIBILIDAD =====
    // Añadir focus visible a elementos interactivos
    const interactiveElements = document.querySelectorAll('button, a, .test-card');
    interactiveElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-blue)';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // ===== ANIMACIÓN DE PROGRESO EN TESTS =====
    const testButtons = document.querySelectorAll('.test-button');
    testButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Crear efecto de carga
            const originalText = this.textContent;
            this.textContent = 'Preparando...';
            this.style.opacity = '0.7';
            
            // Simular preparación del test
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
                
                // Aquí se podría redirigir al test real
                console.log('Iniciando test:', this.closest('.test-card').querySelector('.test-title').textContent);
            }, 1000);
        });
    });

    // ===== EFECTO DE RESALTADO EN ADVERTENCIA ÉTICA =====
    const ethicalWarning = document.querySelector('.ethical-warning');
    if (ethicalWarning) {
        // Efecto de pulso suave cada 5 segundos
        setInterval(() => {
            ethicalWarning.style.transform = 'scale(1.02)';
            setTimeout(() => {
                ethicalWarning.style.transform = 'scale(1)';
            }, 200);
        }, 5000);
    }

    // ===== OPTIMIZACIÓN DE RENDIMIENTO =====
    // Throttle para eventos de scroll
    let ticking = false;
    
    function updateOnScroll() {
        // Efectos de scroll si es necesario
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });

    // ===== DEBUG MODE (solo en desarrollo) =====
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Sensus Evaluation Interactions: Cargado correctamente');
        console.log('Dispositivo táctil detectado:', isTouchDevice);
        console.log('Tests disponibles:', testCards.length);
    }
});

// ===== FUNCIONES UTILITARIAS =====

// Función para añadir vibración suave
function addGentleVibration(element) {
    if (element) {
        element.classList.add('gentle-vibration');
        setTimeout(() => {
            element.classList.remove('gentle-vibration');
        }, 100);
    }
}

// Función para mostrar feedback de interacción
function showInteractionFeedback(element, message) {
    if (element && message) {
        const originalText = element.textContent;
        element.textContent = message;
        element.style.opacity = '0.8';
        
        setTimeout(() => {
            element.textContent = originalText;
            element.style.opacity = '1';
        }, 1000);
    }
}

// Función para toggle de menú móvil
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    }
}

// Exportar funciones para uso global si es necesario
window.SensusEvaluation = {
    addGentleVibration,
    showInteractionFeedback,
    toggleMobileMenu
};

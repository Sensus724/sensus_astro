// Sensus - Interacciones del Santuario Digital
// JavaScript mínimo para animaciones suaves y UX

document.addEventListener('DOMContentLoaded', function() {
    // ===== ANIMACIÓN DE CARGA =====
    const loadingHeart = document.querySelector('.loading-heart');
    if (loadingHeart) {
        setTimeout(() => {
            loadingHeart.style.display = 'none';
        }, 1500);
    }

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
    const animatedElements = document.querySelectorAll('.section-card, .testimonial-card, .science-card, .privacy-card, .illustration');
    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // ===== EFECTOS HOVER EN TARJETAS =====
    const cards = document.querySelectorAll('.section-card, .science-card, .privacy-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
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

    // ===== EFECTO DE ELEVACIÓN EN BOTONES =====
    const buttons = document.querySelectorAll('.btn-cta');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // ===== ANIMACIÓN DE PULSO EN ELEMENTOS ESPECIALES =====
    const pulseElements = document.querySelectorAll('.stat-chip, .certification-badge');
    pulseElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.classList.add('pulse-animation');
        });
        
        el.addEventListener('mouseleave', function() {
            this.classList.remove('pulse-animation');
        });
    });

    // ===== EFECTO DE TILT EN ILUSTRACIONES =====
    const illustrations = document.querySelectorAll('.illustration');
    illustrations.forEach(illustration => {
        illustration.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        illustration.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // ===== CONTADOR ANIMADO PARA ESTADÍSTICAS =====
    const counters = document.querySelectorAll('[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000; // 2 segundos
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    if (current < target) {
                        current += increment;
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // ===== EFECTO DE PARALLAX SUAVE =====
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.illustration');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });

    // ===== MEJORA DE ACCESIBILIDAD =====
    // Añadir focus visible a elementos interactivos
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    interactiveElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--primary-blue)';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // ===== DETECCIÓN DE DISPOSITIVO TÁCTIL =====
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        
        // Desactivar efectos hover en dispositivos táctiles
        const hoverElements = document.querySelectorAll('.section-card, .science-card, .privacy-card');
        hoverElements.forEach(el => {
            el.style.transition = 'transform 0.2s ease';
        });
    }

    // ===== OPTIMIZACIÓN DE RENDIMIENTO =====
    // Throttle para eventos de scroll
    let ticking = false;
    
    function updateOnScroll() {
        // Aquí se pueden añadir más efectos de scroll si es necesario
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
        console.log('Sensus Sanctuary Design: Cargado correctamente');
        console.log('Dispositivo táctil detectado:', isTouchDevice);
        console.log('Elementos animados:', animatedElements.length);
    }
});

// ===== FUNCIONES UTILITARIAS =====

// Función para añadir clase de animación
function addAnimationClass(element, className) {
    if (element) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, 600);
    }
}

// Función para smooth scroll a elemento
function scrollToElement(elementId, offset = 80) {
    const element = document.getElementById(elementId);
    if (element) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
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
window.SensusSanctuary = {
    addAnimationClass,
    scrollToElement,
    toggleMobileMenu
};

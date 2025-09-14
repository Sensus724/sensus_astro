// Sensus - Interacciones del Header Limpio
// JavaScript para mejorar la experiencia del header

document.addEventListener('DOMContentLoaded', function() {
    // ===== ELEMENTOS DEL HEADER =====
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const logo = document.querySelector('.logo-placeholder');
    
    // ===== MENÚ HAMBURGUESA =====
    if (menuToggle && navLinks) {
        // Crear overlay si no existe
        let menuOverlay = document.querySelector('.menu-overlay');
        if (!menuOverlay) {
            menuOverlay = document.createElement('div');
            menuOverlay.className = 'menu-overlay';
            document.body.appendChild(menuOverlay);
        }
        
        // Función para abrir menú
        function openMenu() {
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Función para cerrar menú
        function closeMenu() {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Event listeners
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Cerrar menú al hacer clic en overlay
        menuOverlay.addEventListener('click', closeMenu);
        
        // Cerrar menú al hacer clic en enlaces
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Cerrar menú al redimensionar ventana
        window.addEventListener('resize', function() {
            if (window.innerWidth > 767) {
                closeMenu();
            }
        });
    }
    
    // ===== EFECTO DE SCROLL EN HEADER =====
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // ===== EFECTO HOVER EN LOGO =====
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // ===== SMOOTH SCROLL PARA ENLACES INTERNOS =====
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                if (navLinks && navLinks.classList.contains('active')) {
                    closeMenu();
                }
            }
        });
    });
    
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
    const animatedElements = document.querySelectorAll('.nav-links li');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
    
    // ===== DETECCIÓN DE DISPOSITIVO TÁCTIL =====
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        
        // Mejorar interacciones táctiles
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            item.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }
    
    // ===== MEJORA DE ACCESIBILIDAD =====
    // Añadir focus visible a elementos interactivos
    const interactiveElements = document.querySelectorAll('.menu-toggle, .nav-links a, .logo-placeholder');
    interactiveElements.forEach(el => {
        el.addEventListener('focus', function() {
            this.style.outline = '2px solid #2563EB';
            this.style.outlineOffset = '2px';
        });
        
        el.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // ===== EFECTO DE RESALTADO EN PÁGINA ACTIVA =====
    const currentPage = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && currentPage.includes(href.replace('../', '').replace('./', ''))) {
            item.classList.add('active');
        }
    });
    
    // ===== OPTIMIZACIÓN DE RENDIMIENTO =====
    // Throttle para eventos de scroll
    let scrollTicking = false;
    
    function handleScroll() {
        if (!scrollTicking) {
            requestAnimationFrame(updateHeader);
            scrollTicking = true;
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // ===== DEBUG MODE (solo en desarrollo) =====
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Sensus Header Interactions: Cargado correctamente');
        console.log('Dispositivo táctil detectado:', isTouchDevice);
        console.log('Página actual:', currentPage);
    }
});

// ===== FUNCIONES UTILITARIAS =====

// Función para toggle de menú móvil
function toggleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && navLinks) {
        const isActive = navLinks.classList.contains('active');
        
        if (isActive) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } else {
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            if (menuOverlay) menuOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
}

// Función para cerrar menú móvil
function closeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (menuToggle && navLinks) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        if (menuOverlay) menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Exportar funciones para uso global
window.SensusHeader = {
    toggleMobileMenu,
    closeMobileMenu
};

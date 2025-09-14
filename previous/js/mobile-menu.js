// Sensus - Menú Hamburguesa Móvil
// Funcionalidad para el menú hamburguesa en dispositivos móviles

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del menú
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Crear overlay si no existe
    if (!menuOverlay) {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }
    
    // Función para abrir menú
    function openMenu() {
        if (menuToggle && navLinks) {
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            if (document.querySelector('.menu-overlay')) {
                document.querySelector('.menu-overlay').classList.add('active');
            }
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Función para cerrar menú
    function closeMenu() {
        if (menuToggle && navLinks) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            if (document.querySelector('.menu-overlay')) {
                document.querySelector('.menu-overlay').classList.remove('active');
            }
            document.body.style.overflow = '';
        }
    }
    
    // Event listeners
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            if (navLinks.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }
    
    // Cerrar menú al hacer clic en overlay
    if (document.querySelector('.menu-overlay')) {
        document.querySelector('.menu-overlay').addEventListener('click', closeMenu);
    }
    
    // Cerrar menú al hacer clic en enlaces
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
    
    // Cerrar menú al redimensionar ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
    
    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Detectar si es móvil
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Mostrar/ocultar menú hamburguesa según el tamaño de pantalla
    function toggleMenuVisibility() {
        if (isMobile()) {
            menuToggle.style.display = 'flex';
            navLinks.style.display = 'flex';
        } else {
            menuToggle.style.display = 'none';
            navLinks.style.display = 'flex';
            closeMenu();
        }
    }
    
    // Ejecutar al cargar y al redimensionar
    toggleMenuVisibility();
    window.addEventListener('resize', toggleMenuVisibility);
    
    // Smooth scroll para enlaces internos
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
                
                // Cerrar menú si está abierto
                closeMenu();
            }
        });
    });
    
    // Mejorar accesibilidad
    menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    // Actualizar aria-expanded cuando se abre/cierra el menú
    const originalOpenMenu = openMenu;
    const originalCloseMenu = closeMenu;
    
    openMenu = function() {
        originalOpenMenu();
        menuToggle.setAttribute('aria-expanded', 'true');
    };
    
    closeMenu = function() {
        originalCloseMenu();
        menuToggle.setAttribute('aria-expanded', 'false');
    };
    
    // Lazy loading para imágenes
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Optimización de scroll
    let ticking = false;
    
    function updateScrollPosition() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollPosition);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
    
    // Mejorar rendimiento en móviles
    if (isMobile()) {
        // Reducir animaciones en móviles de bajo rendimiento
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--mobile-transition', 'none');
        }
        
        // Optimizar touch events
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        document.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe up - cerrar menú si está abierto
                    if (navLinks.classList.contains('active')) {
                        closeMenu();
                    }
                }
            }
        }
    }
    
    // Debug mode (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Sensus Mobile Menu: Cargado correctamente');
        console.log('Dispositivo móvil detectado:', isMobile());
    }
});

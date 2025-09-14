// Sensus - Módulo de responsividad optimizado

document.addEventListener('DOMContentLoaded', function() {
    initResponsiveModule();
});

function initResponsiveModule() {
    // Detectar tipo de dispositivo
    detectDevice();
    
    // Inicializar menú móvil
    initMobileMenu();
    
    // Inicializar comportamiento de scroll
    initScrollBehavior();
    
    // Inicializar gestos táctiles
    initTouchGestures();
    
    // Inicializar lazy loading
    initLazyLoading();
    
    // Ajustar elementos según el tamaño de pantalla
    adjustElementsForScreenSize();
    
    // Optimizar performance en móviles
    optimizeForMobile();
    
    // Escuchar cambios en el tamaño de la ventana con debounce
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            detectDevice();
            adjustElementsForScreenSize();
            optimizeForMobile();
        }, 150);
    });
    
    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            detectDevice();
            adjustElementsForScreenSize();
        }, 100);
    });
}

// Detectar tipo de dispositivo mejorado
function detectDevice() {
    const html = document.documentElement;
    
    // Detectar si es móvil (más preciso)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(navigator.userAgent);
    
    // Detectar si es tablet
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent);
    
    // Detectar si es pantalla táctil
    const isTouchDevice = ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) || 
                         (navigator.msMaxTouchPoints > 0) ||
                         ('ontouchstart' in document.documentElement);
    
    // Detectar tamaño de pantalla con breakpoints más precisos
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const isExtraSmall = width < 576;
    const isSmall = width >= 576 && width < 768;
    const isMedium = width >= 768 && width < 992;
    const isLarge = width >= 992 && width < 1200;
    const isExtraLarge = width >= 1200;
    
    // Detectar orientación
    const isLandscape = width > height;
    const isPortrait = height > width;
    
    // Detectar si es pantalla de alta densidad
    const isHighDensity = window.devicePixelRatio > 1;
    
    // Detectar si el usuario prefiere movimiento reducido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Establecer clases en el elemento HTML
    html.classList.remove(
        'is-mobile', 'is-desktop', 'is-tablet', 
        'is-touch', 'is-no-touch', 
        'is-extra-small', 'is-small', 'is-medium', 'is-large', 'is-extra-large',
        'is-landscape', 'is-portrait',
        'is-high-density', 'prefers-reduced-motion'
    );
    
    // Aplicar clases según detección
    html.classList.add(isMobile ? 'is-mobile' : 'is-desktop');
    if (isTablet) html.classList.add('is-tablet');
    html.classList.add(isTouchDevice ? 'is-touch' : 'is-no-touch');
    
    if (isExtraSmall) html.classList.add('is-extra-small');
    else if (isSmall) html.classList.add('is-small');
    else if (isMedium) html.classList.add('is-medium');
    else if (isLarge) html.classList.add('is-large');
    else if (isExtraLarge) html.classList.add('is-extra-large');
    
    html.classList.add(isLandscape ? 'is-landscape' : 'is-portrait');
    if (isHighDensity) html.classList.add('is-high-density');
    if (prefersReducedMotion) html.classList.add('prefers-reduced-motion');
    
    // Guardar información del dispositivo en el objeto window para uso global
    window.deviceInfo = {
        isMobile,
        isTablet,
        isTouchDevice,
        isLandscape,
        isPortrait,
        isHighDensity,
        prefersReducedMotion,
        width,
        height,
        breakpoint: isExtraSmall ? 'xs' : isSmall ? 'sm' : isMedium ? 'md' : isLarge ? 'lg' : 'xl'
    };
}

// Inicializar menú móvil
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = navLinks ? navLinks.querySelectorAll('li') : [];
    
    if (!menuToggle || !navLinks) return;
    
    // Añadir índices a los elementos del menú para animación escalonada
    navItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    menuToggle.addEventListener('click', function() {
        // Alternar clase activa en el botón
        this.classList.toggle('active');
        
        // Alternar clase activa en los enlaces de navegación
        navLinks.classList.toggle('active');
        
        // Alternar atributo aria-expanded
        const expanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !expanded);
        
        // Aplicar animación a los elementos del menú
        if (navLinks.classList.contains('active')) {
            navItems.forEach((item, index) => {
                item.style.animationDelay = `${0.1 * index}s`;
                item.style.animation = 'menuFadeIn 0.5s forwards';
            });
        } else {
            navItems.forEach(item => {
                item.style.animation = 'none';
            });
        }
    });
    
    // Añadir efecto hover a los elementos del menú
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            link.addEventListener('mouseenter', function() {
                this.style.transition = 'all 0.3s ease';
            });
            
            link.addEventListener('mouseleave', function() {
                this.style.transition = 'all 0.3s ease';
            });
        }
    });
    
    // Cerrar menú al hacer clic en un enlace
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            // Solo cerrar en pantallas pequeñas
            if (window.innerWidth < 768) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(event) {
        const isClickInsideNav = navLinks.contains(event.target);
        const isClickOnMenuToggle = menuToggle.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnMenuToggle && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Inicializar comportamiento de scroll
function initScrollBehavior() {
    // Obtener el header
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    // Posición de scroll anterior
    let lastScrollTop = 0;
    
    // Escuchar evento de scroll
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Determinar dirección del scroll
        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            // Scroll hacia abajo
            header.classList.add('header-hidden');
        } else {
            // Scroll hacia arriba
            header.classList.remove('header-hidden');
        }
        
        // Agregar sombra al hacer scroll
        if (scrollTop > 10) {
            header.classList.add('header-shadow');
        } else {
            header.classList.remove('header-shadow');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Botón de volver arriba
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(backToTopBtn);
    
    // Mostrar/ocultar botón según la posición de scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
    
    // Evento de clic en el botón
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Añadir clase fade-in a elementos que queremos animar
    const animatedElements = document.querySelectorAll('.feature-card, .step-card, .section-title, .hero-content');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Función para comprobar si un elemento está en el viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Función para manejar el scroll y mostrar elementos
    function handleScroll() {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach(element => {
            if (isElementInViewport(element)) {
                element.classList.add('visible');
            }
        });
    }
    
    // Ejecutar una vez para elementos visibles inicialmente
    handleScroll();
    
    // Añadir evento de scroll
    window.addEventListener('scroll', handleScroll);
}

// Inicializar gestos táctiles
function initTouchGestures() {
    if (!window.deviceInfo?.isTouchDevice) return;
    
    // Swipe para cerrar menú móvil
    let startX = 0;
    let startY = 0;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Detectar swipe horizontal
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            
            if (navLinks && navLinks.classList.contains('active')) {
                // Swipe hacia la derecha para cerrar menú
                if (diffX < 0) {
                    navLinks.classList.remove('active');
                    menuToggle?.classList.remove('active');
                }
            }
        }
        
        startX = 0;
        startY = 0;
    }, { passive: true });
    
    // Mejorar interacciones táctiles para botones
    const touchElements = document.querySelectorAll('.btn, .option-card, .mood-btn, .nav-links li a');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
    });
}

// Inicializar lazy loading para imágenes
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }
}

// Optimizar para móviles
function optimizeForMobile() {
    if (!window.deviceInfo?.isMobile) return;
    
    // Reducir animaciones en móviles para mejor performance
    if (window.deviceInfo.prefersReducedMotion) {
        document.documentElement.style.setProperty('--transition-fast', '0.01s');
        document.documentElement.style.setProperty('--transition-normal', '0.01s');
        document.documentElement.style.setProperty('--transition-slow', '0.01s');
    }
    
    // Optimizar scroll en iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.webkitOverflowScrolling = 'touch';
    }
    
    // Prevenir zoom en inputs en iOS
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type !== 'range' && input.type !== 'checkbox' && input.type !== 'radio') {
            input.style.fontSize = '16px';
        }
    });
    
    // Optimizar viewport para móviles
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
}

// Ajustar elementos según el tamaño de pantalla
function adjustElementsForScreenSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Ajustar altura de elementos hero
    const heroSections = document.querySelectorAll('.hero, .hero-section');
    heroSections.forEach(section => {
        if (width < 768) {
            section.style.minHeight = '60vh';
        } else if (width < 992) {
            section.style.minHeight = '70vh';
        } else {
            section.style.minHeight = '80vh';
        }
    });
    
    // Ajustar disposición de tarjetas según breakpoint
    const cardGrids = document.querySelectorAll('.feature-cards, .steps-container, .testimonials-grid');
    cardGrids.forEach(grid => {
        grid.classList.remove('grid-mobile', 'grid-tablet', 'grid-desktop');
        
        if (width < 576) {
            grid.classList.add('grid-mobile');
        } else if (width < 992) {
            grid.classList.add('grid-tablet');
        } else {
            grid.classList.add('grid-desktop');
        }
    });
    
    // Ajustar tamaño de fuente para títulos
    const mainHeadings = document.querySelectorAll('h1, h2, .section-title');
    mainHeadings.forEach(heading => {
        heading.classList.remove('mobile-heading', 'tablet-heading');
        
        if (width < 576) {
            heading.classList.add('mobile-heading');
        } else if (width < 992) {
            heading.classList.add('tablet-heading');
        }
    });
    
    // Ajustar padding de contenedores
    const containers = document.querySelectorAll('.container');
    containers.forEach(container => {
        if (width < 576) {
            container.style.padding = '0 1rem';
        } else if (width < 768) {
            container.style.padding = '0 1.5rem';
        } else {
            container.style.padding = '0 2rem';
        }
    });
    
    // Ajustar modal para pantallas pequeñas
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
        if (width < 576) {
            modal.style.width = '95%';
            modal.style.margin = '1rem';
        } else {
            modal.style.width = '';
            modal.style.margin = '';
        }
    });
}
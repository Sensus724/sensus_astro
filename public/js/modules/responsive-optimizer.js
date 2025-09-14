// Sensus - Optimizador de Responsividad y UX
// Mejora la experiencia en todos los dispositivos

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar optimizaciones
    initResponsiveOptimizations();
    initTouchOptimizations();
    initScrollOptimizations();
    initFormOptimizations();
    initPerformanceOptimizations();
});

// Optimizaciones responsivas
function initResponsiveOptimizations() {
    // Detectar tipo de dispositivo
    const deviceType = detectDeviceType();
    document.body.classList.add(`device-${deviceType}`);
    
    // Ajustar viewport para iOS
    if (isIOS()) {
        adjustViewportForIOS();
    }
    
    // Optimizar imágenes
    optimizeImages();
    
    // Ajustar fuentes según el dispositivo
    adjustFontsForDevice(deviceType);
    
    // Configurar breakpoints dinámicos
    setupDynamicBreakpoints();
}

// Detectar tipo de dispositivo
function detectDeviceType() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspectRatio = width / height;
    
    if (width <= 575) {
        return 'mobile-small';
    } else if (width <= 767) {
        return 'mobile-large';
    } else if (width <= 991) {
        return 'tablet';
    } else if (width <= 1199) {
        return 'desktop-small';
    } else {
        return 'desktop-large';
    }
}

// Verificar si es iOS
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// Ajustar viewport para iOS
function adjustViewportForIOS() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
    }
    
    // Ajustar altura para iOS Safari
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
}

// Optimizar imágenes
function optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Lazy loading
        if ('loading' in HTMLImageElement.prototype) {
            img.loading = 'lazy';
        }
        
        // Optimizar para pantallas de alta densidad
        if (window.devicePixelRatio > 1) {
            const src = img.src;
            if (src && !src.includes('@2x') && !src.includes('@3x')) {
                // Aquí podrías cargar versiones de mayor resolución
                // Por ahora solo optimizamos el CSS
                img.style.imageRendering = 'crisp-edges';
            }
        }
        
        // Manejar errores de carga
        img.addEventListener('error', function() {
            this.style.display = 'none';
        });
    });
}

// Ajustar fuentes según el dispositivo
function adjustFontsForDevice(deviceType) {
    const root = document.documentElement;
    
    switch (deviceType) {
        case 'mobile-small':
            root.style.setProperty('--font-scale', '0.9');
            break;
        case 'mobile-large':
            root.style.setProperty('--font-scale', '0.95');
            break;
        case 'tablet':
            root.style.setProperty('--font-scale', '1.0');
            break;
        case 'desktop-small':
            root.style.setProperty('--font-scale', '1.05');
            break;
        case 'desktop-large':
            root.style.setProperty('--font-scale', '1.1');
            break;
    }
}

// Configurar breakpoints dinámicos
function setupDynamicBreakpoints() {
    const breakpoints = {
        xs: 320,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    };
    
    // Actualizar clases de breakpoint
    const updateBreakpointClasses = () => {
        const width = window.innerWidth;
        const body = document.body;
        
        // Remover clases anteriores
        Object.keys(breakpoints).forEach(bp => {
            body.classList.remove(`bp-${bp}`);
        });
        
        // Agregar clase actual
        let currentBP = 'xs';
        Object.entries(breakpoints).forEach(([bp, width]) => {
            if (window.innerWidth >= width) {
                currentBP = bp;
            }
        });
        
        body.classList.add(`bp-${currentBP}`);
    };
    
    updateBreakpointClasses();
    window.addEventListener('resize', debounce(updateBreakpointClasses, 100));
}

// Optimizaciones táctiles
function initTouchOptimizations() {
    // Mejorar botones táctiles
    const touchElements = document.querySelectorAll('.btn, .option-card, .mood-btn, .nav-links li a');
    
    touchElements.forEach(element => {
        // Asegurar tamaño mínimo táctil
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
        
        // Agregar feedback táctil
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Prevenir zoom en inputs en iOS
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (isIOS()) {
            input.style.fontSize = '16px';
        }
    });
    
    // Mejorar scroll en iOS
    if (isIOS()) {
        document.body.style.webkitOverflowScrolling = 'touch';
    }
}

// Optimizaciones de scroll
function initScrollOptimizations() {
    // Smooth scroll mejorado
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Header sticky optimizado
    const header = document.querySelector('.header, .app-header');
    if (header) {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            // Agregar sombra cuando está en scroll
            if (currentScrollY > 10) {
                header.classList.add('header-shadow');
            } else {
                header.classList.remove('header-shadow');
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    }
    
    // Botón de volver arriba
    createBackToTopButton();
    
    // Animaciones de entrada
    setupScrollAnimations();
}

// Crear botón de volver arriba
function createBackToTopButton() {
    const button = document.createElement('button');
    button.className = 'back-to-top';
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.setAttribute('aria-label', 'Volver arriba');
    document.body.appendChild(button);
    
    // Mostrar/ocultar botón
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 300) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }, 100));
    
    // Funcionalidad del botón
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Configurar animaciones de scroll
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in, .card, .feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Optimizaciones de formularios
function initFormOptimizations() {
    // Mejorar validación en tiempo real
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
            
            // Mejorar UX en móviles
            if (input.type === 'email' || input.type === 'tel') {
                input.setAttribute('autocomplete', 'on');
            }
            
            if (input.type === 'password') {
                input.setAttribute('autocomplete', 'current-password');
            }
        });
        
        // Prevenir envío doble
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && submitBtn.disabled) {
                e.preventDefault();
                return false;
            }
            
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

// Validar campo individual
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    
    // Limpiar errores anteriores
    clearFieldError(e);
    
    // Validaciones básicas
    if (field.required && !value) {
        showFieldError(field, `${getFieldLabel(field)} es requerido`);
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Ingresa un email válido');
        return false;
    }
    
    if (field.type === 'password' && value && value.length < 6) {
        showFieldError(field, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    return true;
}

// Limpiar error de campo
function clearFieldError(e) {
    const field = e.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('error');
}

// Mostrar error de campo
function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = 'var(--font-xs)';
    errorElement.style.marginTop = 'var(--spacing-xs)';
    
    field.parentNode.appendChild(errorElement);
}

// Obtener etiqueta del campo
function getFieldLabel(field) {
    const label = field.parentNode.querySelector('label');
    return label ? label.textContent : field.placeholder || 'Este campo';
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Optimizaciones de performance
function initPerformanceOptimizations() {
    // Preload de recursos críticos
    preloadCriticalResources();
    
    // Optimizar repaints y reflows
    optimizeRendering();
    
    // Lazy loading de imágenes
    setupLazyLoading();
    
    // Debounce de eventos
    setupEventDebouncing();
}

// Precargar recursos críticos
function preloadCriticalResources() {
    const criticalImages = [
        'assets/images/Logo.jpeg',
        'assets/images/calma.jpeg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Optimizar rendering
function optimizeRendering() {
    // Usar transform en lugar de cambiar propiedades que causan reflow
    const animatedElements = document.querySelectorAll('.card, .btn, .option-card');
    
    animatedElements.forEach(element => {
        element.style.willChange = 'transform';
    });
}

// Configurar lazy loading
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
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
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Configurar debouncing de eventos
function setupEventDebouncing() {
    // Debounce resize
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Debounce scroll
    window.addEventListener('scroll', debounce(handleScroll, 100));
}

// Manejar resize
function handleResize() {
    // Actualizar breakpoints
    const deviceType = detectDeviceType();
    document.body.className = document.body.className.replace(/device-\w+/g, '');
    document.body.classList.add(`device-${deviceType}`);
    
    // Ajustar fuentes
    adjustFontsForDevice(deviceType);
}

// Manejar scroll
function handleScroll() {
    // Aquí puedes agregar lógica adicional de scroll
}

// Función debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Detectar capacidades del dispositivo
function detectDeviceCapabilities() {
    const capabilities = {
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        hover: window.matchMedia('(hover: hover)').matches,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
    };
    
    // Aplicar clases según capacidades
    Object.entries(capabilities).forEach(([capability, supported]) => {
        if (supported) {
            document.body.classList.add(`capability-${capability}`);
        }
    });
    
    return capabilities;
}

// Inicializar detección de capacidades
detectDeviceCapabilities();

// Exportar funciones para uso global
window.ResponsiveOptimizer = {
    detectDeviceType,
    isIOS,
    adjustViewportForIOS,
    optimizeImages,
    adjustFontsForDevice,
    debounce,
    throttle
};


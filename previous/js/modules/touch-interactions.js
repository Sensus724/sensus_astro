// Sensus - Módulo de interacciones táctiles optimizadas

document.addEventListener('DOMContentLoaded', function() {
    initTouchInteractions();
});

function initTouchInteractions() {
    // Solo inicializar en dispositivos táctiles
    if (!window.deviceInfo?.isTouchDevice) return;
    
    // Inicializar gestos táctiles
    initTouchGestures();
    
    // Mejorar botones para táctil
    enhanceTouchButtons();
    
    // Optimizar formularios para táctil
    optimizeTouchForms();
    
    // Mejorar navegación táctil
    enhanceTouchNavigation();
    
    // Configurar scroll táctil
    setupTouchScroll();
    
    // Mejorar modales para táctil
    enhanceTouchModals();
}

// Inicializar gestos táctiles avanzados
function initTouchGestures() {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isScrolling = false;
    
    // Detectar inicio de toque
    document.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
        isScrolling = false;
        
        // Añadir clase táctil al elemento
        const target = e.target.closest('.btn, .option-card, .mood-btn, .nav-links li a, .card');
        if (target) {
            target.classList.add('touch-start');
        }
    }, { passive: true });
    
    // Detectar movimiento durante toque
    document.addEventListener('touchmove', function(e) {
        if (!startX || !startY) return;
        
        const touch = e.touches[0];
        const diffX = Math.abs(touch.clientX - startX);
        const diffY = Math.abs(touch.clientY - startY);
        
        // Detectar si es scroll
        if (diffY > diffX && diffY > 10) {
            isScrolling = true;
        }
    }, { passive: true });
    
    // Detectar fin de toque
    document.addEventListener('touchend', function(e) {
        if (!startX || !startY) return;
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();
        
        const diffX = startX - endX;
        const diffY = startY - endY;
        const diffTime = endTime - startTime;
        
        // Limpiar clases táctiles
        document.querySelectorAll('.touch-start').forEach(el => {
            el.classList.remove('touch-start');
        });
        
        // Detectar tap (toque rápido)
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && diffTime < 300) {
            handleTap(e.target, e);
        }
        
        // Detectar swipe horizontal
        else if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && !isScrolling) {
            handleSwipe(diffX > 0 ? 'left' : 'right', e);
        }
        
        // Detectar swipe vertical
        else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            handleSwipe(diffY > 0 ? 'up' : 'down', e);
        }
        
        // Resetear variables
        startX = 0;
        startY = 0;
        startTime = 0;
        isScrolling = false;
    }, { passive: true });
}

// Manejar tap táctil
function handleTap(target, event) {
    // Buscar el elemento interactivo más cercano
    const interactiveElement = target.closest('button, a, [role="button"], .btn, .option-card, .mood-btn');
    
    if (interactiveElement) {
        // Añadir efecto visual
        interactiveElement.classList.add('touch-tap');
        setTimeout(() => {
            interactiveElement.classList.remove('touch-tap');
        }, 150);
        
        // Simular click si no es un enlace
        if (interactiveElement.tagName !== 'A' && interactiveElement.tagName !== 'BUTTON') {
            interactiveElement.click();
        }
    }
}

// Manejar gestos de swipe
function handleSwipe(direction, event) {
    const target = event.target;
    
    // Swipe para cerrar menú móvil
    if (direction === 'right') {
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.querySelector('.menu-toggle');
        
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle?.classList.remove('active');
        }
    }
    
    // Swipe para navegar en carruseles
    if (direction === 'left' || direction === 'right') {
        const carousel = target.closest('.testimonials-slider, .gallery-slider');
        if (carousel) {
            const prevBtn = carousel.querySelector('.prev-testimonial, .prev-gallery');
            const nextBtn = carousel.querySelector('.next-testimonial, .next-gallery');
            
            if (direction === 'left' && nextBtn) {
                nextBtn.click();
            } else if (direction === 'right' && prevBtn) {
                prevBtn.click();
            }
        }
    }
    
    // Swipe para cerrar modales
    if (direction === 'down') {
        const modal = target.closest('.modal');
        if (modal && modal.classList.contains('active')) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }
}

// Mejorar botones para interacción táctil
function enhanceTouchButtons() {
    const buttons = document.querySelectorAll('.btn, .option-card, .mood-btn, .nav-links li a');
    
    buttons.forEach(button => {
        // Añadir atributos de accesibilidad
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        
        // Mejorar área táctil
        if (button.offsetHeight < 44) {
            button.style.minHeight = '44px';
            button.style.minWidth = '44px';
        }
        
        // Añadir efectos táctiles
        button.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });
        
        button.addEventListener('touchcancel', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

// Optimizar formularios para táctil
function optimizeTouchForms() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Prevenir zoom en iOS
        if (input.type !== 'range' && input.type !== 'checkbox' && input.type !== 'radio') {
            input.style.fontSize = '16px';
        }
        
        // Mejorar área táctil
        input.style.minHeight = '44px';
        input.style.padding = '12px';
        
        // Añadir efectos táctiles
        input.addEventListener('focus', function() {
            this.classList.add('touch-focus');
        });
        
        input.addEventListener('blur', function() {
            this.classList.remove('touch-focus');
        });
        
        // Mejorar experiencia en móviles
        if (input.type === 'email' || input.type === 'url' || input.type === 'tel') {
            input.setAttribute('autocomplete', 'on');
        }
    });
    
    // Mejorar botones de formulario
    const formButtons = document.querySelectorAll('form .btn, form button');
    formButtons.forEach(button => {
        button.style.minHeight = '48px';
        button.style.fontSize = '16px';
    });
}

// Mejorar navegación táctil
function enhanceTouchNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        // Añadir indicador táctil
        link.style.position = 'relative';
        link.style.overflow = 'hidden';
        
        // Crear efecto ripple
        link.addEventListener('touchstart', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.touches[0].clientX - rect.left - size / 2;
            const y = e.touches[0].clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }, { passive: true });
    });
}

// Configurar scroll táctil optimizado
function setupTouchScroll() {
    // Mejorar scroll en iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.body.style.webkitOverflowScrolling = 'touch';
    }
    
    // Configurar scroll suave para elementos específicos
    const scrollElements = document.querySelectorAll('.scroll-container, .modal-content');
    scrollElements.forEach(element => {
        element.style.webkitOverflowScrolling = 'touch';
        element.style.overflowY = 'auto';
    });
    
    // Prevenir scroll en elementos que no deberían hacer scroll
    const noScrollElements = document.querySelectorAll('.nav-links, .dropdown-menu');
    noScrollElements.forEach(element => {
        element.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    });
}

// Mejorar modales para táctil
function enhanceTouchModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Añadir gestos para cerrar modal
        let startY = 0;
        
        modal.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        modal.addEventListener('touchmove', function(e) {
            if (!startY) return;
            
            const currentY = e.touches[0].clientY;
            const diffY = currentY - startY;
            
            // Si se desliza hacia abajo, mover el modal
            if (diffY > 0) {
                this.style.transform = `translateY(${diffY}px)`;
            }
        }, { passive: true });
        
        modal.addEventListener('touchend', function(e) {
            if (!startY) return;
            
            const currentY = e.changedTouches[0].clientY;
            const diffY = currentY - startY;
            
            // Si se deslizó más de 100px, cerrar modal
            if (diffY > 100) {
                const closeBtn = this.querySelector('.close-modal');
                if (closeBtn) {
                    closeBtn.click();
                }
            }
            
            // Resetear transformación
            this.style.transform = '';
            startY = 0;
        }, { passive: true });
    });
}

// Función para añadir vibración táctil (si está disponible)
function addHapticFeedback() {
    if ('vibrate' in navigator) {
        const interactiveElements = document.querySelectorAll('.btn, .option-card, .mood-btn');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                navigator.vibrate(10); // Vibración suave
            }, { passive: true });
        });
    }
}

// Inicializar feedback háptico
addHapticFeedback();

// Exportar funciones para uso global
window.TouchInteractions = {
    handleTap,
    handleSwipe,
    addHapticFeedback
};

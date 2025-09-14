// Sensus - Menú Móvil Mejorado y Optimizado
// JavaScript para manejo del menú hamburguesa con mejor UX

class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.menuOverlay = document.querySelector('.menu-overlay');
        this.body = document.body;
        this.header = document.querySelector('.header');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.ensureMenuHidden();
        this.bindEvents();
        this.setActivePage();
        this.handleScroll();
        this.handleResize();
    }
    
    ensureMenuHidden() {
        // Asegurar que el menú esté oculto por defecto
        if (this.navLinks) {
            this.navLinks.classList.remove('active');
        }
        if (this.menuOverlay) {
            this.menuOverlay.classList.remove('active');
        }
        if (this.menuToggle) {
            this.menuToggle.classList.remove('active');
        }
        this.isOpen = false;
    }
    
    createOverlay() {
        // Crear overlay si no existe
        if (!this.menuOverlay) {
            this.menuOverlay = document.createElement('div');
            this.menuOverlay.className = 'menu-overlay';
            document.body.appendChild(this.menuOverlay);
        }
    }
    
    bindEvents() {
        // Toggle del menú
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Cerrar menú al hacer click en overlay
        if (this.menuOverlay) {
            this.menuOverlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        
        // Cerrar menú al hacer click en enlaces
        if (this.navLinks) {
            this.navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.closeMenu();
                }
            });
        }
        
        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
        
        // Prevenir scroll cuando el menú está abierto
        document.addEventListener('touchmove', (e) => {
            if (this.isOpen) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.isOpen = true;
        
        // Añadir clases activas
        this.menuToggle?.classList.add('active');
        this.navLinks?.classList.add('active');
        this.menuOverlay?.classList.add('active');
        this.body.classList.add('menu-open');
        
        // Animar elementos del menú
        this.animateMenuItems();
        
        // Prevenir scroll del body
        this.body.style.overflow = 'hidden';
        this.body.style.position = 'fixed';
        this.body.style.width = '100%';
        
        // Focus en el primer enlace para accesibilidad
        const firstLink = this.navLinks?.querySelector('a');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 300);
        }
        
        // Emitir evento personalizado
        this.emitEvent('menuOpened');
    }
    
    closeMenu() {
        this.isOpen = false;
        
        // Remover clases activas
        this.menuToggle?.classList.remove('active');
        this.navLinks?.classList.remove('active');
        this.menuOverlay?.classList.remove('active');
        this.body.classList.remove('menu-open');
        
        // Restaurar scroll del body
        this.body.style.overflow = '';
        this.body.style.position = '';
        this.body.style.width = '';
        
        // Focus en el botón toggle para accesibilidad
        this.menuToggle?.focus();
        
        // Emitir evento personalizado
        this.emitEvent('menuClosed');
    }
    
    animateMenuItems() {
        const menuItems = this.navLinks?.querySelectorAll('li');
        if (menuItems) {
            menuItems.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.1}s`;
            });
        }
    }
    
    setActivePage() {
        const currentPath = window.location.pathname;
        const menuLinks = this.navLinks?.querySelectorAll('a');
        
        if (menuLinks) {
            menuLinks.forEach(link => {
                link.classList.remove('active');
                const linkPath = new URL(link.href).pathname;
                
                if (currentPath === linkPath || 
                    (currentPath === '/' && linkPath.includes('index')) ||
                    (currentPath.includes(linkPath) && linkPath !== '/')) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    handleScroll() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 100) {
                this.header?.classList.add('scrolled');
            } else {
                this.header?.classList.remove('scrolled');
            }
            
            lastScrollY = scrollY;
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }
    
    handleResize() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const width = window.innerWidth;
                
                // Cerrar menú en desktop
                if (width >= 769 && this.isOpen) {
                    this.closeMenu();
                }
                
                // Mostrar/ocultar botón hamburguesa según el tamaño
                this.toggleHamburgerButton(width);
            }, 250);
        });
        
        // Ejecutar al cargar la página
        this.toggleHamburgerButton(window.innerWidth);
    }
    
    toggleHamburgerButton(width) {
        if (this.menuToggle) {
            if (width < 769) {
                // Mostrar botón hamburguesa en móvil
                this.menuToggle.style.display = 'flex';
            } else {
                // Ocultar botón hamburguesa en desktop
                this.menuToggle.style.display = 'none';
                this.closeMenu();
            }
        }
    }
    
    emitEvent(eventName) {
        const event = new CustomEvent(eventName, {
            detail: { isOpen: this.isOpen }
        });
        document.dispatchEvent(event);
    }
    
    // Métodos públicos
    open() {
        this.openMenu();
    }
    
    close() {
        this.closeMenu();
    }
    
    isMenuOpen() {
        return this.isOpen;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar menú móvil
    window.mobileMenu = new MobileMenu();
    
    // Manejar notificaciones (opcional)
    handleNotifications();
    
    // Mejorar accesibilidad
    improveAccessibility();
});

// Función para manejar notificaciones en el menú
function handleNotifications() {
    // Verificar si hay notificaciones pendientes
    const hasNotifications = checkForNotifications();
    
    if (hasNotifications) {
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.classList.add('has-notifications');
        }
    }
}

// Función para verificar notificaciones (implementar según necesidades)
function checkForNotifications() {
    // Aquí puedes implementar la lógica para verificar notificaciones
    // Por ejemplo, desde localStorage, API, etc.
    return false;
}

// Función para mejorar accesibilidad
function improveAccessibility() {
    // Añadir aria-expanded al botón toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        
        // Actualizar aria-expanded cuando el menú se abre/cierra
        document.addEventListener('menuOpened', () => {
            menuToggle.setAttribute('aria-expanded', 'true');
        });
        
        document.addEventListener('menuClosed', () => {
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    }
    
    // Añadir aria-label a los enlaces del menú
    const menuLinks = document.querySelectorAll('.nav-links a');
    menuLinks.forEach(link => {
        if (!link.getAttribute('aria-label')) {
            const text = link.textContent.trim();
            link.setAttribute('aria-label', `Navegar a ${text}`);
        }
    });
}

// Función para cerrar menú al hacer click fuera (opcional)
function handleClickOutside() {
    document.addEventListener('click', (e) => {
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (window.mobileMenu?.isMenuOpen() && 
            !menuToggle?.contains(e.target) && 
            !navLinks?.contains(e.target)) {
            window.mobileMenu.close();
        }
    });
}

// Inicializar click outside
handleClickOutside();

// Exportar para uso global
window.MobileMenu = MobileMenu;

/**
 * Módulo de Interacciones UI - Sensus
 * Maneja todas las interacciones de la interfaz de usuario
 */

class UIInteractions {
  constructor() {
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupScrollToTop();
    this.setupThemeChangeListener();
    this.setupFooterLinks();
    this.setupSmoothScrolling();
    this.setupAccessibility();
  }

  /**
   * Configurar menú móvil
   */
  setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        
        if (isOpen) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      });

      // Cerrar menú al hacer clic en overlay
      if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', this.closeMobileMenu.bind(this));
      }

      // Cerrar menú al hacer clic en enlaces
      const mobileMenuLinks = mobileMenu.querySelectorAll('a');
      mobileMenuLinks.forEach(link => {
        link.addEventListener('click', this.closeMobileMenu.bind(this));
      });

      // Cerrar menú con tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          this.closeMobileMenu();
        }
      });
    }
  }

  openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const body = document.body;

    if (mobileMenu) {
      mobileMenu.classList.add('open');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.add('active');
      body.classList.add('menu-open');
      
      // Animar icono del botón
      const menuIcon = document.querySelector('#mobile-menu-button .menu-icon');
      if (menuIcon) {
        menuIcon.classList.add('active');
      }
    }
  }

  closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const body = document.body;

    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('active');
      body.classList.remove('menu-open');
      
      // Animar icono del botón
      const menuIcon = document.querySelector('#mobile-menu-button .menu-icon');
      if (menuIcon) {
        menuIcon.classList.remove('active');
      }
    }
  }

  /**
   * Configurar botón de scroll to top
   */
  setupScrollToTop() {
    const scrollToTopButton = document.getElementById('scroll-to-top');
    
    if (scrollToTopButton) {
      // Mostrar/ocultar botón según scroll
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          scrollToTopButton.classList.add('visible');
        } else {
          scrollToTopButton.classList.remove('visible');
        }
      });

      // Scroll suave al hacer clic
      scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Configurar listener de cambio de tema
   */
  setupThemeChangeListener() {
    // Detectar cambio de tema del sistema
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Solo cambiar si no hay preferencia guardada
        if (!localStorage.getItem('theme')) {
          document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Configurar enlaces del footer
   */
  setupFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-links a');
    
    footerLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Añadir efecto de click
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
          link.style.transform = '';
        }, 150);
      });
    });
  }

  /**
   * Configurar scroll suave
   */
  setupSmoothScrolling() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothScrollLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href && href !== '#') {
          const target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            
            const headerHeight = document.querySelector('header')?.offsetHeight || 0;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  /**
   * Configurar accesibilidad
   */
  setupAccessibility() {
    // Mejorar navegación por teclado
    document.addEventListener('keydown', (e) => {
      // Skip to main content
      if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.querySelector('.skip-to-main');
        if (skipLink) {
          skipLink.focus();
        }
      }
    });

    // Añadir indicadores de foco
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-visible');
      });

      element.addEventListener('blur', () => {
        element.classList.remove('focus-visible');
      });
    });
  }

  /**
   * Método para mostrar notificaciones
   */
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Auto-remover
    setTimeout(() => {
      this.hideNotification(notification);
    }, duration);

    // Botón de cerrar
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.hideNotification(notification);
    });
  }

  hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Método para mostrar loading
   */
  showLoading(element, text = 'Cargando...') {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span class="loading-text">${text}</span>
      </div>
    `;

    element.style.position = 'relative';
    element.appendChild(loading);
  }

  hideLoading(element) {
    const loading = element.querySelector('.loading-overlay');
    if (loading) {
      loading.remove();
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.uiInteractions = new UIInteractions();
});

export default UIInteractions;

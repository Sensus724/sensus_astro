/**
 * Sensus App - Aplicación Principal
 * Versión con autenticación Firebase
 */

// Importar módulo de autenticación Firebase
import FirebaseAuthModule from './modules/firebase-auth.js';

class SensusApp {
  constructor() {
    this.isInitialized = false;
    this.firebaseAuth = null;
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando Sensus con Firebase...');

    try {
      // Configurar event listeners básicos
      this.setupEventListeners();

      // Inicializar componentes
      this.initializeComponents();

      this.isInitialized = true;
      console.log('✅ Sensus inicializado correctamente');

    } catch (error) {
      console.error('❌ Error inicializando Sensus:', error);
    }
  }

  setupEventListeners() {
    // FAQ Accordion
    document.addEventListener('click', (e) => {
      if (e.target.closest('.faq-question')) {
        const faqItem = e.target.closest('.faq-item');
        if (faqItem) {
          // Cerrar otros items
          document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
              item.classList.remove('active');
            }
          });
          
          // Toggle del item actual
          faqItem.classList.toggle('active');
        }
      }
    });

    // Botones de autenticación
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-auth="login"]')) {
        this.showLoginModal();
      } else if (e.target.matches('[data-auth="register"]')) {
        this.showRegisterModal();
      } else if (e.target.matches('[data-auth="logout"]')) {
        this.logout();
      }
    });

    // Formularios de autenticación
    document.addEventListener('submit', (e) => {
      if (e.target.matches('#login-form')) {
        e.preventDefault();
        this.handleLogin(e.target);
      } else if (e.target.matches('#register-form')) {
        e.preventDefault();
        this.handleRegister(e.target);
      }
    });

    // Cerrar modales
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal-close') || e.target.matches('.modal-overlay')) {
        this.hideAuthModal();
      }
    });
  }

  initializeComponents() {
    // El módulo de Firebase maneja automáticamente el estado de autenticación
    // No necesitamos verificar almacenamiento manualmente

    // Configurar listeners para eventos de Firebase Auth
    this.setupFirebaseAuthListeners();

    // Actualizar UI inicial
    this.updateAuthUI();
  }

  setupFirebaseAuthListeners() {
    // Escuchar eventos de autenticación de Firebase
    window.addEventListener('auth:login', (event) => {
      console.log('🔐 Usuario inició sesión:', event.detail.user.email);
      this.updateAuthUI();
    });

    window.addEventListener('auth:logout', () => {
      console.log('🔓 Usuario cerró sesión');
      this.updateAuthUI();
    });

    window.addEventListener('firebaseAuthReady', () => {
      console.log('🔥 Módulo de autenticación Firebase listo');
      this.firebaseAuth = window.firebaseAuth;
    });
  }

  showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
      this.switchAuthTab('login');
    }
  }

  showRegisterModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
      this.switchAuthTab('register');
    }
  }

  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }

  switchAuthTab(tab) {
    // Actualizar tabs
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    // Activar tab seleccionado
    const activeTab = Array.from(document.querySelectorAll('.auth-tab'))
      .find(t => t.textContent.toLowerCase().includes(tab === 'login' ? 'iniciar' : 'registrarse'));
    
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Activar formulario correspondiente
    const activeForm = document.getElementById(`${tab}-form`);
    if (activeForm) {
      activeForm.classList.add('active');
    }
  }

  async handleLogin(form) {
    // El módulo de Firebase maneja el login directamente
    // Los eventos están conectados en firebase-auth.js
    console.log('🔐 Procesando login con Firebase...');

    // El formulario se maneja automáticamente por el módulo de Firebase
    // No necesitamos lógica adicional aquí
  }

  async handleRegister(form) {
    // El módulo de Firebase maneja el registro directamente
    // Los eventos están conectados en firebase-auth.js
    console.log('🔐 Procesando registro con Firebase...');

    // El formulario se maneja automáticamente por el módulo de Firebase
    // No necesitamos lógica adicional aquí
  }

  logout() {
    // Usar módulo de Firebase para cerrar sesión
    if (this.firebaseAuth) {
      this.firebaseAuth.signOut();
    } else {
      // Fallback si Firebase no está listo
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  updateAuthUI() {
    const authButtons = document.querySelectorAll('[data-auth]');
    const userElements = document.querySelectorAll('[data-user]');

    // Obtener usuario actual desde Firebase
    const currentUser = this.firebaseAuth ? this.firebaseAuth.getCurrentUser() : null;

    authButtons.forEach(button => {
      if (currentUser) {
        if (button.dataset.auth === 'login' || button.dataset.auth === 'register') {
          button.style.display = 'none';
        } else if (button.dataset.auth === 'logout') {
          button.style.display = 'block';
        }
      } else {
        if (button.dataset.auth === 'login' || button.dataset.auth === 'register') {
          button.style.display = 'block';
        } else if (button.dataset.auth === 'logout') {
          button.style.display = 'none';
        }
      }
    });

    userElements.forEach(element => {
      if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email;
        element.textContent = displayName;
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

}

// Inicializar aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.sensusApp = new SensusApp();
  });
} else {
  window.sensusApp = new SensusApp();
}

/**
 * Sensus App - Aplicación Principal
 * Versión simplificada y funcional
 */

class SensusApp {
  constructor() {
    this.isInitialized = false;
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando Sensus...');
    
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
    // Verificar autenticación guardada
    this.checkStoredAuth();
    
    // Actualizar UI de autenticación
    this.updateAuthUI();
  }

  checkStoredAuth() {
    const token = localStorage.getItem('sensus-token');
    const user = localStorage.getItem('sensus-user');
    
    if (token && user) {
      try {
        this.user = JSON.parse(user);
        this.token = token;
        console.log('👤 Usuario autenticado desde almacenamiento');
      } catch (error) {
        console.warn('⚠️ Error cargando autenticación:', error);
        this.clearAuth();
      }
    }
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
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      this.showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      this.showLoading(form, true);
      
      const response = await fetch('/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.setAuth(data.data.token, data.data.user);
        this.hideAuthModal();
        this.showMessage('¡Bienvenido de vuelta!', 'success');
      } else {
        this.showMessage(data.message || 'Error en el login', 'error');
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
      this.showLoading(form, false);
    }
  }

  async handleRegister(form) {
    const formData = new FormData(form);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      this.showMessage('Por favor completa todos los campos', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 8) {
      this.showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    try {
      this.showLoading(form, true);
      
      const response = await fetch('/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setAuth(data.data.token, data.data.user);
        this.hideAuthModal();
        this.showMessage('¡Cuenta creada exitosamente!', 'success');
      } else {
        this.showMessage(data.message || 'Error en el registro', 'error');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.showMessage('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
      this.showLoading(form, false);
    }
  }

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    
    // Guardar en localStorage
    localStorage.setItem('sensus-token', token);
    localStorage.setItem('sensus-user', JSON.stringify(user));
    
    // Actualizar UI
    this.updateAuthUI();
  }

  logout() {
    this.clearAuth();
    this.updateAuthUI();
    this.showMessage('Sesión cerrada exitosamente', 'success');
  }

  clearAuth() {
    this.token = null;
    this.user = null;
    
    // Limpiar localStorage
    localStorage.removeItem('sensus-token');
    localStorage.removeItem('sensus-user');
  }

  updateAuthUI() {
    const authButtons = document.querySelectorAll('[data-auth]');
    const userElements = document.querySelectorAll('[data-user]');
    
    authButtons.forEach(button => {
      if (this.user) {
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
      if (this.user) {
        element.textContent = this.user.firstName || this.user.email;
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

  showLoading(form, show) {
    const submitBtn = form.querySelector('.auth-submit');
    if (submitBtn) {
      if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <div class="auth-form-loading">
            <div class="spinner"></div>
            Procesando...
          </div>
        `;
      } else {
        submitBtn.disabled = false;
        if (form.id === 'login-form') {
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        } else if (form.id === 'register-form') {
          submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
        }
      }
    }
  }

  showMessage(message, type) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
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

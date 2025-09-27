/**
 * Sensus Authentication Module
 * Manejo de autenticación y autorización
 */

class AuthModule {
  constructor() {
    this.isAuthenticated = false;
    this.user = null;
    this.token = null;
    this.apiBaseUrl = '/api/v1';
    
    this.init();
  }

  /**
   * Inicializar módulo de autenticación
   */
  init() {
    console.log('🔐 Inicializando módulo de autenticación...');
    
    // Verificar si hay token guardado
    this.checkStoredAuth();
    
    // Configurar event listeners
    this.setupEventListeners();
    
    console.log('✅ Módulo de autenticación inicializado');
  }

  /**
   * Verificar autenticación guardada
   */
  checkStoredAuth() {
    const token = localStorage.getItem('sensus-token');
    const user = localStorage.getItem('sensus-user');
    
    if (token && user) {
      try {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
        
        // Verificar si el token sigue siendo válido
        this.validateToken();
        
        console.log('👤 Usuario autenticado desde almacenamiento');
      } catch (error) {
        console.warn('⚠️ Error cargando autenticación guardada:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Event listeners para botones de autenticación
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-auth="login"]')) {
        this.showLoginModal();
      } else if (event.target.matches('[data-auth="register"]')) {
        this.showRegisterModal();
      } else if (event.target.matches('[data-auth="logout"]')) {
        this.logout();
      }
    });

    // Event listeners para formularios
    document.addEventListener('submit', (event) => {
      if (event.target.matches('#login-form')) {
        event.preventDefault();
        this.handleLogin(event.target);
      } else if (event.target.matches('#register-form')) {
        event.preventDefault();
        this.handleRegister(event.target);
      }
    });
  }

  /**
   * Mostrar modal de login
   */
  showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
      this.switchAuthTab('login');
    }
  }

  /**
   * Mostrar modal de registro
   */
  showRegisterModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.add('active');
      this.switchAuthTab('register');
    }
  }

  /**
   * Cambiar tab de autenticación
   */
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

  /**
   * Manejar login
   */
  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!email || !password) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    try {
      this.showLoading(form, true);
      
      const response = await fetch(`${this.apiBaseUrl}/users/login`, {
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
        this.showSuccess('¡Bienvenido de vuelta!');
      } else {
        this.showError(data.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.showError('Error de conexión. Intenta nuevamente.');
    } finally {
      this.showLoading(form, false);
    }
  }

  /**
   * Manejar registro
   */
  async handleRegister(form) {
    const formData = new FormData(form);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      this.showError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 8) {
      this.showError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      this.showLoading(form, true);
      
      const response = await fetch(`${this.apiBaseUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          birthDate: formData.get('birthDate')
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setAuth(data.data.token, data.data.user);
        this.hideAuthModal();
        this.showSuccess('¡Cuenta creada exitosamente!');
      } else {
        this.showError(data.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      this.showError('Error de conexión. Intenta nuevamente.');
    } finally {
      this.showLoading(form, false);
    }
  }

  /**
   * Establecer autenticación
   */
  setAuth(token, user) {
    this.token = token;
    this.user = user;
    this.isAuthenticated = true;
    
    // Guardar en localStorage
    localStorage.setItem('sensus-token', token);
    localStorage.setItem('sensus-user', JSON.stringify(user));
    
    // Actualizar UI
    this.updateAuthUI();
    
    // Emitir evento
    window.dispatchEvent(new CustomEvent('auth:login', { detail: { user, token } }));
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.clearAuth();
    this.updateAuthUI();
    
    // Emitir evento
    window.dispatchEvent(new CustomEvent('auth:logout', { detail: { user: this.user } }));
    
    this.showSuccess('Sesión cerrada exitosamente');
  }

  /**
   * Limpiar autenticación
   */
  clearAuth() {
    this.token = null;
    this.user = null;
    this.isAuthenticated = false;
    
    // Limpiar localStorage
    localStorage.removeItem('sensus-token');
    localStorage.removeItem('sensus-user');
  }

  /**
   * Validar token
   */
  async validateToken() {
    if (!this.token) return false;

    try {
      const response = await fetch(`${this.apiBaseUrl}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.data;
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Error validando token:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Actualizar UI de autenticación
   */
  updateAuthUI() {
    const authButtons = document.querySelectorAll('[data-auth]');
    const userElements = document.querySelectorAll('[data-user]');
    
    authButtons.forEach(button => {
      if (this.isAuthenticated) {
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
      if (this.isAuthenticated && this.user) {
        element.textContent = this.user.firstName || this.user.email;
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * Ocultar modal de autenticación
   */
  hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Mostrar loading
   */
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

  /**
   * Mostrar error
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Mostrar éxito
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  /**
   * Mostrar mensaje
   */
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

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.user;
  }

  /**
   * Verificar si está autenticado
   */
  isLoggedIn() {
    return this.isAuthenticated;
  }

  /**
   * Obtener token
   */
  getToken() {
    return this.token;
  }
}

export default AuthModule;

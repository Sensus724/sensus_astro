/**
 * Módulo del Modal de Autenticación - Sensus
 * Maneja todas las interacciones del modal de login/registro
 */

class AuthModal {
  constructor() {
    this.modal = null;
    this.currentTab = 'login';
    this.isLoading = false;
    this.init();
  }

  init() {
    this.modal = document.getElementById('auth-modal');
    if (this.modal) {
      this.setupEventListeners();
      this.setupFormValidation();
    }
  }

  /**
   * Configurar event listeners
   */
  setupEventListeners() {
    // Botones para abrir modal
    const authButtons = document.querySelectorAll('[data-auth-action]');
    authButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.dataset.authAction;
        this.openModal(action);
      });
    });

    // Botón de cerrar modal
    const closeButton = this.modal.querySelector('.auth-modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeModal());
    }

    // Cerrar al hacer clic en overlay
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Cambiar entre tabs
    const tabButtons = this.modal.querySelectorAll('.auth-tab-button');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = button.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Envío de formularios
    const loginForm = this.modal.querySelector('#login-form');
    const registerForm = this.modal.querySelector('#register-form');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  /**
   * Configurar validación de formularios
   */
  setupFormValidation() {
    const forms = this.modal.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input[required]');
      
      inputs.forEach(input => {
        input.addEventListener('blur', () => this.validateField(input));
        input.addEventListener('input', () => this.clearFieldError(input));
      });
    });
  }

  /**
   * Abrir modal
   */
  openModal(action = 'login') {
    if (this.modal) {
      this.modal.classList.add('active');
      document.body.classList.add('modal-open');
      
      // Cambiar a la tab correcta
      this.switchTab(action);
      
      // Enfocar primer campo
      setTimeout(() => {
        const firstInput = this.modal.querySelector('input');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  }

  /**
   * Cerrar modal
   */
  closeModal() {
    if (this.modal) {
      this.modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      
      // Limpiar formularios
      this.clearForms();
    }
  }

  /**
   * Cambiar entre tabs
   */
  switchTab(tab) {
    if (this.currentTab === tab) return;

    // Actualizar botones de tab
    const tabButtons = this.modal.querySelectorAll('.auth-tab-button');
    tabButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tab);
    });

    // Actualizar contenido de tabs
    const tabContents = this.modal.querySelectorAll('.auth-tab-content');
    tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`);
    });

    this.currentTab = tab;
    
    // Limpiar errores
    this.clearMessages();
  }

  /**
   * Manejar login
   */
  async handleLogin(e) {
    e.preventDefault();
    
    if (this.isLoading) return;

    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    // Validar campos
    if (!this.validateLoginForm(email, password)) {
      return;
    }

    this.setLoading(true);
    this.clearMessages();

    try {
      // Aquí iría la llamada al backend
      const response = await this.performLogin(email, password);
      
      if (response.success) {
        this.showMessage('¡Bienvenido! Iniciando sesión...', 'success');
        setTimeout(() => {
          this.closeModal();
          // Recargar página o actualizar UI
          window.location.reload();
        }, 1500);
      } else {
        this.showMessage(response.message || 'Error al iniciar sesión', 'error');
      }
    } catch (error) {
      this.showMessage('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Manejar registro
   */
  async handleRegister(e) {
    e.preventDefault();
    
    if (this.isLoading) return;

    const form = e.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validar campos
    if (!this.validateRegisterForm(email, password, confirmPassword)) {
      return;
    }

    this.setLoading(true);
    this.clearMessages();

    try {
      // Aquí iría la llamada al backend
      const response = await this.performRegister(email, password);
      
      if (response.success) {
        this.showMessage('¡Cuenta creada exitosamente! Iniciando sesión...', 'success');
        setTimeout(() => {
          this.closeModal();
          // Recargar página o actualizar UI
          window.location.reload();
        }, 1500);
      } else {
        this.showMessage(response.message || 'Error al crear cuenta', 'error');
      }
    } catch (error) {
      this.showMessage('Error de conexión. Intenta de nuevo.', 'error');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Validar formulario de login
   */
  validateLoginForm(email, password) {
    let isValid = true;

    if (!email || !this.isValidEmail(email)) {
      this.showFieldError('login-email', 'Email inválido');
      isValid = false;
    }

    if (!password || password.length < 6) {
      this.showFieldError('login-password', 'Contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validar formulario de registro
   */
  validateRegisterForm(email, password, confirmPassword) {
    let isValid = true;

    if (!email || !this.isValidEmail(email)) {
      this.showFieldError('register-email', 'Email inválido');
      isValid = false;
    }

    if (!password || password.length < 8) {
      this.showFieldError('register-password', 'Contraseña debe tener al menos 8 caracteres');
      isValid = false;
    }

    if (password !== confirmPassword) {
      this.showFieldError('register-confirm-password', 'Las contraseñas no coinciden');
      isValid = false;
    }

    return isValid;
  }

  /**
   * Validar email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar campo individual
   */
  validateField(input) {
    const value = input.value.trim();
    const fieldName = input.name;
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'email':
        if (!value) {
          errorMessage = 'Email es requerido';
          isValid = false;
        } else if (!this.isValidEmail(value)) {
          errorMessage = 'Email inválido';
          isValid = false;
        }
        break;
      case 'password':
        if (!value) {
          errorMessage = 'Contraseña es requerida';
          isValid = false;
        } else if (value.length < 6) {
          errorMessage = 'Mínimo 6 caracteres';
          isValid = false;
        }
        break;
      case 'confirmPassword':
        const password = input.form.querySelector('input[name="password"]').value;
        if (value !== password) {
          errorMessage = 'Las contraseñas no coinciden';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(input.id, errorMessage);
    } else {
      this.clearFieldError(input);
    }

    return isValid;
  }

  /**
   * Mostrar error en campo
   */
  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('error');
      
      // Remover error anterior
      const existingError = field.parentNode.querySelector('.field-error');
      if (existingError) {
        existingError.remove();
      }
      
      // Añadir nuevo error
      const errorElement = document.createElement('span');
      errorElement.className = 'field-error';
      errorElement.textContent = message;
      field.parentNode.appendChild(errorElement);
    }
  }

  /**
   * Limpiar error de campo
   */
  clearFieldError(input) {
    input.classList.remove('error');
    const errorElement = input.parentNode.querySelector('.field-error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Mostrar mensaje general
   */
  showMessage(message, type = 'info') {
    const messageContainer = this.modal.querySelector('.auth-message');
    if (messageContainer) {
      messageContainer.className = `auth-message auth-message-${type}`;
      messageContainer.textContent = message;
      messageContainer.style.display = 'block';
    }
  }

  /**
   * Limpiar mensajes
   */
  clearMessages() {
    const messageContainer = this.modal.querySelector('.auth-message');
    if (messageContainer) {
      messageContainer.style.display = 'none';
      messageContainer.textContent = '';
    }
  }

  /**
   * Establecer estado de loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    const submitButtons = this.modal.querySelectorAll('button[type="submit"]');
    
    submitButtons.forEach(button => {
      if (loading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Iniciar Sesión';
      }
    });
  }

  /**
   * Limpiar formularios
   */
  clearForms() {
    const forms = this.modal.querySelectorAll('form');
    forms.forEach(form => {
      form.reset();
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        this.clearFieldError(input);
      });
    });
    this.clearMessages();
  }

  /**
   * Simular login (reemplazar con llamada real al backend)
   */
  async performLogin(email, password) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respuesta exitosa
    return { success: true, message: 'Login exitoso' };
  }

  /**
   * Simular registro (reemplazar con llamada real al backend)
   */
  async performRegister(email, password) {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respuesta exitosa
    return { success: true, message: 'Registro exitoso' };
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.authModal = new AuthModal();
});

// Exportar funciones globales para compatibilidad
window.openAuthModal = (action = 'login') => {
  if (window.authModal) {
    window.authModal.openModal(action);
  }
};

window.closeAuthModal = () => {
  if (window.authModal) {
    window.authModal.closeModal();
  }
};

window.switchAuthTab = (tab) => {
  if (window.authModal) {
    window.authModal.switchTab(tab);
  }
};

window.showAuthMessage = (message, type) => {
  if (window.authModal) {
    window.authModal.showMessage(message, type);
  }
};

window.showAuthLoading = (loading) => {
  if (window.authModal) {
    window.authModal.setLoading(loading);
  }
};

export default AuthModal;

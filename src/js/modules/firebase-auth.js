/**
 * Sensus Firebase Authentication Module
 * Módulo completo de autenticación con Firebase que reemplaza la lógica de API propia
 */

class FirebaseAuthModule {
  constructor() {
    this.auth = null;
    this.firestore = null;
    this.currentUser = null;
    this.authStateListener = null;
    this.isInitialized = false;

    this.init();
  }

  /**
   * Inicializar módulo de autenticación con Firebase
   */
  async init() {
    console.log('🔐 Inicializando módulo de autenticación con Firebase...');

    try {
      // Esperar a que Firebase esté inicializado
      await this.waitForFirebase();

      // Obtener servicios de Firebase
      this.auth = window.firebase.auth;
      this.firestore = window.firebase.firestore;

      if (!this.auth) {
        throw new Error('Firebase Auth no está disponible');
      }

      // Configurar listener de estado de autenticación
      this.setupAuthStateListener();

      // Configurar event listeners para el modal
      this.setupModalEventListeners();

      this.isInitialized = true;
      console.log('✅ Módulo de autenticación con Firebase inicializado');

      // Disparar evento de inicialización completa
      window.dispatchEvent(new CustomEvent('firebaseAuthReady'));

    } catch (error) {
      console.error('❌ Error inicializando módulo de autenticación:', error);
      this.showAuthMessage('Error inicializando autenticación: ' + error.message, 'error');
    }
  }

  /**
   * Esperar a que Firebase esté inicializado
   */
  async waitForFirebase() {
    return new Promise((resolve, reject) => {
      if (window.firebase && window.firebase.auth) {
        resolve();
        return;
      }

      // Escuchar evento de Firebase listo
      const handleFirebaseReady = () => {
        window.removeEventListener('firebaseReady', handleFirebaseReady);
        resolve();
      };

      const handleFirebaseError = (error) => {
        window.removeEventListener('firebaseError', handleFirebaseError);
        reject(error.detail);
      };

      window.addEventListener('firebaseReady', handleFirebaseReady);
      window.addEventListener('firebaseError', handleFirebaseError);

      // Timeout después de 10 segundos
      setTimeout(() => {
        window.removeEventListener('firebaseReady', handleFirebaseReady);
        window.removeEventListener('firebaseError', handleFirebaseError);
        reject(new Error('Timeout esperando inicialización de Firebase'));
      }, 10000);
    });
  }

  /**
   * Configurar listener de estado de autenticación
   */
  setupAuthStateListener() {
    if (!this.auth) return;

    this.authStateListener = this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('✅ Usuario autenticado:', user.email);

        // Actualizar UI
        this.updateAuthUI();

        // Crear o actualizar perfil en Firestore si es necesario
        await this.ensureUserProfile(user);

        // Emitir evento de login
        window.dispatchEvent(new CustomEvent('auth:login', {
          detail: { user: this.getCurrentUser() }
        }));

      } else {
        this.currentUser = null;
        console.log('❌ Usuario no autenticado');

        // Actualizar UI
        this.updateAuthUI();

        // Emitir evento de logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
    });
  }

  /**
   * Configurar event listeners para el modal de autenticación
   */
  setupModalEventListeners() {
    // Event listeners para formularios
    document.addEventListener('submit', (event) => {
      if (event.target.matches('#login-form')) {
        event.preventDefault();
        this.handleLogin(event.target);
      } else if (event.target.matches('#register-form')) {
        event.preventDefault();
        this.handleRegister(event.target);
      } else if (event.target.matches('#forgot-password-form')) {
        event.preventDefault();
        this.handlePasswordReset(event.target);
      }
    });

    // Event listeners para botones sociales
    document.addEventListener('click', (event) => {
      if (event.target.matches('#google-login') || event.target.matches('#google-register')) {
        this.signInWithGoogle();
      } else if (event.target.matches('#apple-login') || event.target.matches('#apple-register')) {
        this.signInWithApple();
      }
    });
  }

  /**
   * Inicio de sesión con email y contraseña
   */
  async signInWithEmail(email, password) {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      console.log('✅ Inicio de sesión exitoso:', user.email);
      this.showAuthMessage('¡Bienvenido de vuelta!', 'success');

      return user;
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error);

      let errorMessage = 'Error en el inicio de sesión';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
          break;
        default:
          errorMessage = error.message;
      }

      this.showAuthMessage(errorMessage, 'error');
      throw error;
    }
  }

  /**
   * Registro con email y contraseña
   */
  async signUpWithEmail(email, password, additionalData = {}) {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      console.log('✅ Registro exitoso:', user.email);

      // Crear perfil en Firestore
      await this.createUserProfile(user, additionalData);

      this.showAuthMessage('¡Cuenta creada exitosamente!', 'success');

      return user;
    } catch (error) {
      console.error('❌ Error en registro:', error);

      let errorMessage = 'Error en el registro';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registro con email/contraseña no está habilitado';
          break;
        default:
          errorMessage = error.message;
      }

      this.showAuthMessage(errorMessage, 'error');
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    try {
      await this.auth.signOut();
      console.log('✅ Sesión cerrada exitosamente');
      this.showAuthMessage('Sesión cerrada exitosamente', 'success');
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      this.showAuthMessage('Error cerrando sesión: ' + error.message, 'error');
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    if (!this.auth) return null;

    return this.currentUser;
  }

  /**
   * Escuchar cambios de estado de autenticación
   */
  onAuthStateChange(callback) {
    if (!this.auth) {
      console.error('Firebase Auth no está inicializado');
      return;
    }

    if (this.authStateListener) {
      // Remover listener anterior si existe
      this.authStateListener();
    }

    this.authStateListener = this.auth.onAuthStateChanged(callback);
    return this.authStateListener;
  }

  /**
   * Autenticación con Google
   */
  async signInWithGoogle() {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    try {
      const provider = new this.auth.GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await this.auth.signInWithPopup(provider);
      const user = result.user;

      console.log('✅ Autenticación con Google exitosa:', user.email);

      // Crear perfil en Firestore si es necesario
      await this.ensureUserProfile(user);

      this.showAuthMessage('¡Bienvenido! Has iniciado sesión con Google', 'success');

      // Cerrar modal
      this.closeAuthModal();

      return user;
    } catch (error) {
      console.error('❌ Error en autenticación con Google:', error);

      let errorMessage = 'Error al iniciar sesión con Google';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana de autenticación cerrada por el usuario';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Ventana de autenticación bloqueada por el navegador';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ya existe una cuenta con este email usando otro método de autenticación';
          break;
        default:
          errorMessage = error.message;
      }

      this.showAuthMessage(errorMessage, 'error');
      throw error;
    }
  }

  /**
   * Autenticación con Apple
   */
  async signInWithApple() {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    try {
      const provider = new this.auth.OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');

      const result = await this.auth.signInWithPopup(provider);
      const user = result.user;

      console.log('✅ Autenticación con Apple exitosa:', user.email);

      // Crear perfil en Firestore si es necesario
      await this.ensureUserProfile(user);

      this.showAuthMessage('¡Bienvenido! Has iniciado sesión con Apple', 'success');

      // Cerrar modal
      this.closeAuthModal();

      return user;
    } catch (error) {
      console.error('❌ Error en autenticación con Apple:', error);

      let errorMessage = 'Error al iniciar sesión con Apple';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Ventana de autenticación cerrada por el usuario';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Ventana de autenticación bloqueada por el navegador';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Ya existe una cuenta con este email usando otro método de autenticación';
          break;
        default:
          errorMessage = error.message;
      }

      this.showAuthMessage(errorMessage, 'error');
      throw error;
    }
  }

  /**
   * Recuperar contraseña
   */
  async resetPassword(email) {
    if (!this.auth) {
      throw new Error('Firebase Auth no está inicializado');
    }

    if (!email) {
      throw new Error('Email es requerido');
    }

    try {
      await this.auth.sendPasswordResetEmail(email);
      console.log('✅ Email de recuperación enviado a:', email);
      this.showAuthMessage('Email de recuperación enviado. Revisa tu bandeja de entrada', 'success');
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);

      let errorMessage = 'Error enviando email de recuperación';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = error.message;
      }

      this.showAuthMessage(errorMessage, 'error');
      throw error;
    }
  }

  /**
   * Crear perfil de usuario en Firestore
   */
  async createUserProfile(user, additionalData = {}) {
    if (!this.firestore || !user) return;

    try {
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName,
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        birthDate: additionalData.birthDate || null,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: user.providerData[0]?.providerId || 'password',
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'es'
        }
      };

      await this.firestore.collection('users').doc(user.uid).set(userProfile, { merge: true });
      console.log('✅ Perfil de usuario creado en Firestore');
    } catch (error) {
      console.error('❌ Error creando perfil de usuario:', error);
    }
  }

  /**
   * Asegurar que el perfil de usuario existe en Firestore
   */
  async ensureUserProfile(user) {
    if (!this.firestore || !user) return;

    try {
      const userDoc = await this.firestore.collection('users').doc(user.uid).get();

      if (!userDoc.exists) {
        await this.createUserProfile(user);
      } else {
        // Actualizar datos básicos si es necesario
        const userData = userDoc.data();
        if (!userData.email && user.email) {
          await userDoc.ref.update({
            email: user.email,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('❌ Error verificando perfil de usuario:', error);
    }
  }

  /**
   * Manejar formulario de login
   */
  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      this.showAuthMessage('Por favor completa todos los campos', 'error');
      return;
    }

    try {
      this.showAuthLoading(form, true);
      await this.signInWithEmail(email, password);

      // Cerrar modal después de login exitoso
      this.closeAuthModal();
    } catch (error) {
      // Error ya manejado en signInWithEmail
    } finally {
      this.showAuthLoading(form, false);
    }
  }

  /**
   * Manejar formulario de registro
   */
  async handleRegister(form) {
    const formData = new FormData(form);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const birthDate = formData.get('birthDate');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      this.showAuthMessage('Por favor completa todos los campos', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showAuthMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 8) {
      this.showAuthMessage('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }

    try {
      this.showAuthLoading(form, true);

      const additionalData = {
        firstName,
        lastName,
        birthDate,
        displayName: `${firstName} ${lastName}`
      };

      await this.signUpWithEmail(email, password, additionalData);

      // Cerrar modal después de registro exitoso
      this.closeAuthModal();
    } catch (error) {
      // Error ya manejado en signUpWithEmail
    } finally {
      this.showAuthLoading(form, false);
    }
  }

  /**
   * Manejar formulario de recuperación de contraseña
   */
  async handlePasswordReset(form) {
    const formData = new FormData(form);
    const email = formData.get('email');

    if (!email) {
      this.showAuthMessage('Por favor ingresa tu email', 'error');
      return;
    }

    try {
      this.showAuthLoading(form, true);
      await this.resetPassword(email);
    } catch (error) {
      // Error ya manejado en resetPassword
    } finally {
      this.showAuthLoading(form, false);
    }
  }

  /**
   * Mostrar mensaje de autenticación
   */
  showAuthMessage(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
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
   * Mostrar estado de carga en formulario
   */
  showAuthLoading(form, show) {
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
        } else if (form.id === 'forgot-password-form') {
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar enlace de recuperación';
        }
      }
    }
  }

  /**
   * Cerrar modal de autenticación
   */
  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal && window.authModal) {
      window.authModal.close();
    }
  }

  /**
   * Actualizar UI de autenticación
   */
  updateAuthUI() {
    const authButtons = document.querySelectorAll('[data-auth]');
    const userElements = document.querySelectorAll('[data-user]');

    authButtons.forEach(button => {
      if (this.currentUser) {
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
      if (this.currentUser) {
        const displayName = this.currentUser.displayName || this.currentUser.email;
        element.textContent = displayName;
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
  }

  /**
   * Verificar si está autenticado
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }

  /**
   * Obtener token de autenticación
   */
  async getToken() {
    if (!this.currentUser) return null;

    try {
      return await this.currentUser.getIdToken();
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  }

  /**
   * Destruir módulo
   */
  destroy() {
    if (this.authStateListener) {
      this.authStateListener();
    }
    this.isInitialized = false;
  }
}

// Crear instancia global
const firebaseAuth = new FirebaseAuthModule();

// Exportar funciones principales para uso global
window.firebaseAuth = firebaseAuth;
window.signInWithEmail = (email, password) => firebaseAuth.signInWithEmail(email, password);
window.signUpWithEmail = (email, password, additionalData) => firebaseAuth.signUpWithEmail(email, password, additionalData);
window.signOut = () => firebaseAuth.signOut();
window.getCurrentUser = () => firebaseAuth.getCurrentUser();
window.onAuthStateChange = (callback) => firebaseAuth.onAuthStateChange(callback);
window.signInWithGoogle = () => firebaseAuth.signInWithGoogle();
window.signInWithApple = () => firebaseAuth.signInWithApple();
window.resetPassword = (email) => firebaseAuth.resetPassword(email);

// Exportar clase por defecto
export default FirebaseAuthModule;
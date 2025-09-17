/*
 * Sensus - Sistema de Autenticación Mejorado
 * Módulo completo para manejo de autenticación con Firebase Auth
 * Incluye: registro, login, recuperación de contraseña, gestión de perfil
 */

class AuthSystemEnhanced {
    constructor() {
        this.auth = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Esperar a que Firebase esté disponible
            if (typeof firebase === 'undefined') {
                console.error('Firebase no está cargado');
                return false;
            }

            this.auth = firebase.auth();
            
            // Configurar listener de autenticación
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.handleAuthStateChange(user);
            });

            console.log('✅ Auth System Enhanced inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Auth System Enhanced:', error);
            return false;
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            console.log('Usuario autenticado:', user.uid);
            this.updateUIForAuthenticatedUser(user);
            
            // Inicializar servicios de Firebase si están disponibles
            if (window.firebaseServices) {
                window.firebaseServices.initializeUserData(user);
            }
        } else {
            console.log('Usuario no autenticado');
            this.updateUIForUnauthenticatedUser();
        }
    }

    // === REGISTRO ===
    async register(email, password, displayName = null) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Actualizar perfil si se proporciona nombre
            if (displayName) {
                await user.updateProfile({
                    displayName: displayName
                });
            }

            // Enviar email de verificación
            await user.sendEmailVerification();

            console.log('✅ Usuario registrado correctamente');
            this.showNotification('¡Registro exitoso! Verifica tu email para activar tu cuenta.', 'success');
            
            return user;
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === LOGIN ===
    async login(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;

            console.log('✅ Usuario autenticado correctamente');
            this.showNotification(`¡Bienvenido de vuelta, ${user.displayName || 'Usuario'}!`, 'success');
            
            return user;
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === LOGIN CON GOOGLE ===
    async loginWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;

            console.log('✅ Usuario autenticado con Google');
            this.showNotification(`¡Bienvenido, ${user.displayName}!`, 'success');
            
            return user;
        } catch (error) {
            console.error('❌ Error en login con Google:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === LOGOUT ===
    async logout() {
        try {
            await this.auth.signOut();
            console.log('✅ Sesión cerrada correctamente');
            this.showNotification('Sesión cerrada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            this.showNotification('Error al cerrar sesión', 'error');
            throw error;
        }
    }

    // === RECUPERACIÓN DE CONTRASEÑA ===
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            console.log('✅ Email de recuperación enviado');
            this.showNotification('Se ha enviado un email para recuperar tu contraseña', 'success');
        } catch (error) {
            console.error('❌ Error enviando email de recuperación:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === ACTUALIZAR PERFIL ===
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            await this.currentUser.updateProfile(updates);
            console.log('✅ Perfil actualizado');
            this.showNotification('Perfil actualizado correctamente', 'success');
        } catch (error) {
            console.error('❌ Error actualizando perfil:', error);
            this.showNotification('Error al actualizar perfil', 'error');
            throw error;
        }
    }

    // === CAMBIAR CONTRASEÑA ===
    async changePassword(newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            await this.currentUser.updatePassword(newPassword);
            console.log('✅ Contraseña actualizada');
            this.showNotification('Contraseña actualizada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error cambiando contraseña:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === ELIMINAR CUENTA ===
    async deleteAccount() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            // Confirmar eliminación
            const confirmed = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.');
            if (!confirmed) {
                return;
            }

            await this.currentUser.delete();
            console.log('✅ Cuenta eliminada');
            this.showNotification('Cuenta eliminada correctamente', 'success');
        } catch (error) {
            console.error('❌ Error eliminando cuenta:', error);
            this.handleAuthError(error);
            throw error;
        }
    }

    // === MANEJO DE ERRORES ===
    handleAuthError(error) {
        let message = 'Error de autenticación';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                message = 'Email inválido';
                break;
            case 'auth/weak-password':
                message = 'La contraseña debe tener al menos 6 caracteres';
                break;
            case 'auth/user-not-found':
                message = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta';
                break;
            case 'auth/too-many-requests':
                message = 'Demasiados intentos. Intenta más tarde';
                break;
            case 'auth/network-request-failed':
                message = 'Error de conexión. Verifica tu internet';
                break;
            default:
                message = error.message || 'Error de autenticación';
        }
        
        this.showNotification(message, 'error');
    }

    // === ACTUALIZAR UI ===
    updateUIForAuthenticatedUser(user) {
        // Actualizar botones de autenticación
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.textContent = 'Mi cuenta';
            loginBtn.onclick = () => {
                this.showUserMenu();
            };
        }
        
        if (registerBtn) {
            registerBtn.textContent = 'Cerrar sesión';
            registerBtn.onclick = () => {
                this.logout();
            };
        }

        // Mostrar información del usuario
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = user.displayName || 'Usuario';
        });

        const userEmailElements = document.querySelectorAll('.user-email');
        userEmailElements.forEach(element => {
            element.textContent = user.email || '';
        });

        // Mostrar sección de progreso del usuario
        const userProgressSection = document.getElementById('user-progress-section');
        if (userProgressSection) {
            userProgressSection.style.display = 'block';
        }
    }

    updateUIForUnauthenticatedUser() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.textContent = 'Iniciar sesión';
            loginBtn.onclick = () => {
                this.openAuthModal('login');
            };
        }
        
        if (registerBtn) {
            registerBtn.textContent = '¡REGÍSTRATE GRATIS!';
            registerBtn.onclick = () => {
                this.openAuthModal('register');
            };
        }

        // Ocultar sección de progreso del usuario
        const userProgressSection = document.getElementById('user-progress-section');
        if (userProgressSection) {
            userProgressSection.style.display = 'none';
        }
    }

    // === MODALES DE AUTENTICACIÓN ===
    openAuthModal(type) {
        // Crear modal si no existe
        let modal = document.getElementById('auth-modal');
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }

        // Mostrar modal
        modal.style.display = 'flex';
        
        // Configurar según el tipo
        if (type === 'login') {
            this.showLoginForm();
        } else if (type === 'register') {
            this.showRegisterForm();
        } else if (type === 'reset') {
            this.showResetForm();
        }
    }

    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Iniciar Sesión</h2>
                    <button class="close-modal" onclick="this.parentElement.parentElement.parentElement.style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="auth-forms">
                        <!-- Los formularios se cargarán aquí -->
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .auth-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .modal-content {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }
            .auth-form {
                display: none;
            }
            .auth-form.active {
                display: block;
            }
            .form-group {
                margin-bottom: 1rem;
            }
            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }
            .form-group input {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.5rem;
                font-size: 1rem;
            }
            .form-group input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .btn-auth {
                width: 100%;
                padding: 0.75rem;
                border: none;
                border-radius: 0.5rem;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                margin-bottom: 0.5rem;
            }
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            .btn-secondary {
                background: #6b7280;
                color: white;
            }
            .btn-outline {
                background: transparent;
                color: #3b82f6;
                border: 1px solid #3b82f6;
            }
            .auth-links {
                text-align: center;
                margin-top: 1rem;
            }
            .auth-links a {
                color: #3b82f6;
                text-decoration: none;
                cursor: pointer;
            }
            .auth-links a:hover {
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);

        return modal;
    }

    showLoginForm() {
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('modal-title');
        const forms = document.getElementById('auth-forms');
        
        title.textContent = 'Iniciar Sesión';
        forms.innerHTML = `
            <form id="login-form" class="auth-form active">
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Contraseña</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn-auth btn-primary">Iniciar Sesión</button>
                <button type="button" class="btn-auth btn-secondary" onclick="authSystemEnhanced.loginWithGoogle()">
                    <i class="fab fa-google"></i> Continuar con Google
                </button>
                <div class="auth-links">
                    <a onclick="authSystemEnhanced.openAuthModal('reset')">¿Olvidaste tu contraseña?</a><br>
                    <a onclick="authSystemEnhanced.openAuthModal('register')">¿No tienes cuenta? Regístrate</a>
                </div>
            </form>
        `;

        // Configurar evento del formulario
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                await this.login(email, password);
                modal.style.display = 'none';
            } catch (error) {
                // Error ya manejado en handleAuthError
            }
        });
    }

    showRegisterForm() {
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('modal-title');
        const forms = document.getElementById('auth-forms');
        
        title.textContent = 'Crear Cuenta';
        forms.innerHTML = `
            <form id="register-form" class="auth-form active">
                <div class="form-group">
                    <label for="register-name">Nombre</label>
                    <input type="text" id="register-name" required>
                </div>
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" required>
                </div>
                <div class="form-group">
                    <label for="register-password">Contraseña</label>
                    <input type="password" id="register-password" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="register-confirm">Confirmar Contraseña</label>
                    <input type="password" id="register-confirm" required>
                </div>
                <button type="submit" class="btn-auth btn-primary">Crear Cuenta</button>
                <button type="button" class="btn-auth btn-secondary" onclick="authSystemEnhanced.loginWithGoogle()">
                    <i class="fab fa-google"></i> Continuar con Google
                </button>
                <div class="auth-links">
                    <a onclick="authSystemEnhanced.openAuthModal('login')">¿Ya tienes cuenta? Inicia sesión</a>
                </div>
            </form>
        `;

        // Configurar evento del formulario
        document.getElementById('register-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            
            if (password !== confirmPassword) {
                this.showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            try {
                await this.register(email, password, name);
                modal.style.display = 'none';
            } catch (error) {
                // Error ya manejado en handleAuthError
            }
        });
    }

    showResetForm() {
        const modal = document.getElementById('auth-modal');
        const title = document.getElementById('modal-title');
        const forms = document.getElementById('auth-forms');
        
        title.textContent = 'Recuperar Contraseña';
        forms.innerHTML = `
            <form id="reset-form" class="auth-form active">
                <div class="form-group">
                    <label for="reset-email">Email</label>
                    <input type="email" id="reset-email" required>
                </div>
                <button type="submit" class="btn-auth btn-primary">Enviar Email de Recuperación</button>
                <div class="auth-links">
                    <a onclick="authSystemEnhanced.openAuthModal('login')">Volver al login</a>
                </div>
            </form>
        `;

        // Configurar evento del formulario
        document.getElementById('reset-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            
            try {
                await this.resetPassword(email);
                modal.style.display = 'none';
            } catch (error) {
                // Error ya manejado en handleAuthError
            }
        });
    }

    showUserMenu() {
        // Implementar menú de usuario
        console.log('Mostrar menú de usuario');
    }

    // === NOTIFICACIONES ===
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Estilos de la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        `;
        
        // Colores según el tipo
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ff9800';
                break;
            case 'info':
            default:
                notification.style.backgroundColor = '#2196F3';
        }
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'exclamation-circle';
            case 'warning':
                return 'exclamation-triangle';
            case 'info':
            default:
                return 'info-circle';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase esté disponible
    const initAuth = () => {
        if (typeof firebase !== 'undefined') {
            window.authSystemEnhanced = new AuthSystemEnhanced();
        } else {
            setTimeout(initAuth, 100);
        }
    };
    
    initAuth();
});

// Exportar para uso global
window.AuthSystemEnhanced = AuthSystemEnhanced;

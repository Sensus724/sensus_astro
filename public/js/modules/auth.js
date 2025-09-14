// Sensus - Módulo de autenticación avanzado con Firebase

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Firebase Auth
    initFirebaseAuth();
});

// Inicializar Firebase Auth
function initFirebaseAuth() {
    // Verificar si FirebaseServices está disponible
    if (typeof FirebaseServices === 'undefined') {
        console.error('FirebaseServices no está disponible');
        setTimeout(initFirebaseAuth, 1000);
        return;
    }
    
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) {
        console.error('Servicios de Firebase no disponibles');
        setTimeout(initFirebaseAuth, 1000);
        return;
    }
    
    // Referencias a elementos del DOM
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authModal = document.getElementById('auth-modal');
    
    // Verificar si el usuario ya está autenticado
    firebaseAuth.onAuthStateChanged(function(user) {
        updateUIForAuthState(user);
    });
    
    // Evento de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;
            
            // Validar campos
            if (!email || !password) {
                showAuthError('Por favor, completa todos los campos.');
                return;
            }
            
            // Validar formato de email
            if (!isValidEmail(email)) {
                showAuthError('Por favor, ingresa un correo electrónico válido.');
                return;
            }
            
            // Mostrar loading
            showAuthLoading(true);
            
            // Iniciar sesión con Firebase
            firebaseAuth.signInWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    // Actualizar último login
                    updateLastLogin(userCredential.user.uid);
                    
                    // Configurar persistencia de sesión
                    if (rememberMe) {
                        firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    } else {
                        firebaseAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
                    }
                    
                    // Verificar si el email está verificado
                    if (!userCredential.user.emailVerified) {
                        showAuthWarning('Por favor, verifica tu correo electrónico para acceder a todas las funciones.');
                    }
                    
                    // Inicio de sesión exitoso
                    closeAuthModal();
                    FirebaseServices.showNotification('¡Inicio de sesión exitoso!', 'success');
                    
                    // Trackear evento de analytics
                    trackAuthEvent('login_success', 'email');
                    
                    // Redirigir a la app
                    setTimeout(() => {
                        window.location.href = 'app.html';
                    }, 1000);
                })
                .catch(function(error) {
                    // Error en el inicio de sesión
                    handleAuthError(error);
                })
                .finally(() => {
                    showAuthLoading(false);
                });
        });
    }
    
    // Evento de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const firstName = document.getElementById('register-first-name').value;
            const lastName = document.getElementById('register-last-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const birthDate = document.getElementById('register-birth-date').value;
            const acceptTerms = document.getElementById('accept-terms').checked;
            const newsletter = document.getElementById('newsletter').checked;
            
            // Validar campos
            if (!firstName || !lastName || !email || !password || !confirmPassword || !birthDate) {
                showAuthError('Por favor, completa todos los campos obligatorios.');
                return;
            }
            
            // Validar términos y condiciones
            if (!acceptTerms) {
                showAuthError('Debes aceptar los términos y condiciones para continuar.');
                return;
            }
            
            // Validar formato de email
            if (!isValidEmail(email)) {
                showAuthError('Por favor, ingresa un correo electrónico válido.');
                return;
            }
            
            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                showAuthError('Las contraseñas no coinciden.');
                return;
            }
            
            // Validar fortaleza de contraseña
            const passwordStrength = checkPasswordStrength(password);
            if (passwordStrength.score < 3) {
                showAuthError('La contraseña es demasiado débil. Debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.');
                return;
            }
            
            // Validar edad mínima
            const age = calculateAge(birthDate);
            if (age < 13) {
                showAuthError('Debes tener al menos 13 años para registrarte.');
                return;
            }
            
            // Mostrar loading
            showAuthLoading(true);
            
            // Crear cuenta con Firebase
            firebaseAuth.createUserWithEmailAndPassword(email, password)
                .then(function(userCredential) {
                    // Actualizar perfil del usuario
                    return userCredential.user.updateProfile({
                        displayName: `${firstName} ${lastName}`
                    });
                })
                .then(function() {
                    // Enviar email de verificación
                    return firebaseAuth.currentUser.sendEmailVerification();
                })
                .then(function() {
                    // Crear perfil completo en Firestore
                    return createCompleteUserProfile(firebaseAuth.currentUser.uid, {
                        firstName,
                        lastName,
                        email,
                        birthDate,
                        newsletter,
                        acceptTerms
                    });
                })
                .then(function() {
                    // Registro exitoso
                    closeAuthModal();
                    FirebaseServices.showNotification('¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.', 'success');
                    
                    // Trackear evento de analytics
                    trackAuthEvent('register_success', 'email');
                    
                    // Redirigir a la app
                    setTimeout(() => {
                        window.location.href = 'app.html';
                    }, 1000);
                })
                .catch(function(error) {
                    // Error en el registro
                    handleAuthError(error);
                })
                .finally(() => {
                    showAuthLoading(false);
                });
        });
    }
    
    // Evento de inicio de sesión con Google
    const googleButtons = document.querySelectorAll('.google-btn, .btn-google');
    googleButtons.forEach(button => {
        button.addEventListener('click', function() {
            signInWithGoogle();
        });
    });
    
    // Evento de inicio de sesión con Apple
    const appleButtons = document.querySelectorAll('.apple-btn, .btn-apple');
    appleButtons.forEach(button => {
        button.addEventListener('click', function() {
            signInWithApple();
        });
    });
    
    // Evento de recuperación de contraseña
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            showPasswordResetModal();
        });
    }
    
    // Evento de cambio de contraseña
    const changePasswordLink = document.querySelector('.change-password');
    if (changePasswordLink) {
        changePasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            showChangePasswordModal();
        });
    }
    
    // Evento de eliminación de cuenta
    const deleteAccountLink = document.querySelector('.delete-account');
    if (deleteAccountLink) {
        deleteAccountLink.addEventListener('click', function(event) {
            event.preventDefault();
            showDeleteAccountModal();
        });
    }
}

// Actualizar UI según el estado de autenticación
function updateUIForAuthState(user) {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (!loginBtn || !registerBtn) return;
    
    if (user) {
        // Usuario autenticado
        loginBtn.textContent = 'Mi cuenta';
        loginBtn.onclick = function() {
            window.location.href = 'perfil.html';
        };
        
        registerBtn.textContent = 'Cerrar sesión';
        registerBtn.onclick = function() {
            signOut();
        };
        
        // Mostrar información del usuario si está disponible
        updateUserInfo(user);
    } else {
        // Usuario no autenticado
        loginBtn.textContent = 'Iniciar sesión';
        loginBtn.onclick = function() {
            openAuthModal('login');
        };
        
        registerBtn.textContent = '¡REGÍSTRATE GRATIS!';
        registerBtn.onclick = function() {
            openAuthModal('register');
        };
    }
}

// Actualizar información del usuario en la UI
function updateUserInfo(user) {
    // Actualizar nombre del usuario si está disponible
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = user.displayName || 'Usuario';
    });
    
    // Actualizar email del usuario si está disponible
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(element => {
        element.textContent = user.email || '';
    });
    
    // Actualizar foto del usuario si está disponible
    const userPhotoElements = document.querySelectorAll('.user-photo');
    userPhotoElements.forEach(element => {
        if (user.photoURL) {
            element.src = user.photoURL;
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Cerrar modal de autenticación
function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('active');
    }
}

// Mostrar mensaje de error de autenticación
function showAuthError(message) {
    FirebaseServices.showNotification(message, 'error');
}

// Mostrar mensaje de éxito de autenticación
function showAuthSuccess(message) {
    FirebaseServices.showNotification(message, 'success');
}

// Mostrar mensaje de advertencia
function showAuthWarning(message) {
    FirebaseServices.showNotification(message, 'warning');
}

// Mostrar loading en formularios de autenticación
function showAuthLoading(show) {
    const submitButtons = document.querySelectorAll('.auth-submit');
    submitButtons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            button.disabled = false;
            // Restaurar texto original según el formulario
            const form = button.closest('form');
            if (form.id === 'login-form') {
                button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            } else if (form.id === 'register-form') {
                button.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
            }
        }
    });
}

// Manejar errores de Firebase Auth
function handleAuthError(error) {
    console.error('Error de autenticación:', error);
    
    let errorMessage = 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    
    // Mensajes personalizados para errores comunes
    switch (error.code) {
        case 'auth/user-not-found':
            errorMessage = 'No existe una cuenta con este correo electrónico.';
            break;
        case 'auth/wrong-password':
            errorMessage = 'Contraseña incorrecta.';
            break;
        case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está registrado.';
            break;
        case 'auth/invalid-email':
            errorMessage = 'El formato del correo electrónico no es válido.';
            break;
        case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil.';
            break;
        case 'auth/network-request-failed':
            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
            break;
        case 'auth/too-many-requests':
            errorMessage = 'Demasiados intentos fallidos. Inténtalo más tarde.';
            break;
        case 'auth/user-disabled':
            errorMessage = 'Esta cuenta ha sido deshabilitada.';
            break;
        case 'auth/operation-not-allowed':
            errorMessage = 'Esta operación no está permitida.';
            break;
        case 'auth/requires-recent-login':
            errorMessage = 'Esta operación requiere que inicies sesión nuevamente.';
            break;
    }
    
    showAuthError(errorMessage);
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Verificar fortaleza de contraseña
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Longitud mínima
    if (password.length >= 8) score++;
    else feedback.push('Al menos 8 caracteres');
    
    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Mayúsculas');
    
    // Contiene minúsculas
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Minúsculas');
    
    // Contiene números
    if (/\d/.test(password)) score++;
    else feedback.push('Números');
    
    // Contiene símbolos
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Símbolos especiales');
    
    return {
        score: score,
        feedback: feedback,
        strength: score < 2 ? 'Débil' : score < 4 ? 'Media' : 'Fuerte'
    };
}

// Calcular edad
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Crear perfil completo del usuario
function createCompleteUserProfile(userId, userData) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return Promise.reject('Firestore no disponible');
    
    const userProfile = {
        uid: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        birthDate: userData.birthDate,
        age: calculateAge(userData.birthDate),
        photoURL: null,
        emailVerified: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        preferences: {
            theme: 'light',
            notifications: true,
            language: 'es',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            reminderTime: '20:00',
            weeklyReport: true,
            motivationalMessages: true,
            newsletter: userData.newsletter || false
        },
        stats: {
            totalDiaryEntries: 0,
            totalTests: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageMood: 3,
            lastDiaryEntry: null,
            lastTestDate: null,
            totalTimeSpent: 0,
            favoriteActivities: [],
            goals: [],
            achievements: []
        },
        privacy: {
            shareData: false,
            anonymousMode: false,
            dataRetention: '1year'
        },
        terms: {
            accepted: userData.acceptTerms,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
            version: '1.0'
        }
    };
    
    return firebaseFirestore.collection('users').doc(userId).set(userProfile);
}

// Actualizar último login
function updateLastLogin(userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    firebaseFirestore.collection('users').doc(userId).update({
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => {
        console.error('Error al actualizar último login:', error);
    });
}

// Iniciar sesión con Google
function signInWithGoogle() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    showAuthLoading(true);
    
    firebaseAuth.signInWithPopup(provider)
        .then(function(result) {
            // Verificar si es un usuario nuevo
            if (result.additionalUserInfo.isNewUser) {
                createCompleteUserProfile(result.user.uid, {
                    firstName: result.user.displayName.split(' ')[0],
                    lastName: result.user.displayName.split(' ').slice(1).join(' '),
                    email: result.user.email,
                    birthDate: null,
                    newsletter: false,
                    acceptTerms: true
                });
            }
            
            closeAuthModal();
            FirebaseServices.showNotification('¡Inicio de sesión con Google exitoso!', 'success');
            trackAuthEvent('login_success', 'google');
        })
        .catch(function(error) {
            handleAuthError(error);
        })
        .finally(() => {
            showAuthLoading(false);
        });
}

// Iniciar sesión con Apple
function signInWithApple() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const provider = new firebase.auth.OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    
    showAuthLoading(true);
    
    firebaseAuth.signInWithPopup(provider)
        .then(function(result) {
            // Verificar si es un usuario nuevo
            if (result.additionalUserInfo.isNewUser) {
                createCompleteUserProfile(result.user.uid, {
                    firstName: result.user.displayName?.split(' ')[0] || 'Usuario',
                    lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: result.user.email,
                    birthDate: null,
                    newsletter: false,
                    acceptTerms: true
                });
            }
            
            closeAuthModal();
            FirebaseServices.showNotification('¡Inicio de sesión con Apple exitoso!', 'success');
            trackAuthEvent('login_success', 'apple');
        })
        .catch(function(error) {
            handleAuthError(error);
        })
        .finally(() => {
            showAuthLoading(false);
        });
}

// Cerrar sesión
function signOut() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    firebaseAuth.signOut()
        .then(function() {
            FirebaseServices.showNotification('Sesión cerrada correctamente', 'success');
            trackAuthEvent('logout_success');
        })
        .catch(function(error) {
            console.error('Error al cerrar sesión:', error);
            FirebaseServices.showNotification('Error al cerrar sesión', 'error');
        });
}

// Mostrar modal de recuperación de contraseña
function showPasswordResetModal() {
    const email = document.getElementById('login-email').value;
    
    if (!email) {
        showAuthError('Por favor, ingresa tu correo electrónico primero.');
        return;
    }
    
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    showAuthLoading(true);
    
    firebaseAuth.sendPasswordResetEmail(email)
        .then(function() {
            FirebaseServices.showNotification('Se ha enviado un correo para restablecer tu contraseña.', 'success');
        })
        .catch(function(error) {
            handleAuthError(error);
        })
        .finally(() => {
            showAuthLoading(false);
        });
}

// Mostrar modal de cambio de contraseña
function showChangePasswordModal() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) {
        showAuthError('Debes iniciar sesión para cambiar tu contraseña.');
        return;
    }
    
    const newPassword = prompt('Ingresa tu nueva contraseña:');
    if (!newPassword) return;
    
    const passwordStrength = checkPasswordStrength(newPassword);
    if (passwordStrength.score < 3) {
        showAuthError('La contraseña es demasiado débil. Debe contener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos.');
        return;
    }
    
    showAuthLoading(true);
    
    user.updatePassword(newPassword)
        .then(function() {
            FirebaseServices.showNotification('Contraseña actualizada correctamente', 'success');
        })
        .catch(function(error) {
            handleAuthError(error);
        })
        .finally(() => {
            showAuthLoading(false);
        });
}

// Mostrar modal de eliminación de cuenta
function showDeleteAccountModal() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) {
        showAuthError('Debes iniciar sesión para eliminar tu cuenta.');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        return;
    }
    
    const password = prompt('Ingresa tu contraseña para confirmar la eliminación:');
    if (!password) return;
    
    showAuthLoading(true);
    
    // Reautenticar usuario
    const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);
    user.reauthenticateWithCredential(credential)
        .then(function() {
            // Eliminar datos del usuario de Firestore
            const firebaseFirestore = FirebaseServices.firestore();
            if (firebaseFirestore) {
                return firebaseFirestore.collection('users').doc(user.uid).delete();
            }
        })
        .then(function() {
            // Eliminar cuenta de autenticación
            return user.delete();
        })
        .then(function() {
            FirebaseServices.showNotification('Cuenta eliminada correctamente', 'success');
            window.location.href = 'index.html';
        })
        .catch(function(error) {
            handleAuthError(error);
        })
        .finally(() => {
            showAuthLoading(false);
        });
}

// Trackear eventos de autenticación
function trackAuthEvent(eventName, method = null) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    const eventData = {
        event_name: eventName,
        timestamp: new Date().toISOString()
    };
    
    if (method) {
        eventData.auth_method = method;
    }
    
    firebaseAnalytics.logEvent(eventName, eventData);
}

// Exportar funciones para uso global
window.Auth = {
    signInWithGoogle: signInWithGoogle,
    signInWithApple: signInWithApple,
    signOut: signOut,
    showPasswordResetModal: showPasswordResetModal,
    showChangePasswordModal: showChangePasswordModal,
    showDeleteAccountModal: showDeleteAccountModal
};
// Sensus - Módulo de autenticación simplificado
// Versión simplificada para resolver problemas de autenticación

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté disponible
    setTimeout(initSimpleAuth, 1000);
});

// Inicializar autenticación simplificada
function initSimpleAuth() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) {
        console.error('Firebase no disponible');
        setTimeout(initSimpleAuth, 1000);
        return;
    }
    
    console.log('Inicializando autenticación simplificada...');
    
    // Configurar listeners
    setupAuthListeners();
    
    // Configurar formularios
    setupAuthForms();
}

// Configurar listeners de autenticación
function setupAuthListeners() {
    const firebaseAuth = FirebaseServices.auth();
    
    firebaseAuth.onAuthStateChanged(function(user) {
        console.log('Estado de autenticación cambiado:', user ? 'Usuario autenticado' : 'Usuario no autenticado');
        
        if (user) {
            // Usuario autenticado
            updateUIForAuthenticatedUser(user);
            
            // Crear perfil si no existe
            createUserProfileIfNotExists(user);
        } else {
            // Usuario no autenticado
            updateUIForUnauthenticatedUser();
        }
    });
}

// Configurar formularios de autenticación
function setupAuthForms() {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Botones de Google
    const googleButtons = document.querySelectorAll('.google-btn, .btn-google');
    googleButtons.forEach(button => {
        button.addEventListener('click', handleGoogleSignIn);
    });
}

// Manejar login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showError('Por favor, completa todos los campos.');
        return;
    }
    
    const firebaseAuth = FirebaseServices.auth();
    
    showLoading(true);
    
    firebaseAuth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            console.log('Login exitoso:', userCredential.user.uid);
            showSuccess('¡Inicio de sesión exitoso!');
            
            // Redirigir a la app
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1000);
        })
        .catch(function(error) {
            console.error('Error en login:', error);
            showError(getErrorMessage(error));
        })
        .finally(() => {
            showLoading(false);
        });
}

// Manejar registro
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('register-first-name').value;
    const lastName = document.getElementById('register-last-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const acceptTerms = document.getElementById('accept-terms').checked;
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showError('Por favor, completa todos los campos obligatorios.');
        return;
    }
    
    if (!acceptTerms) {
        showError('Debes aceptar los términos y condiciones.');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Las contraseñas no coinciden.');
        return;
    }
    
    if (password.length < 6) {
        showError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    
    const firebaseAuth = FirebaseServices.auth();
    
    showLoading(true);
    
    firebaseAuth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            console.log('Registro exitoso:', userCredential.user.uid);
            
            // Actualizar perfil
            return userCredential.user.updateProfile({
                displayName: `${firstName} ${lastName}`
            });
        })
        .then(function() {
            // Crear perfil en Firestore
            return createUserProfile(firebaseAuth.currentUser.uid, {
                firstName,
                lastName,
                email,
                acceptTerms
            });
        })
        .then(function() {
            showSuccess('¡Cuenta creada exitosamente!');
            
            // Redirigir a la app
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1000);
        })
        .catch(function(error) {
            console.error('Error en registro:', error);
            showError(getErrorMessage(error));
        })
        .finally(() => {
            showLoading(false);
        });
}

// Manejar login con Google
function handleGoogleSignIn() {
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseAuth) {
        showError('Firebase no está disponible.');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    showLoading(true);
    
    firebaseAuth.signInWithPopup(provider)
        .then(function(result) {
            console.log('Login con Google exitoso:', result.user.uid);
            
            // Crear perfil si es usuario nuevo
            if (result.additionalUserInfo.isNewUser) {
                return createUserProfile(result.user.uid, {
                    firstName: result.user.displayName.split(' ')[0],
                    lastName: result.user.displayName.split(' ').slice(1).join(' '),
                    email: result.user.email,
                    acceptTerms: true
                });
            }
        })
        .then(function() {
            showSuccess('¡Inicio de sesión con Google exitoso!');
            
            // Redirigir a la app
            setTimeout(() => {
                window.location.href = 'app.html';
            }, 1000);
        })
        .catch(function(error) {
            console.error('Error en login con Google:', error);
            showError(getErrorMessage(error));
        })
        .finally(() => {
            showLoading(false);
        });
}

// Crear perfil de usuario
function createUserProfile(userId, userData) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return Promise.reject('Firestore no disponible');
    
    const userProfile = {
        uid: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
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
            newsletter: false
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

// Crear perfil si no existe
function createUserProfileIfNotExists(user) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    firebaseFirestore.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (!doc.exists) {
                console.log('Creando perfil para usuario existente...');
                return createUserProfile(user.uid, {
                    firstName: user.displayName?.split(' ')[0] || 'Usuario',
                    lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
                    email: user.email,
                    acceptTerms: true
                });
            }
        })
        .catch((error) => {
            console.error('Error al verificar perfil:', error);
        });
}

// Actualizar UI para usuario autenticado
function updateUIForAuthenticatedUser(user) {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.textContent = 'Mi cuenta';
        loginBtn.onclick = function() {
            window.location.href = 'app.html';
        };
    }
    
    if (registerBtn) {
        registerBtn.textContent = 'Cerrar sesión';
        registerBtn.onclick = function() {
            signOut();
        };
    }
    
    // Mostrar información del usuario
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = user.displayName || 'Usuario';
    });
}

// Actualizar UI para usuario no autenticado
function updateUIForUnauthenticatedUser() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.textContent = 'Iniciar sesión';
        loginBtn.onclick = function() {
            openAuthModal('login');
        };
    }
    
    if (registerBtn) {
        registerBtn.textContent = '¡REGÍSTRATE GRATIS!';
        registerBtn.onclick = function() {
            openAuthModal('register');
        };
    }
}

// Cerrar sesión
function signOut() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    firebaseAuth.signOut()
        .then(function() {
            showSuccess('Sesión cerrada correctamente');
            window.location.href = 'index.html';
        })
        .catch(function(error) {
            console.error('Error al cerrar sesión:', error);
            showError('Error al cerrar sesión');
        });
}

// Obtener mensaje de error
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No existe una cuenta con este correo electrónico.';
        case 'auth/wrong-password':
            return 'Contraseña incorrecta.';
        case 'auth/email-already-in-use':
            return 'Este correo electrónico ya está registrado.';
        case 'auth/invalid-email':
            return 'El formato del correo electrónico no es válido.';
        case 'auth/weak-password':
            return 'La contraseña es demasiado débil.';
        case 'auth/network-request-failed':
            return 'Error de conexión. Verifica tu conexión a internet.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos fallidos. Inténtalo más tarde.';
        case 'auth/user-disabled':
            return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/operation-not-allowed':
            return 'Esta operación no está permitida.';
        case 'auth/popup-closed-by-user':
            return 'El popup de autenticación fue cerrado.';
        case 'auth/popup-blocked':
            return 'El popup fue bloqueado. Permite popups para este sitio.';
        default:
            return 'Ha ocurrido un error. Por favor, inténtalo de nuevo.';
    }
}

// Mostrar error
function showError(message) {
    FirebaseServices.showNotification(message, 'error');
}

// Mostrar éxito
function showSuccess(message) {
    FirebaseServices.showNotification(message, 'success');
}

// Mostrar loading
function showLoading(show) {
    const submitButtons = document.querySelectorAll('.auth-submit');
    submitButtons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        } else {
            button.disabled = false;
            const form = button.closest('form');
            if (form.id === 'login-form') {
                button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            } else if (form.id === 'register-form') {
                button.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
            }
        }
    });
}

// Exportar funciones para uso global
window.SimpleAuth = {
    handleLogin: handleLogin,
    handleRegister: handleRegister,
    handleGoogleSignIn: handleGoogleSignIn,
    signOut: signOut
};

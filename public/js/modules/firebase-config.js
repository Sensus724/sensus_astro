
// Configuración completa de Firebase para Sensus
// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase

const firebaseConfig = {
    // CONFIGURACIÓN REAL DE FIREBASE - Valores de tu proyecto
    apiKey: "AIzaSyBKZiEz_291NXNQpAsuGq8qz0MSUQw41Fw",
    authDomain: "sensus-version-pro.firebaseapp.com",
    projectId: "sensus-version-pro",
    storageBucket: "sensus-version-pro.firebasestorage.app",
    messagingSenderId: "887018721709",
    appId: "1:887018721709:web:fbf4bfa3dc89517f9b9124",
    measurementId: "G-L9YHW52ZSK"
};

// Configuración para servidores de Europa (Belgium)
const firebaseConfigEU = {
    ...firebaseConfig,
    // Forzar región de Europa
    region: 'europe-west1'
};

// Variables globales para los servicios de Firebase
let firebaseApp;
let firebaseAuth;
let firebaseFirestore;
let firebaseStorage;
let firebaseMessaging;
let firebaseAnalytics;
let firebaseFunctions;

// Función para inicializar Firebase con todos los servicios
function initializeFirebase() {
    // Verificar si Firebase está disponible
    if (typeof firebase === 'undefined') {
        console.error('Firebase no está cargado. Verifica que los scripts de Firebase estén incluidos.');
        return false;
    }
    
    // Verificar si ya está inicializado
    if (firebase.apps.length > 0) {
        console.log('Firebase ya está inicializado');
        initializeServices();
        return true;
    }
    
    try {
        // Inicializar Firebase
        firebaseApp = firebase.initializeApp(firebaseConfig);
        
        // Inicializar todos los servicios
        initializeServices();
        
        console.log('Firebase inicializado correctamente con todos los servicios');
        return true;
    } catch (error) {
        console.error('Error al inicializar Firebase:', error);
        return false;
    }
}

// Inicializar todos los servicios de Firebase
function initializeServices() {
    try {
        // Autenticación
        firebaseAuth = firebase.auth();
        
        // Firestore Database
        firebaseFirestore = firebase.firestore();
        
        // Storage
        firebaseStorage = firebase.storage();
        
        // Analytics
        if (firebase.analytics) {
            firebaseAnalytics = firebase.analytics();
        }
        
        // Cloud Messaging (FCM)
        if (firebase.messaging) {
            firebaseMessaging = firebase.messaging();
        }
        
        // Cloud Functions
        if (firebase.functions) {
            firebaseFunctions = firebase.functions();
        }
        
        // Configurar Firestore para desarrollo (opcional)
        if (window.location.hostname === 'localhost') {
            firebaseFirestore.settings({
                host: 'localhost:8080',
                ssl: false
            });
        }
        
        console.log('Todos los servicios de Firebase inicializados correctamente');
        
        // Configurar listeners globales
        setupGlobalListeners();
        
    } catch (error) {
        console.error('Error al inicializar servicios de Firebase:', error);
    }
}

// Configurar listeners globales
function setupGlobalListeners() {
    // Listener de autenticación
    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged(function(user) {
            if (user) {
                console.log('Usuario autenticado:', user.uid);
                // Actualizar UI para usuario autenticado
                updateUIForAuthenticatedUser(user);
            } else {
                console.log('Usuario no autenticado');
                // Actualizar UI para usuario no autenticado
                updateUIForUnauthenticatedUser();
            }
        });
    }
    
    // Listener de conexión de Firestore
    if (firebaseFirestore) {
        firebaseFirestore.enableNetwork()
            .then(() => {
                console.log('Firestore conectado');
            })
            .catch((error) => {
                console.error('Error de conexión a Firestore:', error);
            });
    }
}

// Actualizar UI para usuario autenticado
function updateUIForAuthenticatedUser(user) {
    // Actualizar botones de autenticación
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
        loginBtn.textContent = 'Mi cuenta';
        loginBtn.onclick = function() {
            window.location.href = 'perfil.html';
        };
    }
    
    if (registerBtn) {
        registerBtn.textContent = 'Cerrar sesión';
        registerBtn.onclick = function() {
            firebaseAuth.signOut().then(() => {
                console.log('Sesión cerrada correctamente');
                showNotification('Sesión cerrada correctamente', 'success');
            }).catch((error) => {
                console.error('Error al cerrar sesión:', error);
                showNotification('Error al cerrar sesión', 'error');
            });
        };
    }
    
    // Mostrar notificación de bienvenida
    showNotification(`¡Bienvenido de vuelta, ${user.displayName || 'Usuario'}!`, 'success');
    
    // Cargar datos del usuario
    loadUserData(user.uid);
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

// Cargar datos del usuario
function loadUserData(userId) {
    if (!firebaseFirestore) return;
    
    // Cargar perfil del usuario
    firebaseFirestore.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                console.log('Datos del usuario cargados:', userData);
                // Actualizar UI con datos del usuario
                updateUserProfileUI(userData);
            } else {
                // Crear perfil básico si no existe
                createUserProfile(userId);
            }
        })
        .catch((error) => {
            console.error('Error al cargar datos del usuario:', error);
        });
}

// Crear perfil básico del usuario
function createUserProfile(userId) {
    if (!firebaseFirestore) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    const userProfile = {
        uid: userId,
        email: user.email,
        displayName: user.displayName || 'Usuario',
        photoURL: user.photoURL || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        preferences: {
            theme: 'light',
            notifications: true,
            language: 'es',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            reminderTime: '20:00',
            weeklyReport: true,
            motivationalMessages: true
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
        }
    };
    
    firebaseFirestore.collection('users').doc(userId).set(userProfile)
        .then(() => {
            console.log('Perfil de usuario creado correctamente');
        })
        .catch((error) => {
            console.error('Error al crear perfil de usuario:', error);
        });
}

// Actualizar UI del perfil del usuario
function updateUserProfileUI(userData) {
    // Actualizar elementos de la UI con los datos del usuario
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userData.displayName || 'Usuario';
    });
    
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(element => {
        element.textContent = userData.email || '';
    });
    
    // Actualizar estadísticas si están disponibles
    if (userData.stats) {
        updateUserStatsUI(userData.stats);
    }
}

// Actualizar UI de estadísticas del usuario
function updateUserStatsUI(stats) {
    const streakElement = document.getElementById('user-streak');
    if (streakElement) {
        streakElement.textContent = stats.currentStreak || 0;
    }
    
    const totalEntriesElement = document.getElementById('user-total-entries');
    if (totalEntriesElement) {
        totalEntriesElement.textContent = stats.totalDiaryEntries || 0;
    }
    
    const averageMoodElement = document.getElementById('user-average-mood');
    if (averageMoodElement) {
        averageMoodElement.textContent = (stats.averageMood || 3).toFixed(1);
    }
}

// Función para mostrar notificaciones toast
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
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

// Obtener icono de notificación según el tipo
function getNotificationIcon(type) {
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

// Inicializar Firebase cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para asegurar que Firebase esté cargado
    setTimeout(initializeFirebase, 100);
});

// También intentar inicializar inmediatamente si Firebase ya está disponible
if (typeof firebase !== 'undefined') {
    initializeFirebase();
}

// Exportar servicios para uso en otros módulos
window.FirebaseServices = {
    auth: () => firebaseAuth,
    firestore: () => firebaseFirestore,
    storage: () => firebaseStorage,
    messaging: () => firebaseMessaging,
    analytics: () => firebaseAnalytics,
    functions: () => firebaseFunctions,
    showNotification: showNotification
};

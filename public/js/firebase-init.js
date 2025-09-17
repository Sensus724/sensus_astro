/*
 * Sensus - Inicialización de Firebase
 * Script principal para cargar y configurar Firebase
 * Incluye: SDK de Firebase, configuración y servicios
 */

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBKZiEz_291NXNQpAsuGq8qz0MSUQw41Fw",
    authDomain: "sensus-version-pro.firebaseapp.com",
    projectId: "sensus-version-pro",
    storageBucket: "sensus-version-pro.firebasestorage.app",
    messagingSenderId: "887018721709",
    appId: "1:887018721709:web:fbf4bfa3dc89517f9b9124",
    measurementId: "G-L9YHW52ZSK"
};

// Función para cargar Firebase SDK
function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        // Verificar si Firebase ya está cargado
        if (typeof firebase !== 'undefined') {
            resolve();
            return;
        }

        // Cargar Firebase SDK
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
        script.onload = () => {
            // Cargar módulos adicionales
            loadFirebaseModules().then(resolve).catch(reject);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Función para cargar módulos adicionales de Firebase
function loadFirebaseModules() {
    const modules = [
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js',
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js',
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js',
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging.js',
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js',
        'https://www.gstatic.com/firebasejs/9.22.0/firebase-functions.js'
    ];

    return Promise.all(modules.map(module => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = module;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }));
}

// Función para inicializar Firebase
function initializeFirebase() {
    try {
        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        
        // Configurar Analytics
        if (firebase.analytics) {
            firebase.analytics();
        }
        
        // Configurar Messaging
        if (firebase.messaging) {
            const messaging = firebase.messaging();
            
            // Solicitar permisos para notificaciones
            messaging.requestPermission().then(() => {
                console.log('✅ Permisos de notificación concedidos');
                
                // Obtener token
                messaging.getToken().then((token) => {
                    if (token) {
                        console.log('✅ Token de FCM obtenido:', token);
                        // Guardar token para uso posterior
                        localStorage.setItem('fcm_token', token);
                    }
                }).catch((error) => {
                    console.error('❌ Error obteniendo token FCM:', error);
                });
            }).catch((error) => {
                console.error('❌ Error solicitando permisos:', error);
            });
        }
        
        console.log('✅ Firebase inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        return false;
    }
}

// Función para configurar Service Worker de Firebase Messaging
function setupFirebaseMessaging() {
    if ('serviceWorker' in navigator && firebase.messaging) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registrado:', registration);
                
                const messaging = firebase.messaging();
                messaging.useServiceWorker(registration);
            })
            .catch((error) => {
                console.error('❌ Error registrando Service Worker:', error);
            });
    }
}

// Función para migrar datos de localStorage a Firebase
async function migrateDataToFirebase() {
    if (!window.firebaseServices) {
        console.log('⚠️ Firebase Services no disponible para migración');
        return;
    }

    try {
        // Verificar si ya se migró
        const migrationKey = 'data_migrated_to_firebase';
        if (localStorage.getItem(migrationKey)) {
            console.log('✅ Datos ya migrados a Firebase');
            return;
        }

        // Migrar datos
        await window.firebaseServices.migrateLocalStorageData();
        
        // Marcar como migrado
        localStorage.setItem(migrationKey, 'true');
        console.log('✅ Migración de datos completada');
    } catch (error) {
        console.error('❌ Error en migración de datos:', error);
    }
}

// Función principal de inicialización
async function initFirebase() {
    try {
        console.log('🔄 Inicializando Firebase...');
        
        // Cargar SDK
        await loadFirebaseSDK();
        
        // Inicializar Firebase
        const initialized = initializeFirebase();
        if (!initialized) {
            throw new Error('Error inicializando Firebase');
        }
        
        // Configurar Service Worker
        setupFirebaseMessaging();
        
        // Esperar un poco para que los servicios se inicialicen
        setTimeout(async () => {
            // Migrar datos si es necesario
            await migrateDataToFirebase();
            
            // Disparar evento de Firebase listo
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        }, 1000);
        
        console.log('✅ Firebase completamente inicializado');
    } catch (error) {
        console.error('❌ Error en inicialización de Firebase:', error);
        
        // Disparar evento de error
        window.dispatchEvent(new CustomEvent('firebaseError', { detail: error }));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initFirebase);

// También inicializar inmediatamente si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFirebase);
} else {
    initFirebase();
}

// Exportar configuración para uso global
window.FirebaseConfig = firebaseConfig;

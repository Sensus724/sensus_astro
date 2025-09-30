/*
 * Sensus - Inicialización de Firebase
 * Script principal para cargar y configurar Firebase
 * Usa configuración centralizada desde firebase-config.js
 */

// Importar configuración de Firebase
import firebaseConfig from '../modules/firebase-config.js';

// Función para inicializar Firebase usando la versión instalada vía npm
async function initializeFirebaseSDK() {
    try {
        // Importar Firebase usando ES modules (ya instalado vía npm)
        const { initializeApp } = await import('firebase/app');
        const { getAuth } = await import('firebase/auth');
        const { getFirestore } = await import('firebase/firestore');
        const { getStorage } = await import('firebase/storage');
        const { getMessaging, isSupported } = await import('firebase/messaging');
        const { getAnalytics, isSupported: isAnalyticsSupported } = await import('firebase/analytics');
        const { getFunctions } = await import('firebase/functions');

        // Inicializar Firebase app
        const app = initializeApp(firebaseConfig);

        // Inicializar servicios
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const storage = getStorage(app);

        // Inicializar Messaging si es soportado
        let messaging = null;
        if (await isSupported()) {
            messaging = getMessaging(app);
        }

        // Inicializar Analytics si es soportado
        let analytics = null;
        if (await isAnalyticsSupported()) {
            analytics = getAnalytics(app);
        }

        const functions = getFunctions(app);

        // Hacer servicios disponibles globalmente
        window.firebase = {
            app,
            auth,
            firestore,
            storage,
            messaging,
            analytics,
            functions
        };

        console.log('✅ Firebase v12 inicializado correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando Firebase v12:', error);
        return false;
    }
}

// Función para inicializar servicios de Firebase
async function initializeFirebaseServices() {
    try {
        // Configurar Messaging si está disponible
        if (window.firebase.messaging) {
            const messaging = window.firebase.messaging;

            // Solicitar permisos para notificaciones
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    console.log('✅ Permisos de notificación concedidos');

                    // Obtener token
                    const token = await messaging.getToken({
                        vapidKey: 'BKZiEz_291NXNQpAsuGq8qz0MSUQw41Fw' // Reemplazar con tu clave VAPID
                    });

                    if (token) {
                        console.log('✅ Token de FCM obtenido:', token);
                        // Guardar token para uso posterior
                        localStorage.setItem('fcm_token', token);
                    }
                } else {
                    console.log('❌ Permisos de notificación denegados');
                }
            } catch (error) {
                console.error('❌ Error con permisos de notificación:', error);
            }
        }

        // Configurar listeners de autenticación
        if (window.firebase.auth) {
            window.firebase.auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ Usuario autenticado:', user.uid);
                } else {
                    console.log('❌ Usuario no autenticado');
                }
            });
        }

        console.log('✅ Servicios de Firebase inicializados correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando servicios de Firebase:', error);
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
        console.log('🔄 Inicializando Firebase v12...');

        // Inicializar Firebase SDK
        const sdkInitialized = await initializeFirebaseSDK();
        if (!sdkInitialized) {
            throw new Error('Error inicializando Firebase SDK');
        }

        // Inicializar servicios
        const servicesInitialized = await initializeFirebaseServices();
        if (!servicesInitialized) {
            throw new Error('Error inicializando servicios de Firebase');
        }

        // Configurar Service Worker para Messaging
        if (window.firebase.messaging && 'serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
                console.log('✅ Service Worker registrado:', registration);
                window.firebase.messaging.useServiceWorker(registration);
            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        }

        // Esperar un poco para que los servicios se inicialicen
        setTimeout(async () => {
            // Migrar datos si es necesario
            await migrateDataToFirebase();

            // Disparar evento de Firebase listo
            window.dispatchEvent(new CustomEvent('firebaseReady'));
        }, 1000);

        console.log('✅ Firebase v12 completamente inicializado');
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

// Funciones de autenticación con proveedores externos
async function signInWithGoogle() {
    try {
        if (!window.firebase.auth) {
            console.error('Firebase Auth no está inicializado');
            return;
        }

        const provider = new window.firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');

        const result = await window.firebase.auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Usuario autenticado con Google:', user.email);

        // Cerrar modal de autenticación
        if (window.closeAuthModal) {
            window.closeAuthModal();
        }

        // Mostrar mensaje de éxito
        if (window.showNotification) {
            window.showNotification('¡Bienvenido! Has iniciado sesión con Google', 'success');
        }

        return user;
    } catch (error) {
        console.error('Error en autenticación con Google:', error);
        if (window.showNotification) {
            window.showNotification('Error al iniciar sesión con Google: ' + error.message, 'error');
        }
        throw error;
    }
}

async function signInWithApple() {
    try {
        if (!window.firebase.auth) {
            console.error('Firebase Auth no está inicializado');
            return;
        }

        const provider = new window.firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');

        const result = await window.firebase.auth.signInWithPopup(provider);
        const user = result.user;

        console.log('Usuario autenticado con Apple:', user.email);

        // Cerrar modal de autenticación
        if (window.closeAuthModal) {
            window.closeAuthModal();
        }

        // Mostrar mensaje de éxito
        if (window.showNotification) {
            window.showNotification('¡Bienvenido! Has iniciado sesión con Apple', 'success');
        }

        return user;
    } catch (error) {
        console.error('Error en autenticación con Apple:', error);
        if (window.showNotification) {
            window.showNotification('Error al iniciar sesión con Apple: ' + error.message, 'error');
        }
        throw error;
    }
}

// Exportar funciones globalmente
window.signInWithGoogle = signInWithGoogle;
window.signInWithApple = signInWithApple;

// Exportar configuración para uso global
window.FirebaseConfig = firebaseConfig;

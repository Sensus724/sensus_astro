// Service Worker para Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

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

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Manejar mensajes en background
messaging.onBackgroundMessage(function(payload) {
    console.log('Mensaje recibido en background:', payload);
    
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sensus-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Abrir aplicación'
            },
            {
                action: 'dismiss',
                title: 'Cerrar'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', function(event) {
    console.log('Notificación clickeada:', event);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

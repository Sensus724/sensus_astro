// Sensus - Módulo de notificaciones con Firebase Cloud Messaging

document.addEventListener('DOMContentLoaded', function() {
    initNotificationsModule();
});

function initNotificationsModule() {
    // Verificar si Firebase está disponible
    if (typeof FirebaseServices === 'undefined') {
        console.error('FirebaseServices no está disponible');
        return;
    }
    
    const firebaseMessaging = FirebaseServices.messaging();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseMessaging || !firebaseAuth) {
        console.error('Servicios de Firebase no disponibles');
        return;
    }
    
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
        console.log('Este navegador no soporta notificaciones');
        return;
    }
    
    // Configurar Firebase Cloud Messaging
    setupFirebaseMessaging();
    
    // Configurar listeners de notificaciones
    setupNotificationListeners();
}

// Configurar Firebase Cloud Messaging
function setupFirebaseMessaging() {
    const firebaseMessaging = FirebaseServices.messaging();
    
    if (!firebaseMessaging) return;
    
    // Configurar VAPID key (necesitas obtenerla de Firebase Console)
    const vapidKey = 'BEl62iUYgUivxIkv69yViEuiBIa-IkT9F9Ew0yHaJLYUZR3i8VW3sUIFD9MAJ2zmZQKIt3wlix45fS2i46yOw';
    
    firebaseMessaging.usePublicVapidKey(vapidKey);
    
    // Solicitar permiso para notificaciones
    requestNotificationPermission();
    
    // Obtener token de FCM
    getFCMToken();
    
    // Escuchar mensajes en primer plano
    firebaseMessaging.onMessage((payload) => {
        console.log('Mensaje recibido en primer plano:', payload);
        showNotification(payload.notification.title, payload.notification.body, payload.notification.icon);
    });
    
    // Escuchar clics en notificaciones
    firebaseMessaging.onBackgroundMessage((payload) => {
        console.log('Mensaje recibido en segundo plano:', payload);
    });
}

// Solicitar permiso para notificaciones
function requestNotificationPermission() {
    if (Notification.permission === 'granted') {
        console.log('Permiso para notificaciones ya concedido');
        return Promise.resolve();
    }
    
    if (Notification.permission === 'denied') {
        console.log('Permiso para notificaciones denegado');
        return Promise.reject('Permiso denegado');
    }
    
    return Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
            console.log('Permiso para notificaciones concedido');
            return Promise.resolve();
        } else {
            console.log('Permiso para notificaciones denegado');
            return Promise.reject('Permiso denegado');
        }
    });
}

// Obtener token de FCM
function getFCMToken() {
    const firebaseMessaging = FirebaseServices.messaging();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseMessaging || !firebaseAuth) return;
    
    firebaseMessaging.getToken()
        .then((token) => {
            if (token) {
                console.log('Token FCM obtenido:', token);
                saveFCMToken(token);
            } else {
                console.log('No se pudo obtener el token FCM');
            }
        })
        .catch((error) => {
            console.error('Error al obtener token FCM:', error);
        });
}

// Guardar token FCM en Firestore
function saveFCMToken(token) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    firebaseFirestore.collection('users').doc(user.uid).update({
        fcmToken: token,
        lastTokenUpdate: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log('Token FCM guardado correctamente');
    })
    .catch((error) => {
        console.error('Error al guardar token FCM:', error);
    });
}

// Configurar listeners de notificaciones
function setupNotificationListeners() {
    // Escuchar clics en notificaciones
    self.addEventListener('notificationclick', (event) => {
        console.log('Notificación clickeada:', event);
        
        event.notification.close();
        
        // Abrir la aplicación
        event.waitUntil(
            clients.openWindow('/')
        );
    });
    
    // Escuchar cambios en el estado de autenticación
    const firebaseAuth = FirebaseServices.auth();
    if (firebaseAuth) {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                // Usuario autenticado, configurar notificaciones
                setupUserNotifications(user.uid);
            } else {
                // Usuario no autenticado, limpiar notificaciones
                clearUserNotifications();
            }
        });
    }
}

// Configurar notificaciones del usuario
function setupUserNotifications(userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseFirestore) return;
    
    // Escuchar cambios en las preferencias del usuario
    firebaseFirestore.collection('users').doc(userId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const preferences = userData.preferences || {};
                
                // Configurar notificaciones según las preferencias
                if (preferences.notifications) {
                    setupReminderNotifications(preferences.reminderTime);
                    setupMotivationalNotifications(preferences.motivationalMessages);
                } else {
                    clearAllNotifications();
                }
            }
        });
}

// Configurar notificaciones de recordatorio
function setupReminderNotifications(reminderTime) {
    if (!reminderTime) return;
    
    // Limpiar recordatorios anteriores
    clearReminderNotifications();
    
    // Configurar recordatorio diario
    const [hours, minutes] = reminderTime.split(':').map(Number);
    
    // Crear notificación de recordatorio
    const reminderNotification = {
        title: '📝 Recordatorio del Diario',
        body: 'Es hora de escribir en tu diario emocional. ¿Cómo te sientes hoy?',
        icon: '/assets/icons/favicon.ico',
        badge: '/assets/icons/favicon.ico',
        tag: 'diary-reminder',
        requireInteraction: true,
        actions: [
            {
                action: 'open-diary',
                title: 'Abrir Diario'
            },
            {
                action: 'snooze',
                title: 'Recordar en 1 hora'
            }
        ]
    };
    
    // Programar notificación
    scheduleNotification(reminderNotification, hours, minutes);
}

// Configurar notificaciones motivacionales
function setupMotivationalNotifications(enabled) {
    if (!enabled) {
        clearMotivationalNotifications();
        return;
    }
    
    // Mensajes motivacionales
    const motivationalMessages = [
        {
            title: '🌟 ¡Sigue así!',
            body: 'Cada día que escribes en tu diario es un paso hacia el bienestar emocional.'
        },
        {
            title: '💪 Eres más fuerte de lo que crees',
            body: 'La ansiedad no te define. Tú tienes el poder de controlarla.'
        },
        {
            title: '🌈 Cada día es una nueva oportunidad',
            body: 'Ayer ya pasó. Hoy puedes empezar de nuevo con una actitud positiva.'
        },
        {
            title: '🧘‍♀️ Respira profundo',
            body: 'Cuando sientas ansiedad, recuerda: respira profundo y confía en ti mismo.'
        },
        {
            title: '🎯 Pequeños pasos, grandes cambios',
            body: 'No necesitas cambiar todo de una vez. Cada pequeño paso cuenta.'
        }
    ];
    
    // Programar notificaciones motivacionales aleatorias
    motivationalMessages.forEach((message, index) => {
        const delay = (index + 1) * 24 * 60 * 60 * 1000; // Cada 24 horas
        setTimeout(() => {
            showNotification(message.title, message.body);
        }, delay);
    });
}

// Programar notificación
function scheduleNotification(notification, hours, minutes) {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);
    
    // Si la hora ya pasó hoy, programar para mañana
    if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            const notificationInstance = new Notification(notification.title, {
                body: notification.body,
                icon: notification.icon,
                badge: notification.badge,
                tag: notification.tag,
                requireInteraction: notification.requireInteraction,
                actions: notification.actions
            });
            
            // Configurar acciones
            if (notification.actions) {
                notificationInstance.addEventListener('click', (event) => {
                    handleNotificationAction(event.action);
                });
            }
        }
    }, timeUntilNotification);
}

// Mostrar notificación
function showNotification(title, body, icon = '/assets/icons/favicon.ico') {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: '/assets/icons/favicon.ico',
            requireInteraction: true
        });
        
        // Cerrar notificación después de 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        // Manejar clic en notificación
        notification.addEventListener('click', () => {
            window.focus();
            notification.close();
        });
    }
}

// Manejar acciones de notificación
function handleNotificationAction(action) {
    switch (action) {
        case 'open-diary':
            window.location.href = 'diario.html';
            break;
        case 'snooze':
            // Reprogramar notificación en 1 hora
            setTimeout(() => {
                showNotification('📝 Recordatorio del Diario', 'Es hora de escribir en tu diario emocional. ¿Cómo te sientes hoy?');
            }, 60 * 60 * 1000);
            break;
        default:
            console.log('Acción de notificación no reconocida:', action);
    }
}

// Limpiar notificaciones de recordatorio
function clearReminderNotifications() {
    // En una implementación real, aquí se cancelarían las notificaciones programadas
    console.log('Limpiando notificaciones de recordatorio');
}

// Limpiar notificaciones motivacionales
function clearMotivationalNotifications() {
    // En una implementación real, aquí se cancelarían las notificaciones programadas
    console.log('Limpiando notificaciones motivacionales');
}

// Limpiar todas las notificaciones
function clearAllNotifications() {
    clearReminderNotifications();
    clearMotivationalNotifications();
}

// Limpiar notificaciones del usuario
function clearUserNotifications() {
    clearAllNotifications();
}

// Enviar notificación personalizada
function sendCustomNotification(title, body, userId = null) {
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseFirestore) return Promise.reject('Firestore no disponible');
    
    const notification = {
        title: title,
        body: body,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    };
    
    if (userId) {
        // Enviar a usuario específico
        return firebaseFirestore.collection('users').doc(userId).collection('notifications').add(notification);
    } else {
        // Enviar a todos los usuarios
        return firebaseFirestore.collection('notifications').add(notification);
    }
}

// Marcar notificación como leída
function markNotificationAsRead(notificationId) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    return firebaseFirestore.collection('users').doc(user.uid).collection('notifications').doc(notificationId).update({
        read: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Obtener notificaciones del usuario
function getUserNotifications() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    return firebaseFirestore.collection('users').doc(user.uid).collection('notifications')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get()
        .then((querySnapshot) => {
            const notifications = [];
            querySnapshot.forEach((doc) => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return notifications;
        });
}

// Enviar notificación de logro
function sendAchievementNotification(achievement) {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    const title = '🏆 ¡Nuevo Logro Desbloqueado!';
    const body = `Has conseguido: ${achievement.name}. ¡Sigue así!`;
    
    // Mostrar notificación local
    showNotification(title, body);
    
    // Guardar en base de datos
    sendCustomNotification(title, body, user.uid);
}

// Enviar notificación de recordatorio de test
function sendTestReminderNotification() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    const title = '📊 Recordatorio de Test';
    const body = 'Es hora de realizar tu test de ansiedad semanal. ¿Cómo te sientes?';
    
    // Mostrar notificación local
    showNotification(title, body);
    
    // Guardar en base de datos
    sendCustomNotification(title, body, user.uid);
}

// Enviar notificación de reporte semanal
function sendWeeklyReportNotification() {
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    const title = '📈 Tu Reporte Semanal';
    const body = 'Tu reporte semanal de bienestar está listo. ¡Revisa tu progreso!';
    
    // Mostrar notificación local
    showNotification(title, body);
    
    // Guardar en base de datos
    sendCustomNotification(title, body, user.uid);
}

// Configurar notificaciones de logros
function setupAchievementNotifications() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    // Escuchar nuevos logros
    firebaseFirestore.collection('users').doc(user.uid)
        .collection('achievements')
        .where('new', '==', true)
        .onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const achievement = doc.data();
                sendAchievementNotification(achievement);
                
                // Marcar como no nuevo
                doc.ref.update({ new: false });
            });
        });
}

// Configurar notificaciones de recordatorios
function setupReminderNotifications() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    // Escuchar configuración de recordatorios
    firebaseFirestore.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                const preferences = userData.preferences || {};
                
                if (preferences.notifications && preferences.reminderTime) {
                    setupReminderNotifications(preferences.reminderTime);
                }
            }
        });
}

// Exportar funciones para uso global
window.Notifications = {
    requestPermission: requestNotificationPermission,
    sendCustom: sendCustomNotification,
    markAsRead: markNotificationAsRead,
    getUserNotifications: getUserNotifications,
    show: showNotification,
    sendAchievement: sendAchievementNotification,
    sendTestReminder: sendTestReminderNotification,
    sendWeeklyReport: sendWeeklyReportNotification,
    setupAchievementNotifications: setupAchievementNotifications,
    setupReminderNotifications: setupReminderNotifications
};

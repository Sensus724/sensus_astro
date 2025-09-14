// Sensus - Módulo de perfil de usuario con Firebase

document.addEventListener('DOMContentLoaded', function() {
    initUserProfileModule();
});

function initUserProfileModule() {
    // Verificar si Firebase está disponible
    if (typeof FirebaseServices === 'undefined') {
        console.error('FirebaseServices no está disponible');
        return;
    }
    
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) {
        console.error('Servicios de Firebase no disponibles');
        return;
    }
    
    // Escuchar cambios en el estado de autenticación
    firebaseAuth.onAuthStateChanged(function(user) {
        if (user) {
            loadUserProfile(user.uid);
            setupProfileListeners();
        } else {
            clearUserProfile();
        }
    });
}

// Cargar perfil del usuario
function loadUserProfile(userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    firebaseFirestore.collection('users').doc(userId).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                updateProfileUI(userData);
            } else {
                createUserProfile(userId);
            }
        })
        .catch((error) => {
            console.error('Error al cargar perfil:', error);
            FirebaseServices.showNotification('Error al cargar perfil', 'error');
        });
}

// Crear perfil de usuario
function createUserProfile(userId) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
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
            updateProfileUI(userProfile);
        })
        .catch((error) => {
            console.error('Error al crear perfil:', error);
            FirebaseServices.showNotification('Error al crear perfil', 'error');
        });
}

// Actualizar UI del perfil
function updateProfileUI(userData) {
    // Actualizar información básica
    updateBasicInfo(userData);
    
    // Actualizar estadísticas
    updateStats(userData.stats);
    
    // Actualizar preferencias
    updatePreferences(userData.preferences);
    
    // Actualizar configuración de privacidad
    updatePrivacySettings(userData.privacy);
}

// Actualizar información básica
function updateBasicInfo(userData) {
    const nameElements = document.querySelectorAll('.user-name, .profile-name');
    nameElements.forEach(element => {
        element.textContent = userData.displayName || 'Usuario';
    });
    
    const emailElements = document.querySelectorAll('.user-email, .profile-email');
    emailElements.forEach(element => {
        element.textContent = userData.email || '';
    });
    
    const photoElements = document.querySelectorAll('.user-photo, .profile-photo');
    photoElements.forEach(element => {
        if (userData.photoURL) {
            element.src = userData.photoURL;
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    
    // Actualizar fecha de creación
    const createdAtElements = document.querySelectorAll('.user-created-at');
    createdAtElements.forEach(element => {
        if (userData.createdAt) {
            const date = userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt);
            element.textContent = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    });
}

// Actualizar estadísticas
function updateStats(stats) {
    if (!stats) return;
    
    // Racha actual
    const streakElements = document.querySelectorAll('.current-streak, .user-streak');
    streakElements.forEach(element => {
        element.textContent = stats.currentStreak || 0;
    });
    
    // Racha más larga
    const longestStreakElements = document.querySelectorAll('.longest-streak');
    longestStreakElements.forEach(element => {
        element.textContent = stats.longestStreak || 0;
    });
    
    // Total de entradas
    const totalEntriesElements = document.querySelectorAll('.total-entries, .user-total-entries');
    totalEntriesElements.forEach(element => {
        element.textContent = stats.totalDiaryEntries || 0;
    });
    
    // Total de tests
    const totalTestsElements = document.querySelectorAll('.total-tests, .user-total-tests');
    totalTestsElements.forEach(element => {
        element.textContent = stats.totalTests || 0;
    });
    
    // Estado de ánimo promedio
    const averageMoodElements = document.querySelectorAll('.average-mood, .user-average-mood');
    averageMoodElements.forEach(element => {
        element.textContent = (stats.averageMood || 3).toFixed(1);
    });
    
    // Tiempo total invertido
    const totalTimeElements = document.querySelectorAll('.total-time, .user-total-time');
    totalTimeElements.forEach(element => {
        const hours = Math.floor((stats.totalTimeSpent || 0) / 60);
        const minutes = (stats.totalTimeSpent || 0) % 60;
        element.textContent = `${hours}h ${minutes}m`;
    });
    
    // Última entrada del diario
    const lastEntryElements = document.querySelectorAll('.last-entry, .user-last-entry');
    lastEntryElements.forEach(element => {
        if (stats.lastDiaryEntry) {
            const date = stats.lastDiaryEntry.toDate ? stats.lastDiaryEntry.toDate() : new Date(stats.lastDiaryEntry);
            element.textContent = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else {
            element.textContent = 'Nunca';
        }
    });
    
    // Último test
    const lastTestElements = document.querySelectorAll('.last-test, .user-last-test');
    lastTestElements.forEach(element => {
        if (stats.lastTestDate) {
            const date = stats.lastTestDate.toDate ? stats.lastTestDate.toDate() : new Date(stats.lastTestDate);
            element.textContent = date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else {
            element.textContent = 'Nunca';
        }
    });
}

// Actualizar preferencias
function updatePreferences(preferences) {
    if (!preferences) return;
    
    // Tema
    const themeElements = document.querySelectorAll('.theme-preference');
    themeElements.forEach(element => {
        element.value = preferences.theme || 'light';
    });
    
    // Notificaciones
    const notificationElements = document.querySelectorAll('.notification-preference');
    notificationElements.forEach(element => {
        element.checked = preferences.notifications !== false;
    });
    
    // Idioma
    const languageElements = document.querySelectorAll('.language-preference');
    languageElements.forEach(element => {
        element.value = preferences.language || 'es';
    });
    
    // Hora de recordatorio
    const reminderElements = document.querySelectorAll('.reminder-time');
    reminderElements.forEach(element => {
        element.value = preferences.reminderTime || '20:00';
    });
    
    // Reporte semanal
    const weeklyReportElements = document.querySelectorAll('.weekly-report-preference');
    weeklyReportElements.forEach(element => {
        element.checked = preferences.weeklyReport !== false;
    });
    
    // Mensajes motivacionales
    const motivationalElements = document.querySelectorAll('.motivational-messages-preference');
    motivationalElements.forEach(element => {
        element.checked = preferences.motivationalMessages !== false;
    });
}

// Actualizar configuración de privacidad
function updatePrivacySettings(privacy) {
    if (!privacy) return;
    
    // Compartir datos
    const shareDataElements = document.querySelectorAll('.share-data-preference');
    shareDataElements.forEach(element => {
        element.checked = privacy.shareData === true;
    });
    
    // Modo anónimo
    const anonymousElements = document.querySelectorAll('.anonymous-mode-preference');
    anonymousElements.forEach(element => {
        element.checked = privacy.anonymousMode === true;
    });
    
    // Retención de datos
    const retentionElements = document.querySelectorAll('.data-retention-preference');
    retentionElements.forEach(element => {
        element.value = privacy.dataRetention || '1year';
    });
}

// Configurar listeners del perfil
function setupProfileListeners() {
    // Listener para cambios en el perfil
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
    const user = firebaseAuth.currentUser;
    if (!user) return;
    
    // Escuchar cambios en tiempo real
    firebaseFirestore.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                updateProfileUI(userData);
            }
        }, (error) => {
            console.error('Error al escuchar cambios del perfil:', error);
        });
}

// Limpiar perfil del usuario
function clearUserProfile() {
    // Limpiar elementos de la UI
    const userElements = document.querySelectorAll('.user-name, .profile-name, .user-email, .profile-email');
    userElements.forEach(element => {
        element.textContent = '';
    });
    
    const photoElements = document.querySelectorAll('.user-photo, .profile-photo');
    photoElements.forEach(element => {
        element.src = '';
        element.style.display = 'none';
    });
    
    // Limpiar estadísticas
    const statElements = document.querySelectorAll('.current-streak, .longest-streak, .total-entries, .total-tests, .average-mood, .total-time, .last-entry, .last-test');
    statElements.forEach(element => {
        element.textContent = '0';
    });
}

// Función para actualizar perfil
function updateUserProfile(updates) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Agregar timestamp de actualización
    updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    
    return firebaseFirestore.collection('users').doc(user.uid).update(updates)
        .then(() => {
            console.log('Perfil actualizado correctamente');
            FirebaseServices.showNotification('Perfil actualizado correctamente', 'success');
        })
        .catch((error) => {
            console.error('Error al actualizar perfil:', error);
            FirebaseServices.showNotification('Error al actualizar perfil', 'error');
            throw error;
        });
}

// Función para subir foto de perfil
function uploadProfilePhoto(file) {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseStorage = FirebaseServices.storage();
    
    if (!firebaseAuth || !firebaseStorage) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Validar archivo
    if (!file || !file.type.startsWith('image/')) {
        return Promise.reject('Archivo no válido');
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
        return Promise.reject('El archivo es demasiado grande (máximo 5MB)');
    }
    
    // Crear referencia de almacenamiento
    const storageRef = firebaseStorage.ref();
    const photoRef = storageRef.child(`profile-photos/${user.uid}/${Date.now()}_${file.name}`);
    
    // Subir archivo
    return photoRef.put(file)
        .then((snapshot) => {
            return snapshot.ref.getDownloadURL();
        })
        .then((downloadURL) => {
            // Actualizar perfil con nueva URL
            return updateUserProfile({
                photoURL: downloadURL
            });
        })
        .catch((error) => {
            console.error('Error al subir foto:', error);
            FirebaseServices.showNotification('Error al subir foto', 'error');
            throw error;
        });
}

// Función para eliminar cuenta
function deleteUserAccount() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
        return Promise.reject('Operación cancelada');
    }
    
    // Eliminar datos del usuario
    return firebaseFirestore.collection('users').doc(user.uid).delete()
        .then(() => {
            // Eliminar cuenta de autenticación
            return user.delete();
        })
        .then(() => {
            console.log('Cuenta eliminada correctamente');
            FirebaseServices.showNotification('Cuenta eliminada correctamente', 'success');
            // Redirigir a la página principal
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error al eliminar cuenta:', error);
            FirebaseServices.showNotification('Error al eliminar cuenta', 'error');
            throw error;
        });
}

// Función para exportar datos del usuario
function exportUserData() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    // Obtener todos los datos del usuario
    return firebaseFirestore.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (!doc.exists) {
                throw new Error('No se encontraron datos del usuario');
            }
            
            const userData = doc.data();
            
            // Crear objeto de exportación
            const exportData = {
                user: {
                    uid: userData.uid,
                    email: userData.email,
                    displayName: userData.displayName,
                    createdAt: userData.createdAt,
                    preferences: userData.preferences,
                    privacy: userData.privacy
                },
                stats: userData.stats,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            // Crear archivo JSON
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            // Descargar archivo
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sensus-data-${user.uid}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            FirebaseServices.showNotification('Datos exportados correctamente', 'success');
        })
        .catch((error) => {
            console.error('Error al exportar datos:', error);
            FirebaseServices.showNotification('Error al exportar datos', 'error');
            throw error;
        });
}

// Función para actualizar preferencias
function updateUserPreferences(preferences) {
    return updateUserProfile({
        preferences: preferences
    });
}

// Función para actualizar configuración de privacidad
function updateUserPrivacy(privacy) {
    return updateUserProfile({
        privacy: privacy
    });
}

// Función para actualizar información básica
function updateBasicInfo(basicInfo) {
    return updateUserProfile({
        displayName: basicInfo.displayName,
        firstName: basicInfo.firstName,
        lastName: basicInfo.lastName
    });
}

// Exportar funciones para uso global
window.UserProfile = {
    updateProfile: updateUserProfile,
    uploadPhoto: uploadProfilePhoto,
    deleteAccount: deleteUserAccount,
    exportData: exportUserData,
    updatePreferences: updateUserPreferences,
    updatePrivacy: updateUserPrivacy,
    updateBasicInfo: updateBasicInfo
};

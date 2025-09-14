// Sensus - Configuración de base de datos de prueba
// Este módulo se encarga de poblar Firebase con datos de prueba

document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase esté disponible
    setTimeout(setupDatabase, 2000);
});

// Configurar base de datos con datos de prueba
function setupDatabase() {
    const firebaseFirestore = FirebaseServices.firestore();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseFirestore) {
        console.error('Firestore no disponible');
        return;
    }
    
    console.log('Configurando base de datos de prueba...');
    
    // Crear usuario de prueba
    createTestUser();
    
    // Poblar datos de prueba
    populateTestData();
}

// Crear usuario de prueba
function createTestUser() {
    const firebaseAuth = FirebaseServices.auth();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAuth || !firebaseFirestore) return;
    
    // Crear usuario de prueba con email y contraseña
    const testEmail = 'test@sensus.com';
    const testPassword = 'Test123!';
    
    firebaseAuth.createUserWithEmailAndPassword(testEmail, testPassword)
        .then(function(userCredential) {
            console.log('Usuario de prueba creado:', userCredential.user.uid);
            
            // Actualizar perfil
            return userCredential.user.updateProfile({
                displayName: 'Usuario de Prueba'
            });
        })
        .then(function() {
            // Crear perfil completo en Firestore
            const userId = firebaseAuth.currentUser.uid;
            return createTestUserProfile(userId);
        })
        .then(function() {
            console.log('Perfil de usuario de prueba creado correctamente');
            FirebaseServices.showNotification('Base de datos de prueba configurada correctamente', 'success');
        })
        .catch(function(error) {
            if (error.code === 'auth/email-already-in-use') {
                console.log('Usuario de prueba ya existe, continuando...');
                // Intentar iniciar sesión con el usuario existente
                return firebaseAuth.signInWithEmailAndPassword(testEmail, testPassword);
            } else {
                console.error('Error al crear usuario de prueba:', error);
            }
        });
}

// Crear perfil completo del usuario de prueba
function createTestUserProfile(userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return Promise.reject('Firestore no disponible');
    
    const userProfile = {
        uid: userId,
        email: 'test@sensus.com',
        firstName: 'Usuario',
        lastName: 'Prueba',
        displayName: 'Usuario de Prueba',
        photoURL: null,
        emailVerified: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        preferences: {
            theme: 'light',
            notifications: true,
            language: 'es',
            timezone: 'Europe/Madrid',
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
            accepted: true,
            acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
            version: '1.0'
        }
    };
    
    return firebaseFirestore.collection('users').doc(userId).set(userProfile);
}

// Poblar datos de prueba
function populateTestData() {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    // Crear algunos resultados de test GAD-7 de ejemplo
    createTestGAD7Results();
    
    // Crear algunas entradas de diario de ejemplo
    createTestJournalEntries();
    
    // Crear algunos insights de ejemplo
    createTestInsights();
}

// Crear resultados de test GAD-7 de prueba
function createTestGAD7Results() {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    const testResults = [
        {
            score: 8,
            level: 'leve',
            date: new Date('2024-01-01'),
            answers: [1, 2, 1, 2, 1, 1, 0],
            interpretation: 'Tu puntuación es 8. Esto indica ansiedad leve. Muchas personas con este nivel mejoran con técnicas de relajación y diario emocional.',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            score: 5,
            level: 'leve',
            date: new Date('2024-01-15'),
            answers: [1, 1, 1, 1, 1, 0, 0],
            interpretation: 'Tu puntuación es 5. Esto indica ansiedad leve. ¡Excelente progreso! Sigue practicando las técnicas de relajación.',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];
    
    // Obtener el UID del usuario actual
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    
    const userId = firebaseAuth.currentUser.uid;
    
    testResults.forEach((result, index) => {
        firebaseFirestore.collection('users').doc(userId).collection('gad7_results').add(result)
            .then(() => {
                console.log(`Resultado de test GAD-7 ${index + 1} creado`);
            })
            .catch((error) => {
                console.error('Error al crear resultado de test:', error);
            });
    });
}

// Crear entradas de diario de prueba
function createTestJournalEntries() {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    const testEntries = [
        {
            text: 'Hoy me siento un poco ansioso por el trabajo, pero he logrado mantener la calma usando las técnicas de respiración.',
            emotion: '😐',
            timestamp: new Date('2024-01-01'),
            encrypted: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            text: 'Me siento mucho mejor hoy. Hice ejercicio y eso me ayudó a relajarme.',
            emotion: '😊',
            timestamp: new Date('2024-01-02'),
            encrypted: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            text: 'Tuve un día difícil, pero recordé usar las técnicas de mindfulness que aprendí.',
            emotion: '😢',
            timestamp: new Date('2024-01-03'),
            encrypted: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];
    
    // Obtener el UID del usuario actual
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    
    const userId = firebaseAuth.currentUser.uid;
    
    testEntries.forEach((entry, index) => {
        firebaseFirestore.collection('users').doc(userId).collection('journal_entries').add(entry)
            .then(() => {
                console.log(`Entrada de diario ${index + 1} creada`);
            })
            .catch((error) => {
                console.error('Error al crear entrada de diario:', error);
            });
    });
}

// Crear insights de prueba
function createTestInsights() {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    const testInsights = [
        {
            type: 'pattern',
            title: 'Patrón de ansiedad detectado',
            description: 'Has mostrado niveles más altos de ansiedad los lunes por la tarde. Te recomendamos practicar técnicas de relajación en ese momento.',
            actionable: true,
            action: 'Activar recordatorio de relajación para los lunes a las 3 PM',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            type: 'achievement',
            title: '¡Excelente progreso!',
            description: 'Has completado 3 días consecutivos de diario emocional. ¡Sigue así!',
            actionable: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
            type: 'recommendation',
            title: 'Recomendación personalizada',
            description: 'Basado en tus entradas, te recomendamos probar la meditación guiada antes de dormir.',
            actionable: true,
            action: 'Explorar meditaciones guiadas',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }
    ];
    
    // Obtener el UID del usuario actual
    const firebaseAuth = FirebaseServices.auth();
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    
    const userId = firebaseAuth.currentUser.uid;
    
    testInsights.forEach((insight, index) => {
        firebaseFirestore.collection('users').doc(userId).collection('insights').add(insight)
            .then(() => {
                console.log(`Insight ${index + 1} creado`);
            })
            .catch((error) => {
                console.error('Error al crear insight:', error);
            });
    });
}

// Función para limpiar datos de prueba (solo para desarrollo)
function clearTestData() {
    const firebaseFirestore = FirebaseServices.firestore();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseFirestore || !firebaseAuth || !firebaseAuth.currentUser) return;
    
    const userId = firebaseAuth.currentUser.uid;
    
    // Eliminar todas las subcolecciones
    const collections = ['gad7_results', 'journal_entries', 'insights', 'settings', 'notifications'];
    
    collections.forEach(collection => {
        firebaseFirestore.collection('users').doc(userId).collection(collection).get()
            .then(snapshot => {
                const batch = firebaseFirestore.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return batch.commit();
            })
            .then(() => {
                console.log(`Colección ${collection} limpiada`);
            })
            .catch(error => {
                console.error(`Error al limpiar ${collection}:`, error);
            });
    });
}

// Exportar funciones para uso global
window.DatabaseSetup = {
    setupDatabase: setupDatabase,
    createTestUser: createTestUser,
    populateTestData: populateTestData,
    clearTestData: clearTestData
};

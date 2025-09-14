// Sensus - Cloud Functions para Firebase

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// Inicializar Firebase Admin
admin.initializeApp();

// Configurar región de Europa
const region = 'europe-west1';

// Función para procesar entradas del diario encriptado
exports.processJournalEntry = functions.region(region).firestore
    .document('users/{userId}/journal_entries/{entryId}')
    .onCreate(async (snap, context) => {
        const entry = snap.data();
        const userId = context.params.userId;
        
        try {
            // Actualizar estadísticas del usuario
            await updateUserStats(userId, 'journal');
            
            // Generar insight basado en la emoción
            if (entry.emotion) {
                const insight = await generateInsight(userId, entry.emotion, entry.timestamp);
                if (insight) {
                    await admin.firestore()
                        .collection('users')
                        .doc(userId)
                        .collection('insights')
                        .add({
                            ...insight,
                            createdAt: admin.firestore.FieldValue.serverTimestamp()
                        });
                }
            }
            
            // Verificar logros
            await checkAchievements(userId, 'journal_entry');
            
            console.log('Journal entry processed successfully');
        } catch (error) {
            console.error('Error processing journal entry:', error);
        }
    });

// Función para procesar resultados de test
exports.processTestResult = functions.firestore
    .document('users/{userId}/testResults/{resultId}')
    .onCreate(async (snap, context) => {
        const result = snap.data();
        const userId = context.params.userId;
        
        try {
            // Actualizar estadísticas del usuario
            await updateUserStats(userId, 'test');
            
            // Analizar tendencias
            await analyzeTrends(userId, result);
            
            // Verificar logros
            await checkAchievements(userId, 'test_completed');
            
            console.log('Test result processed successfully');
        } catch (error) {
            console.error('Error processing test result:', error);
        }
    });

// Función para enviar notificaciones programadas
exports.sendScheduledNotifications = functions.pubsub
    .schedule('0 20 * * *') // Todos los días a las 20:00
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        try {
            // Obtener usuarios que quieren notificaciones
            const usersSnapshot = await admin.firestore()
                .collection('users')
                .where('preferences.notifications', '==', true)
                .get();
            
            const notifications = [];
            
            usersSnapshot.forEach(doc => {
                const user = doc.data();
                const userId = doc.id;
                
                // Verificar si necesita recordatorio del diario
                if (shouldSendDiaryReminder(user)) {
                    notifications.push({
                        userId: userId,
                        type: 'diary_reminder',
                        title: '📝 Recordatorio del Diario',
                        body: 'Es hora de escribir en tu diario emocional. ¿Cómo te sientes hoy?'
                    });
                }
                
                // Verificar si necesita recordatorio de test
                if (shouldSendTestReminder(user)) {
                    notifications.push({
                        userId: userId,
                        type: 'test_reminder',
                        title: '📊 Recordatorio de Test',
                        body: 'Es hora de realizar tu test de ansiedad semanal. ¿Cómo te sientes?'
                    });
                }
            });
            
            // Enviar notificaciones
            for (const notification of notifications) {
                await sendNotificationToUser(notification);
            }
            
            console.log(`Sent ${notifications.length} scheduled notifications`);
        } catch (error) {
            console.error('Error sending scheduled notifications:', error);
        }
    });

// Función para generar reportes semanales
exports.generateWeeklyReports = functions.pubsub
    .schedule('0 9 * * 1') // Todos los lunes a las 9:00
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        try {
            // Obtener usuarios que quieren reportes semanales
            const usersSnapshot = await admin.firestore()
                .collection('users')
                .where('preferences.weeklyReport', '==', true)
                .get();
            
            for (const doc of usersSnapshot.docs) {
                const userId = doc.id;
                const user = doc.data();
                
                // Generar reporte semanal
                const report = await generateWeeklyReport(userId);
                
                // Guardar reporte
                await admin.firestore()
                    .collection('users')
                    .doc(userId)
                    .collection('reports')
                    .add({
                        type: 'weekly',
                        data: report,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                
                // Enviar notificación
                await sendNotificationToUser({
                    userId: userId,
                    type: 'weekly_report',
                    title: '📈 Tu Reporte Semanal',
                    body: 'Tu reporte semanal de bienestar está listo. ¡Revisa tu progreso!'
                });
            }
            
            console.log('Weekly reports generated successfully');
        } catch (error) {
            console.error('Error generating weekly reports:', error);
        }
    });

// Función para limpiar datos antiguos
exports.cleanupOldData = functions.pubsub
    .schedule('0 2 * * 0') // Todos los domingos a las 2:00
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 año
            
            // Limpiar notificaciones antiguas
            const notificationsSnapshot = await admin.firestore()
                .collectionGroup('notifications')
                .where('timestamp', '<', cutoffDate)
                .get();
            
            const batch = admin.firestore().batch();
            notificationsSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            console.log(`Cleaned up ${notificationsSnapshot.docs.length} old notifications`);
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    });

// Función para analizar sentimientos
exports.analyzeSentiment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const { text } = data;
    
    if (!text) {
        throw new functions.https.HttpsError('invalid-argument', 'Text is required');
    }
    
    try {
        const sentiment = await analyzeSentiment(text);
        return { sentiment };
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        throw new functions.https.HttpsError('internal', 'Error analyzing sentiment');
    }
});

// Función para obtener recomendaciones
exports.getRecommendations = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const userId = context.auth.uid;
    const { type } = data;
    
    try {
        const recommendations = await generateRecommendations(userId, type);
        return { recommendations };
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw new functions.https.HttpsError('internal', 'Error generating recommendations');
    }
});

// Función para exportar datos del usuario
exports.exportUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const userId = context.auth.uid;
    
    try {
        const userData = await exportUserData(userId);
        return { data: userData };
    } catch (error) {
        console.error('Error exporting user data:', error);
        throw new functions.https.HttpsError('internal', 'Error exporting user data');
    }
});

// Función para eliminar datos del usuario
exports.deleteUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    const userId = context.auth.uid;
    
    try {
        await deleteUserData(userId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw new functions.https.HttpsError('internal', 'Error deleting user data');
    }
});

// Funciones auxiliares

async function updateUserStats(userId, type) {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    
    if (type === 'diary') {
        stats.totalDiaryEntries = (stats.totalDiaryEntries || 0) + 1;
        stats.lastDiaryEntry = admin.firestore.FieldValue.serverTimestamp();
        
        // Actualizar racha
        await updateStreak(userId, stats);
    } else if (type === 'test') {
        stats.totalTests = (stats.totalTests || 0) + 1;
        stats.lastTestDate = admin.firestore.FieldValue.serverTimestamp();
    }
    
    await userRef.update({ stats });
}

async function updateStreak(userId, stats) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Verificar si ya escribió hoy
    const todayEntry = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('diaryEntries')
        .where('date', '>=', new Date(today.getFullYear(), today.getMonth(), today.getDate()))
        .get();
    
    if (todayEntry.empty) return;
    
    // Verificar si escribió ayer
    const yesterdayEntry = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('diaryEntries')
        .where('date', '>=', new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()))
        .where('date', '<', new Date(today.getFullYear(), today.getMonth(), today.getDate()))
        .get();
    
    if (yesterdayEntry.empty) {
        // Romper racha
        stats.currentStreak = 1;
    } else {
        // Continuar racha
        stats.currentStreak = (stats.currentStreak || 0) + 1;
    }
    
    // Actualizar mejor racha
    if (stats.currentStreak > (stats.longestStreak || 0)) {
        stats.longestStreak = stats.currentStreak;
    }
}

async function analyzeSentiment(text) {
    // Análisis básico de sentimientos
    const positiveWords = ['feliz', 'contento', 'alegre', 'bueno', 'excelente', 'genial', 'maravilloso'];
    const negativeWords = ['triste', 'mal', 'terrible', 'horrible', 'deprimido', 'ansioso', 'preocupado'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) {
        return { score: 0.8, label: 'positive' };
    } else if (negativeCount > positiveCount) {
        return { score: 0.2, label: 'negative' };
    } else {
        return { score: 0.5, label: 'neutral' };
    }
}

async function analyzeTrends(userId, result) {
    // Obtener resultados anteriores
    const previousResults = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('testResults')
        .orderBy('date', 'desc')
        .limit(5)
        .get();
    
    if (previousResults.empty) return;
    
    const scores = previousResults.docs.map(doc => doc.data().score);
    const trend = calculateTrend(scores);
    
    // Guardar análisis de tendencias
    await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('analytics')
        .add({
            type: 'trend_analysis',
            data: { trend, scores },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
}

function calculateTrend(scores) {
    if (scores.length < 2) return 'insufficient_data';
    
    const recent = scores[0];
    const previous = scores[1];
    
    if (recent < previous) return 'improving';
    if (recent > previous) return 'worsening';
    return 'stable';
}

async function checkAchievements(userId, type) {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    const achievements = userData.achievements || [];
    
    const newAchievements = [];
    
    // Verificar logros
    if (type === 'diary_entry' && stats.totalDiaryEntries === 1) {
        newAchievements.push({
            id: 'first_entry',
            name: 'Primera Entrada',
            description: 'Has escrito tu primera entrada en el diario',
            icon: '📝',
            unlockedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    if (type === 'diary_entry' && stats.currentStreak === 7) {
        newAchievements.push({
            id: 'week_streak',
            name: 'Racha de 7 Días',
            description: 'Has escrito en tu diario durante 7 días seguidos',
            icon: '🔥',
            unlockedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    if (type === 'test_completed' && stats.totalTests === 1) {
        newAchievements.push({
            id: 'first_test',
            name: 'Primer Test',
            description: 'Has completado tu primer test de ansiedad',
            icon: '📊',
            unlockedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Agregar nuevos logros
    if (newAchievements.length > 0) {
        await userRef.update({
            achievements: admin.firestore.FieldValue.arrayUnion(...newAchievements)
        });
        
        // Enviar notificaciones de logros
        for (const achievement of newAchievements) {
            await sendNotificationToUser({
                userId: userId,
                type: 'achievement',
                title: '🏆 ¡Nuevo Logro Desbloqueado!',
                body: `Has conseguido: ${achievement.name}. ¡Sigue así!`
            });
        }
    }
}

async function shouldSendDiaryReminder(user) {
    const preferences = user.preferences || {};
    if (!preferences.notifications) return false;
    
    const lastEntry = user.stats?.lastDiaryEntry;
    if (!lastEntry) return true;
    
    const lastEntryDate = lastEntry.toDate();
    const today = new Date();
    const diffTime = today - lastEntryDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 1;
}

async function shouldSendTestReminder(user) {
    const preferences = user.preferences || {};
    if (!preferences.notifications) return false;
    
    const lastTest = user.stats?.lastTestDate;
    if (!lastTest) return true;
    
    const lastTestDate = lastTest.toDate();
    const today = new Date();
    const diffTime = today - lastTestDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 7; // Recordatorio semanal
}

async function sendNotificationToUser(notification) {
    const { userId, type, title, body } = notification;
    
    // Obtener token FCM del usuario
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;
    
    if (!fcmToken) return;
    
    // Crear mensaje
    const message = {
        token: fcmToken,
        notification: {
            title: title,
            body: body
        },
        data: {
            type: type,
            userId: userId
        }
    };
    
    try {
        await admin.messaging().send(message);
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function generateWeeklyReport(userId) {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    
    // Obtener entradas de la semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyEntries = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('diaryEntries')
        .where('date', '>=', weekAgo)
        .get();
    
    // Obtener tests de la semana
    const weeklyTests = await admin.firestore()
        .collection('users')
        .doc(userId)
        .collection('testResults')
        .where('date', '>=', weekAgo)
        .get();
    
    // Calcular métricas
    const totalEntries = weeklyEntries.docs.length;
    const totalTests = weeklyTests.docs.length;
    const averageMood = calculateAverageMood(weeklyEntries.docs);
    
    return {
        period: 'weekly',
        totalEntries,
        totalTests,
        averageMood,
        streak: stats.currentStreak || 0,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
}

function calculateAverageMood(entries) {
    if (entries.length === 0) return 0;
    
    const totalMood = entries.reduce((sum, doc) => {
        return sum + (doc.data().mood || 3);
    }, 0);
    
    return totalMood / entries.length;
}

async function generateRecommendations(userId, type) {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return [];
    
    const userData = userDoc.data();
    const stats = userData.stats || {};
    
    const recommendations = [];
    
    if (type === 'diary' && stats.totalDiaryEntries === 0) {
        recommendations.push({
            type: 'diary',
            title: 'Comienza tu diario',
            description: 'Escribir en tu diario te ayudará a entender mejor tus emociones',
            priority: 'high'
        });
    }
    
    if (type === 'test' && stats.totalTests === 0) {
        recommendations.push({
            type: 'test',
            title: 'Realiza tu primer test',
            description: 'El test de ansiedad te ayudará a conocer tu estado actual',
            priority: 'high'
        });
    }
    
    if (stats.currentStreak >= 7) {
        recommendations.push({
            type: 'achievement',
            title: '¡Excelente racha!',
            description: 'Has mantenido una racha de 7 días. ¡Sigue así!',
            priority: 'medium'
        });
    }
    
    return recommendations;
}

async function exportUserData(userId) {
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) return null;
    
    const userData = userDoc.data();
    
    // Obtener todas las subcolecciones
    const [diaryEntries, testResults, notifications, reports] = await Promise.all([
        userRef.collection('diaryEntries').get(),
        userRef.collection('testResults').get(),
        userRef.collection('notifications').get(),
        userRef.collection('reports').get()
    ]);
    
    return {
        user: userData,
        diaryEntries: diaryEntries.docs.map(doc => doc.data()),
        testResults: testResults.docs.map(doc => doc.data()),
        notifications: notifications.docs.map(doc => doc.data()),
        reports: reports.docs.map(doc => doc.data()),
        exportedAt: new Date().toISOString()
    };
}

async function deleteUserData(userId) {
    const userRef = admin.firestore().collection('users').doc(userId);
    
    // Eliminar todas las subcolecciones
    const subcollections = ['diaryEntries', 'testResults', 'notifications', 'reports', 'analytics'];
    
    for (const subcollection of subcollections) {
        const snapshot = await userRef.collection(subcollection).get();
        const batch = admin.firestore().batch();
        
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    }
    
    // Eliminar documento principal
    await userRef.delete();
    
    console.log(`User data deleted for user: ${userId}`);
}

// Función para generar insights basados en emociones
async function generateInsight(userId, emotion, timestamp) {
    try {
        // Obtener historial de emociones del usuario
        const emotionHistory = await getEmotionHistory(userId, 7); // Últimos 7 días
        
        // Analizar patrones
        const patterns = analyzeEmotionPatterns(emotionHistory, emotion);
        
        // Generar insight basado en patrones
        if (patterns.hasPattern) {
            return {
                type: 'emotion_pattern',
                title: patterns.title,
                description: patterns.description,
                emotion: emotion.value,
                priority: patterns.priority,
                actionable: true
            };
        }
        
        // Insight genérico basado en la emoción actual
        return generateEmotionInsight(emotion);
        
    } catch (error) {
        console.error('Error generating insight:', error);
        return null;
    }
}

// Función para obtener historial de emociones
async function getEmotionHistory(userId, days) {
    const firestore = admin.firestore();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const snapshot = await firestore
        .collection('users')
        .doc(userId)
        .collection('journal_entries')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .get();
    
    return snapshot.docs.map(doc => ({
        emotion: doc.data().emotion,
        timestamp: doc.data().timestamp
    }));
}

// Función para analizar patrones de emociones
function analyzeEmotionPatterns(history, currentEmotion) {
    if (history.length < 3) {
        return { hasPattern: false };
    }
    
    // Contar emociones por día de la semana
    const dayEmotions = {};
    const hourEmotions = {};
    
    history.forEach(entry => {
        const date = entry.timestamp.toDate();
        const dayOfWeek = date.getDay();
        const hour = date.getHours();
        
        if (!dayEmotions[dayOfWeek]) dayEmotions[dayOfWeek] = [];
        if (!hourEmotions[hour]) hourEmotions[hour] = [];
        
        dayEmotions[dayOfWeek].push(entry.emotion.value);
        hourEmotions[hour].push(entry.emotion.value);
    });
    
    // Buscar patrones
    const patterns = [];
    
    // Patrón de día de la semana
    Object.keys(dayEmotions).forEach(day => {
        const emotions = dayEmotions[day];
        const negativeCount = emotions.filter(e => ['sad', 'angry', 'anxious'].includes(e)).length;
        const totalCount = emotions.length;
        
        if (negativeCount / totalCount > 0.7) {
            const dayNames = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            patterns.push({
                type: 'day_pattern',
                day: dayNames[day],
                description: `Tus emociones negativas tienden a aumentar los ${dayNames[day]}s`
            });
        }
    });
    
    // Patrón de hora
    Object.keys(hourEmotions).forEach(hour => {
        const emotions = hourEmotions[hour];
        const anxiousCount = emotions.filter(e => e === 'anxious').length;
        const totalCount = emotions.length;
        
        if (anxiousCount / totalCount > 0.6) {
            patterns.push({
                type: 'time_pattern',
                hour: hour,
                description: `La ansiedad tiende a aparecer alrededor de las ${hour}:00`
            });
        }
    });
    
    if (patterns.length > 0) {
        const pattern = patterns[0];
        return {
            hasPattern: true,
            title: `Patrón detectado: ${pattern.type === 'day_pattern' ? 'Día de la semana' : 'Hora del día'}`,
            description: pattern.description,
            priority: 'medium'
        };
    }
    
    return { hasPattern: false };
}

// Función para generar insight basado en emoción
function generateEmotionInsight(emotion) {
    const insights = {
        happy: {
            title: '¡Momentos positivos!',
            description: 'Es genial que te sientas feliz. Considera escribir sobre qué te está haciendo sentir así para recordarlo en el futuro.',
            priority: 'low'
        },
        sad: {
            title: 'Momentos difíciles',
            description: 'Es normal sentirse triste a veces. Recuerda que estos sentimientos son temporales y que estás siendo valiente al reconocerlos.',
            priority: 'high'
        },
        angry: {
            title: 'Frustración reconocida',
            description: 'La ira puede ser una señal de que algo necesita cambiar. ¿Hay algo específico que te está molestando?',
            priority: 'medium'
        },
        anxious: {
            title: 'Ansiedad presente',
            description: 'La ansiedad puede ser abrumadora. Prueba técnicas de respiración profunda o mindfulness para calmarte.',
            priority: 'high'
        },
        calm: {
            title: 'Estado de calma',
            description: 'Excelente que te sientas tranquilo. Este es un buen momento para practicar técnicas de relajación.',
            priority: 'low'
        },
        tired: {
            title: 'Cansancio mental',
            description: 'El agotamiento mental es real. Considera tomar un descanso o hacer algo que te relaje.',
            priority: 'medium'
        },
        grateful: {
            title: 'Gratitud presente',
            description: 'La gratitud es una emoción poderosa. Mantén este sentimiento y considera compartirlo con alguien.',
            priority: 'low'
        }
    };
    
    return insights[emotion.value] || {
        title: 'Emoción registrada',
        description: 'Has registrado tu emoción. Continuar con el diario te ayudará a entender mejor tus patrones emocionales.',
        priority: 'low'
    };
}

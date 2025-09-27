/*
 * Sensus - Servicios de Firebase
 * Módulo completo para manejo de datos con Firebase Firestore
 * Incluye: usuarios, diario, evaluaciones, ejercicios, estadísticas
 */

class FirebaseServices {
    constructor() {
        this.db = null;
        this.auth = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Esperar a que Firebase esté disponible
            if (typeof firebase === 'undefined') {
                console.error('Firebase no está cargado');
                return false;
            }

            // Obtener servicios de Firebase
            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // Configurar listener de autenticación
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                if (user) {
                    console.log('Usuario autenticado:', user.uid);
                    this.initializeUserData(user);
                } else {
                    console.log('Usuario no autenticado');
                }
            });

            console.log('✅ Firebase Services inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase Services:', error);
            return false;
        }
    }

    // === USUARIOS ===
    async createUserProfile(user) {
        try {
            const userProfile = {
                uid: user.uid,
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

            await this.db.collection('users').doc(user.uid).set(userProfile);
            console.log('✅ Perfil de usuario creado');
            return userProfile;
        } catch (error) {
            console.error('❌ Error creando perfil de usuario:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo perfil de usuario:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, updates) {
        try {
            await this.db.collection('users').doc(userId).update({
                ...updates,
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Perfil de usuario actualizado');
        } catch (error) {
            console.error('❌ Error actualizando perfil de usuario:', error);
            throw error;
        }
    }

    // === DIARIO DE BIENESTAR ===
    async saveDiaryEntry(entryData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const entry = {
                userId: this.currentUser.uid,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                mood: entryData.mood,
                content: entryData.content,
                exercise: entryData.exercise || 'none',
                wordCount: entryData.content.split(' ').length,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                tags: entryData.tags || [],
                isPrivate: entryData.isPrivate || false
            };

            const docRef = await this.db.collection('diary_entries').add(entry);
            
            // Actualizar estadísticas del usuario
            await this.updateUserStats('diary_entries', 1);
            
            console.log('✅ Entrada del diario guardada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando entrada del diario:', error);
            throw error;
        }
    }

    async getDiaryEntries(limit = 50, startAfter = null) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            let query = this.db.collection('diary_entries')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.get();
            const entries = [];
            
            snapshot.forEach(doc => {
                entries.push({ id: doc.id, ...doc.data() });
            });

            return entries;
        } catch (error) {
            console.error('❌ Error obteniendo entradas del diario:', error);
            throw error;
        }
    }

    async updateDiaryEntry(entryId, updates) {
        try {
            await this.db.collection('diary_entries').doc(entryId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Entrada del diario actualizada');
        } catch (error) {
            console.error('❌ Error actualizando entrada del diario:', error);
            throw error;
        }
    }

    async deleteDiaryEntry(entryId) {
        try {
            await this.db.collection('diary_entries').doc(entryId).delete();
            console.log('✅ Entrada del diario eliminada');
        } catch (error) {
            console.error('❌ Error eliminando entrada del diario:', error);
            throw error;
        }
    }

    // === EVALUACIONES/TESTS ===
    async saveEvaluation(evaluationData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const evaluation = {
                userId: this.currentUser.uid,
                testType: evaluationData.testType,
                testName: evaluationData.testName,
                score: evaluationData.score,
                maxScore: evaluationData.maxScore,
                answers: evaluationData.answers,
                result: evaluationData.result,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                duration: evaluationData.duration || 0,
                isAnonymous: evaluationData.isAnonymous || false
            };

            const docRef = await this.db.collection('evaluations').add(evaluation);
            
            // Actualizar estadísticas del usuario
            await this.updateUserStats('totalTests', 1);
            await this.updateUserStats('lastTestDate', evaluation.completedAt);
            
            console.log('✅ Evaluación guardada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando evaluación:', error);
            throw error;
        }
    }

    async getEvaluations(limit = 50, startAfter = null) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            let query = this.db.collection('evaluations')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('completedAt', 'desc')
                .limit(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.get();
            const evaluations = [];
            
            snapshot.forEach(doc => {
                evaluations.push({ id: doc.id, ...doc.data() });
            });

            return evaluations;
        } catch (error) {
            console.error('❌ Error obteniendo evaluaciones:', error);
            throw error;
        }
    }

    async getEvaluationsByType(testType, limit = 10) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const snapshot = await this.db.collection('evaluations')
                .where('userId', '==', this.currentUser.uid)
                .where('testType', '==', testType)
                .orderBy('completedAt', 'desc')
                .limit(limit)
                .get();

            const evaluations = [];
            snapshot.forEach(doc => {
                evaluations.push({ id: doc.id, ...doc.data() });
            });

            return evaluations;
        } catch (error) {
            console.error('❌ Error obteniendo evaluaciones por tipo:', error);
            throw error;
        }
    }

    // === SESIONES DE EJERCICIOS ===
    async saveExerciseSession(sessionData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const session = {
                userId: this.currentUser.uid,
                exerciseType: sessionData.exerciseType,
                duration: sessionData.duration,
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                moodBefore: sessionData.moodBefore || null,
                moodAfter: sessionData.moodAfter || null,
                notes: sessionData.notes || '',
                effectiveness: sessionData.effectiveness || null
            };

            const docRef = await this.db.collection('exercise_sessions').add(session);
            
            // Actualizar estadísticas del usuario
            await this.updateUserStats('totalTimeSpent', sessionData.duration);
            
            console.log('✅ Sesión de ejercicio guardada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando sesión de ejercicio:', error);
            throw error;
        }
    }

    async getExerciseSessions(limit = 50, startAfter = null) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            let query = this.db.collection('exercise_sessions')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('completedAt', 'desc')
                .limit(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.get();
            const sessions = [];
            
            snapshot.forEach(doc => {
                sessions.push({ id: doc.id, ...doc.data() });
            });

            return sessions;
        } catch (error) {
            console.error('❌ Error obteniendo sesiones de ejercicio:', error);
            throw error;
        }
    }

    // === ESTADÍSTICAS ===
    async updateUserStats(field, value) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const updateData = {};
            
            if (typeof value === 'number') {
                updateData[`stats.${field}`] = firebase.firestore.FieldValue.increment(value);
            } else {
                updateData[`stats.${field}`] = value;
            }

            await this.db.collection('users').doc(this.currentUser.uid).update(updateData);
            console.log('✅ Estadísticas de usuario actualizadas');
        } catch (error) {
            console.error('❌ Error actualizando estadísticas:', error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
            if (doc.exists) {
                return doc.data().stats;
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }

    async calculateStreak() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            // Obtener entradas del diario de los últimos 30 días
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const snapshot = await this.db.collection('diary_entries')
                .where('userId', '==', this.currentUser.uid)
                .where('createdAt', '>=', thirtyDaysAgo)
                .orderBy('createdAt', 'desc')
                .get();

            const entries = [];
            snapshot.forEach(doc => {
                entries.push(doc.data());
            });

            // Calcular racha
            let streak = 0;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < entries.length; i++) {
                const entryDate = entries[i].createdAt.toDate();
                entryDate.setHours(0, 0, 0, 0);
                
                const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff === streak) {
                    streak++;
                } else {
                    break;
                }
            }

            // Actualizar racha en el perfil
            await this.updateUserStats('currentStreak', streak);
            
            return streak;
        } catch (error) {
            console.error('❌ Error calculando racha:', error);
            throw error;
        }
    }

    // === SEGUIMIENTO DE ANSIEDAD ===
    async saveAnxietyLevel(anxietyData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const anxietyEntry = {
                userId: this.currentUser.uid,
                level: anxietyData.level,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                timestamp: anxietyData.timestamp || Date.now(),
                notes: anxietyData.notes || '',
                context: anxietyData.context || 'general',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('anxiety_levels').add(anxietyEntry);
            
            // Actualizar estadísticas del usuario
            await this.updateUserStats('averageMood', anxietyData.level);
            
            console.log('✅ Nivel de ansiedad guardado:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando nivel de ansiedad:', error);
            throw error;
        }
    }

    async getAnxietyLevels(limit = 30, startAfter = null) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            let query = this.db.collection('anxiety_levels')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(limit);

            if (startAfter) {
                query = query.startAfter(startAfter);
            }

            const snapshot = await query.get();
            const levels = [];
            
            snapshot.forEach(doc => {
                levels.push({ id: doc.id, ...doc.data() });
            });

            return levels;
        } catch (error) {
            console.error('❌ Error obteniendo niveles de ansiedad:', error);
            throw error;
        }
    }

    // === PLAN PERSONALIZADO ===
    async savePersonalizedPlan(planData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const plan = {
                userId: this.currentUser.uid,
                anxietyLevel: planData.anxietyLevel,
                planType: planData.planType,
                weeklyGoal: planData.weeklyGoal,
                recommendations: planData.recommendations,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            };

            // Verificar si ya existe un plan activo
            const existingPlan = await this.db.collection('personalized_plans')
                .where('userId', '==', this.currentUser.uid)
                .where('isActive', '==', true)
                .get();

            if (!existingPlan.empty) {
                // Desactivar plan anterior
                const batch = this.db.batch();
                existingPlan.forEach(doc => {
                    batch.update(doc.ref, { isActive: false });
                });
                await batch.commit();
            }

            const docRef = await this.db.collection('personalized_plans').add(plan);
            
            console.log('✅ Plan personalizado guardado:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando plan personalizado:', error);
            throw error;
        }
    }

    async getPersonalizedPlan() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const snapshot = await this.db.collection('personalized_plans')
                .where('userId', '==', this.currentUser.uid)
                .where('isActive', '==', true)
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('❌ Error obteniendo plan personalizado:', error);
            throw error;
        }
    }

    // === ACTIVIDADES DIARIAS ===
    async saveDailyActivity(activityData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const activity = {
                userId: this.currentUser.uid,
                activityId: activityData.activityId,
                title: activityData.title,
                description: activityData.description,
                duration: activityData.duration,
                priority: activityData.priority,
                completed: activityData.completed,
                completedAt: activityData.completed ? firebase.firestore.FieldValue.serverTimestamp() : null,
                date: activityData.date,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            const docRef = await this.db.collection('daily_activities').add(activity);
            
            console.log('✅ Actividad diaria guardada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error guardando actividad diaria:', error);
            throw error;
        }
    }

    async getDailyActivities(date) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const snapshot = await this.db.collection('daily_activities')
                .where('userId', '==', this.currentUser.uid)
                .where('date', '>=', startOfDay)
                .where('date', '<=', endOfDay)
                .orderBy('date', 'asc')
                .get();

            const activities = [];
            snapshot.forEach(doc => {
                activities.push({ id: doc.id, ...doc.data() });
            });

            return activities;
        } catch (error) {
            console.error('❌ Error obteniendo actividades diarias:', error);
            throw error;
        }
    }

    // === NOTIFICACIONES ===
    async createNotification(notificationData) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const notification = {
                userId: this.currentUser.uid,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                read: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                scheduledFor: notificationData.scheduledFor || null,
                actionUrl: notificationData.actionUrl || null
            };

            const docRef = await this.db.collection('notifications').add(notification);
            console.log('✅ Notificación creada:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error creando notificación:', error);
            throw error;
        }
    }

    async getNotifications(limit = 20) {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            const snapshot = await this.db.collection('notifications')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();

            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });

            return notifications;
        } catch (error) {
            console.error('❌ Error obteniendo notificaciones:', error);
            throw error;
        }
    }

    async markNotificationAsRead(notificationId) {
        try {
            await this.db.collection('notifications').doc(notificationId).update({
                read: true
            });
            console.log('✅ Notificación marcada como leída');
        } catch (error) {
            console.error('❌ Error marcando notificación como leída:', error);
            throw error;
        }
    }

    // === UTILIDADES ===
    async initializeUserData(user) {
        try {
            // Verificar si el usuario ya tiene un perfil
            const userProfile = await this.getUserProfile(user.uid);
            
            if (!userProfile) {
                // Crear perfil si no existe
                await this.createUserProfile(user);
            } else {
                // Actualizar último login
                await this.updateUserProfile(user.uid, {
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Calcular racha actual
            await this.calculateStreak();
            
            console.log('✅ Datos de usuario inicializados');
        } catch (error) {
            console.error('❌ Error inicializando datos de usuario:', error);
        }
    }

    // Método para migrar datos de localStorage a Firebase
    async migrateLocalStorageData() {
        try {
            if (!this.currentUser) {
                throw new Error('Usuario no autenticado');
            }

            // Migrar entradas del diario
            const diaryData = localStorage.getItem('diaryWellness');
            if (diaryData) {
                const parsed = JSON.parse(diaryData);
                if (parsed.entries && parsed.entries.length > 0) {
                    for (const entry of parsed.entries) {
                        await this.saveDiaryEntry({
                            mood: entry.mood,
                            content: entry.content,
                            exercise: entry.exercise || 'none',
                            isPrivate: false
                        });
                    }
                    console.log('✅ Entradas del diario migradas');
                }
            }

            // Migrar resultados de tests
            const testResults = localStorage.getItem('testResults');
            if (testResults) {
                const parsed = JSON.parse(testResults);
                if (parsed.length > 0) {
                    for (const test of parsed) {
                        await this.saveEvaluation({
                            testType: test.testType || 'gad7',
                            testName: test.testType === 'gad7' ? 'Test GAD-7' : 'Test',
                            score: test.score,
                            maxScore: test.testType === 'gad7' ? 21 : 10,
                            answers: test.answers,
                            result: test.result,
                            duration: 0
                        });
                    }
                    console.log('✅ Resultados de tests migrados');
                }
            }

            // Limpiar localStorage después de la migración
            localStorage.removeItem('diaryWellness');
            localStorage.removeItem('testResults');
            
            console.log('✅ Migración completada');
        } catch (error) {
            console.error('❌ Error en migración:', error);
            throw error;
        }
    }
}

// Inicializar servicios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase esté disponible
    const initServices = () => {
        if (typeof firebase !== 'undefined') {
            window.firebaseServices = new FirebaseServices();
        } else {
            setTimeout(initServices, 100);
        }
    };
    
    initServices();
});

// Exportar para uso global
window.FirebaseServices = FirebaseServices;

// Exportar por defecto para módulos ES6
export default FirebaseServices;
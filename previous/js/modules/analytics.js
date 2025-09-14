// Sensus - Módulo de Analytics con Firebase

document.addEventListener('DOMContentLoaded', function() {
    initAnalyticsModule();
});

function initAnalyticsModule() {
    // Verificar si Firebase está disponible
    if (typeof FirebaseServices === 'undefined') {
        console.error('FirebaseServices no está disponible');
        return;
    }
    
    const firebaseAnalytics = FirebaseServices.analytics();
    const firebaseFirestore = FirebaseServices.firestore();
    
    if (!firebaseAnalytics || !firebaseFirestore) {
        console.error('Servicios de Firebase no disponibles');
        return;
    }
    
    console.log('Módulo de Analytics inicializado correctamente');
    
    // Configurar analytics
    setupAnalytics();
}

// Configurar analytics
function setupAnalytics() {
    const firebaseAnalytics = FirebaseServices.analytics();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseAnalytics || !firebaseAuth) return;
    
    // Escuchar cambios en el estado de autenticación
    firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            // Establecer ID de usuario
            firebaseAnalytics.setUserId(user.uid);
            
            // Establecer propiedades de usuario
            firebaseAnalytics.setUserProperties({
                user_type: 'registered',
                signup_method: 'email'
            });
        } else {
            // Limpiar ID de usuario
            firebaseAnalytics.setUserId(null);
        }
    });
}

// Trackear evento personalizado
function trackEvent(eventName, parameters = {}) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    // Agregar timestamp
    const eventParams = {
        ...parameters,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    };
    
    firebaseAnalytics.logEvent(eventName, eventParams);
    console.log('Evento trackeado:', eventName, eventParams);
}

// Trackear página vista
function trackPageView(pageName, pageTitle = null) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    firebaseAnalytics.logEvent('page_view', {
        page_name: pageName,
        page_title: pageTitle || document.title,
        page_location: window.location.href
    });
}

// Trackear inicio de sesión
function trackLogin(method) {
    trackEvent('login', {
        method: method
    });
}

// Trackear registro
function trackSignUp(method) {
    trackEvent('sign_up', {
        method: method
    });
}

// Trackear entrada del diario
function trackDiaryEntry(mood, wordCount) {
    trackEvent('diary_entry_created', {
        mood: mood,
        word_count: wordCount
    });
}

// Trackear test completado
function trackTestCompleted(testType, score) {
    trackEvent('test_completed', {
        test_type: testType,
        score: score
    });
}

// Trackear tiempo en página
function trackTimeOnPage(pageName, timeSpent) {
    trackEvent('time_on_page', {
        page_name: pageName,
        time_spent: timeSpent
    });
}

// Trackear conversión
function trackConversion(conversionType, value = null) {
    const params = {
        conversion_type: conversionType
    };
    
    if (value !== null) {
        params.value = value;
    }
    
    trackEvent('conversion', params);
}

// Trackear error
function trackError(errorType, errorMessage, errorCode = null) {
    const params = {
        error_type: errorType,
        error_message: errorMessage
    };
    
    if (errorCode) {
        params.error_code = errorCode;
    }
    
    trackEvent('error', params);
}

// Trackear engagement
function trackEngagement(action, target) {
    trackEvent('engagement', {
        action: action,
        target: target
    });
}

// Trackear funnel
function trackFunnelStep(step, stepName, value = null) {
    const params = {
        step: step,
        step_name: stepName
    };
    
    if (value !== null) {
        params.value = value;
    }
    
    trackEvent('funnel_step', params);
}

// Trackear retención
function trackRetention(daysSinceFirstUse, daysSinceLastUse) {
    trackEvent('retention', {
        days_since_first_use: daysSinceFirstUse,
        days_since_last_use: daysSinceLastUse
    });
}

// Trackear feature usage
function trackFeatureUsage(featureName, usageCount = 1) {
    trackEvent('feature_usage', {
        feature_name: featureName,
        usage_count: usageCount
    });
}

// Trackear performance
function trackPerformance(metricName, value, unit = 'ms') {
    trackEvent('performance', {
        metric_name: metricName,
        value: value,
        unit: unit
    });
}

// Trackear custom event
function trackCustomEvent(eventName, parameters = {}) {
    trackEvent(eventName, parameters);
}

// Configurar propiedades de usuario
function setUserProperties(properties) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    firebaseAnalytics.setUserProperties(properties);
}

// Configurar ID de usuario
function setUserId(userId) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    firebaseAnalytics.setUserId(userId);
}

// Configurar propiedades de sesión
function setSessionProperties(properties) {
    const firebaseAnalytics = FirebaseServices.analytics();
    if (!firebaseAnalytics) return;
    
    firebaseAnalytics.setSessionProperties(properties);
}

// Obtener analytics personalizados
function getCustomAnalytics() {
    const firebaseFirestore = FirebaseServices.firestore();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseFirestore || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    return firebaseFirestore.collection('analytics').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                return doc.data();
            } else {
                return null;
            }
        });
}

// Guardar analytics personalizados
function saveCustomAnalytics(data) {
    const firebaseFirestore = FirebaseServices.firestore();
    const firebaseAuth = FirebaseServices.auth();
    
    if (!firebaseFirestore || !firebaseAuth) return Promise.reject('Servicios no disponibles');
    
    const user = firebaseAuth.currentUser;
    if (!user) return Promise.reject('Usuario no autenticado');
    
    return firebaseFirestore.collection('analytics').doc(user.uid).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
}

// Trackear evento de bienestar
function trackWellbeingEvent(eventType, data) {
    trackEvent('wellbeing_event', {
        event_type: eventType,
        ...data
    });
}

// Trackear progreso del usuario
function trackUserProgress(metric, value, previousValue = null) {
    const params = {
        metric: metric,
        value: value
    };
    
    if (previousValue !== null) {
        params.previous_value = previousValue;
        params.improvement = value - previousValue;
    }
    
    trackEvent('user_progress', params);
}

// Trackear interacción con contenido
function trackContentInteraction(contentType, contentId, action) {
    trackEvent('content_interaction', {
        content_type: contentType,
        content_id: contentId,
        action: action
    });
}

// Trackear búsqueda
function trackSearch(searchTerm, resultsCount) {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
}

// Trackear descarga
function trackDownload(fileType, fileName) {
    trackEvent('download', {
        file_type: fileType,
        file_name: fileName
    });
}

// Trackear compartir
function trackShare(contentType, contentId, method) {
    trackEvent('share', {
        content_type: contentType,
        content_id: contentId,
        method: method
    });
}

// Trackear feedback
function trackFeedback(feedbackType, rating, comment = null) {
    const params = {
        feedback_type: feedbackType,
        rating: rating
    };
    
    if (comment) {
        params.comment = comment;
    }
    
    trackEvent('feedback', params);
}

// Trackear tutorial
function trackTutorial(step, completed = false) {
    trackEvent('tutorial', {
        step: step,
        completed: completed
    });
}

// Trackear onboarding
function trackOnboarding(step, completed = false) {
    trackEvent('onboarding', {
        step: step,
        completed: completed
    });
}

// Trackear configuración
function trackSettingsChange(settingName, oldValue, newValue) {
    trackEvent('settings_change', {
        setting_name: settingName,
        old_value: oldValue,
        new_value: newValue
    });
}

// Trackear notificación
function trackNotification(notificationType, action) {
    trackEvent('notification', {
        notification_type: notificationType,
        action: action
    });
}

// Trackear error de API
function trackAPIError(endpoint, statusCode, errorMessage) {
    trackEvent('api_error', {
        endpoint: endpoint,
        status_code: statusCode,
        error_message: errorMessage
    });
}

// Trackear tiempo de carga
function trackLoadTime(pageName, loadTime) {
    trackEvent('load_time', {
        page_name: pageName,
        load_time: loadTime
    });
}

// Trackear uso de feature
function trackFeatureUsage(featureName, duration = null) {
    const params = {
        feature_name: featureName
    };
    
    if (duration !== null) {
        params.duration = duration;
    }
    
    trackEvent('feature_usage', params);
}

// Trackear abandono
function trackAbandonment(step, reason = null) {
    const params = {
        step: step
    };
    
    if (reason) {
        params.reason = reason;
    }
    
    trackEvent('abandonment', params);
}

// Trackear re-engagement
function trackReengagement(daysSinceLastUse) {
    trackEvent('reengagement', {
        days_since_last_use: daysSinceLastUse
    });
}

// Exportar funciones para uso global
window.Analytics = {
    trackEvent: trackEvent,
    trackPageView: trackPageView,
    trackLogin: trackLogin,
    trackSignUp: trackSignUp,
    trackDiaryEntry: trackDiaryEntry,
    trackTestCompleted: trackTestCompleted,
    trackTimeOnPage: trackTimeOnPage,
    trackConversion: trackConversion,
    trackError: trackError,
    trackEngagement: trackEngagement,
    trackFunnelStep: trackFunnelStep,
    trackRetention: trackRetention,
    trackFeatureUsage: trackFeatureUsage,
    trackPerformance: trackPerformance,
    trackCustomEvent: trackCustomEvent,
    setUserProperties: setUserProperties,
    setUserId: setUserId,
    setSessionProperties: setSessionProperties,
    getCustomAnalytics: getCustomAnalytics,
    saveCustomAnalytics: saveCustomAnalytics,
    trackWellbeingEvent: trackWellbeingEvent,
    trackUserProgress: trackUserProgress,
    trackContentInteraction: trackContentInteraction,
    trackSearch: trackSearch,
    trackDownload: trackDownload,
    trackShare: trackShare,
    trackFeedback: trackFeedback,
    trackTutorial: trackTutorial,
    trackOnboarding: trackOnboarding,
    trackSettingsChange: trackSettingsChange,
    trackNotification: trackNotification,
    trackAPIError: trackAPIError,
    trackLoadTime: trackLoadTime,
    trackAbandonment: trackAbandonment,
    trackReengagement: trackReengagement
};

// Sensus - Módulo de test de ansiedad GAD-7

document.addEventListener('DOMContentLoaded', function() {
    initTestModule();
});

function initTestModule() {
    const testForm = document.getElementById('gad7-form');
    const resultsSection = document.getElementById('results-section');
    const resultScore = document.getElementById('result-score');
    const resultLevel = document.getElementById('result-level');
    const resultDescription = document.getElementById('result-description');
    const resultRecommendations = document.getElementById('result-recommendations');
    const saveResultBtn = document.getElementById('save-result-btn');
    const previousResultsContainer = document.getElementById('previous-results-container');
    
    if (!testForm) return;
    
    // Manejar envío del formulario de test
    testForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Calcular puntuación
        const score = calculateGAD7Score();
        
        // Mostrar resultados
        displayResults(score);
        
        // Mostrar sección de resultados
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            // Desplazar a la sección de resultados
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    // Guardar resultado en Firebase
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', function() {
            const score = parseInt(resultScore.textContent || '0');
            saveTestResult(score);
        });
    }
    
    // Cargar resultados anteriores
    loadPreviousResults();
}

// Calcular puntuación del test GAD-7
function calculateGAD7Score() {
    let totalScore = 0;
    
    // Recorrer todas las preguntas del test
    for (let i = 1; i <= 7; i++) {
        const selectedOption = document.querySelector(`input[name="q${i}"]:checked`);
        
        if (selectedOption) {
            totalScore += parseInt(selectedOption.value);
        }
    }
    
    return totalScore;
}

// Mostrar resultados del test
function displayResults(score) {
    const resultScore = document.getElementById('result-score');
    const resultLevel = document.getElementById('result-level');
    const resultDescription = document.getElementById('result-description');
    const resultRecommendations = document.getElementById('result-recommendations');
    
    if (!resultScore || !resultLevel || !resultDescription || !resultRecommendations) return;
    
    // Mostrar puntuación
    resultScore.textContent = score;
    
    // Determinar nivel de ansiedad y recomendaciones
    let level, description, recommendations;
    
    if (score >= 0 && score <= 4) {
        level = 'Mínima';
        description = 'Tu nivel de ansiedad es mínimo. Esto sugiere que actualmente no estás experimentando síntomas significativos de ansiedad.';
        recommendations = 'Continúa con tus actividades diarias normales y mantén hábitos saludables como ejercicio regular, alimentación balanceada y descanso adecuado.';
    } else if (score >= 5 && score <= 9) {
        level = 'Leve';
        description = 'Tu nivel de ansiedad es leve. Estás experimentando algunos síntomas de ansiedad que podrían beneficiarse de atención.';
        recommendations = 'Considera incorporar técnicas de relajación como meditación o respiración profunda. Mantén un diario emocional para identificar desencadenantes. Si los síntomas persisten, consulta con un profesional.';
    } else if (score >= 10 && score <= 14) {
        level = 'Moderada';
        description = 'Tu nivel de ansiedad es moderado. Tus síntomas podrían estar afectando tu calidad de vida y funcionamiento diario.';
        recommendations = 'Te recomendamos buscar apoyo profesional. Un terapeuta puede ayudarte a desarrollar estrategias efectivas para manejar tu ansiedad. Mientras tanto, prioriza el autocuidado y considera técnicas de manejo del estrés.';
    } else {
        level = 'Severa';
        description = 'Tu nivel de ansiedad es severo. Tus síntomas requieren atención profesional.';
        recommendations = 'Te recomendamos buscar ayuda profesional lo antes posible. Un psicólogo o psiquiatra puede proporcionarte el tratamiento adecuado. No dudes en hablar con alguien de confianza sobre lo que estás experimentando.';
    }
    
    // Actualizar elementos del DOM
    resultLevel.textContent = level;
    resultDescription.textContent = description;
    resultRecommendations.textContent = recommendations;
}

// Guardar resultado del test en Firebase
function saveTestResult(score) {
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado, mostrar modal de autenticación
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.add('active');
            showAuthTab('login');
            alert('Por favor, inicia sesión para guardar tus resultados.');
        }
        return;
    }
    
    // Referencia a la colección de resultados del usuario
    const resultsRef = firebase.firestore().collection('users').doc(user.uid).collection('testResults');
    
    // Crear nuevo documento con el resultado
    resultsRef.add({
        test: 'GAD-7',
        score: score,
        date: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(function() {
        alert('Resultado guardado correctamente.');
        // Recargar resultados anteriores
        loadPreviousResults();
    })
    .catch(function(error) {
        console.error('Error al guardar el resultado:', error);
        alert('Error al guardar el resultado. Por favor, inténtalo de nuevo.');
    });
}

// Cargar resultados anteriores desde Firebase
function loadPreviousResults() {
    const previousResultsContainer = document.getElementById('previous-results-container');
    const previousResultsList = document.getElementById('previous-results-list');
    const noPreviousResults = document.getElementById('no-previous-results');
    
    if (!previousResultsContainer || !previousResultsList || !noPreviousResults) return;
    
    // Verificar si el usuario está autenticado
    const user = firebase.auth().currentUser;
    
    if (!user) {
        // Usuario no autenticado, ocultar sección de resultados anteriores
        previousResultsContainer.classList.add('hidden');
        return;
    }
    
    // Mostrar sección de resultados anteriores
    previousResultsContainer.classList.remove('hidden');
    
    // Referencia a la colección de resultados del usuario
    const resultsRef = firebase.firestore().collection('users').doc(user.uid).collection('testResults');
    
    // Obtener resultados ordenados por fecha (más recientes primero)
    resultsRef.where('test', '==', 'GAD-7')
        .orderBy('date', 'desc')
        .limit(5)
        .get()
        .then(function(querySnapshot) {
            // Limpiar lista de resultados anteriores
            previousResultsList.innerHTML = '';
            
            if (querySnapshot.empty) {
                // No hay resultados anteriores
                noPreviousResults.classList.remove('hidden');
                previousResultsList.classList.add('hidden');
                return;
            }
            
            // Hay resultados anteriores
            noPreviousResults.classList.add('hidden');
            previousResultsList.classList.remove('hidden');
            
            // Agregar cada resultado a la lista
            querySnapshot.forEach(function(doc) {
                const data = doc.data();
                const score = data.score;
                const date = data.date ? data.date.toDate() : new Date();
                const formattedDate = date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                // Determinar nivel de ansiedad
                let level;
                if (score >= 0 && score <= 4) {
                    level = 'Mínima';
                } else if (score >= 5 && score <= 9) {
                    level = 'Leve';
                } else if (score >= 10 && score <= 14) {
                    level = 'Moderada';
                } else {
                    level = 'Severa';
                }
                
                // Crear elemento de lista
                const listItem = document.createElement('li');
                listItem.className = 'previous-result-item';
                listItem.innerHTML = `
                    <div class="result-date">${formattedDate}</div>
                    <div class="result-info">
                        <span class="result-score">Puntuación: ${score}</span>
                        <span class="result-level">Nivel: ${level}</span>
                    </div>
                `;
                
                // Agregar elemento a la lista
                previousResultsList.appendChild(listItem);
            });
        })
        .catch(function(error) {
            console.error('Error al cargar resultados anteriores:', error);
            noPreviousResults.textContent = 'Error al cargar resultados anteriores.';
            noPreviousResults.classList.remove('hidden');
            previousResultsList.classList.add('hidden');
        });
}

// Mostrar pestaña de autenticación
function showAuthTab(tab) {
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (!loginTab || !registerTab || !loginForm || !registerForm) return;
    
    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    }
}
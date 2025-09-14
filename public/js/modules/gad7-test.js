// Sensus - Test GAD-7 (Generalized Anxiety Disorder 7-item scale)
// Basado en Spitzer et al., 2006

const GAD7_QUESTIONS = [
    {
        id: 1,
        question: "Sentirse nervioso, ansioso o muy alterado",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 2,
        question: "No poder parar o controlar la preocupación",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 3,
        question: "Preocuparse demasiado por diferentes cosas",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 4,
        question: "Dificultad para relajarse",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 5,
        question: "Estar tan inquieto que es difícil quedarse quieto",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 6,
        question: "Molestarse o irritarse fácilmente",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    },
    {
        id: 7,
        question: "Sentir miedo como si algo terrible fuera a pasar",
        options: [
            { value: 0, text: "No en absoluto" },
            { value: 1, text: "Un poco" },
            { value: 2, text: "Bastante" },
            { value: 3, text: "Extremadamente" }
        ]
    }
];

// Función para calcular el nivel de ansiedad
function calculateAnxietyLevel(score) {
    if (score >= 0 && score <= 4) {
        return {
            level: "normal",
            label: "Normal",
            description: "No hay indicios significativos de ansiedad",
            color: "#4CAF50",
            recommendations: [
                "Mantén tus hábitos saludables actuales",
                "Practica técnicas de relajación regularmente",
                "Considera el diario emocional para el autoconocimiento"
            ]
        };
    } else if (score >= 5 && score <= 9) {
        return {
            level: "leve",
            label: "Leve",
            description: "Ansiedad leve que puede beneficiarse de técnicas de manejo",
            color: "#FF9800",
            recommendations: [
                "Practica respiración profunda diariamente",
                "Mantén un diario emocional",
                "Considera técnicas de mindfulness",
                "Mantén una rutina de sueño regular"
            ]
        };
    } else if (score >= 10 && score <= 14) {
        return {
            level: "moderada",
            label: "Moderada",
            description: "Ansiedad moderada que requiere atención y posible apoyo profesional",
            color: "#FF5722",
            recommendations: [
                "Busca apoyo de un profesional de salud mental",
                "Practica técnicas de relajación avanzadas",
                "Mantén un diario detallado de tus emociones",
                "Considera terapia cognitivo-conductual",
                "Evita la cafeína y el alcohol"
            ]
        };
    } else {
        return {
            level: "severa",
            label: "Severa",
            description: "Ansiedad severa que requiere atención profesional inmediata",
            color: "#F44336",
            recommendations: [
                "Busca ayuda profesional inmediatamente",
                "Considera terapia y posible medicación",
                "Mantén un diario para identificar patrones",
                "Practica técnicas de crisis de ansiedad",
                "No dudes en contactar servicios de emergencia si es necesario"
            ]
        };
    }
}

// Función para generar interpretación personalizada
function generatePersonalizedInterpretation(score, level, previousScore = null) {
    let interpretation = `Tu puntuación es ${score}. Esto indica ansiedad ${level.label.toLowerCase()}. `;
    
    if (previousScore !== null) {
        const change = score - previousScore;
        if (change > 0) {
            interpretation += `Tu ansiedad ha aumentado ${change} puntos desde la última vez. `;
        } else if (change < 0) {
            interpretation += `¡Excelente! Tu ansiedad ha disminuido ${Math.abs(change)} puntos. `;
        } else {
            interpretation += `Tu nivel de ansiedad se mantiene igual. `;
        }
    }
    
    interpretation += level.description;
    
    return interpretation;
}

// Función para guardar resultado en Firestore
async function saveGAD7Result(score, level, answers, userId) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) throw new Error('Firestore no disponible');
    
    const result = {
        score: score,
        level: level.level,
        levelLabel: level.label,
        answers: answers,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
    };
    
    try {
        await firebaseFirestore.collection('users').doc(userId).collection('gad7_results').add(result);
        
        // Actualizar estadísticas del usuario
        await updateUserStats(userId, 'gad7', score);
        
        // Trackear evento de analytics
        if (window.Analytics) {
            window.Analytics.trackEvent('test_completed', {
                test_type: 'gad7',
                score: score,
                level: level.level
            });
        }
        
        return result;
    } catch (error) {
        console.error('Error guardando resultado GAD-7:', error);
        throw error;
    }
}

// Función para actualizar estadísticas del usuario
async function updateUserStats(userId, type, value) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return;
    
    const userRef = firebaseFirestore.collection('users').doc(userId);
    
    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const stats = userData.stats || {};
        
        if (type === 'gad7') {
            stats.lastGAD7Score = value;
            stats.lastGAD7Date = firebase.firestore.FieldValue.serverTimestamp();
            stats.totalGAD7Tests = (stats.totalGAD7Tests || 0) + 1;
        }
        
        await userRef.update({ stats });
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Función para obtener historial de resultados
async function getGAD7History(userId, limit = 10) {
    const firebaseFirestore = FirebaseServices.firestore();
    if (!firebaseFirestore) return [];
    
    try {
        const snapshot = await firebaseFirestore
            .collection('users')
            .doc(userId)
            .collection('gad7_results')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error obteniendo historial GAD-7:', error);
        return [];
    }
}

// Función para renderizar el test
function renderGAD7Test(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    let currentQuestion = 0;
    let answers = {};
    
    function renderQuestion() {
        const question = GAD7_QUESTIONS[currentQuestion];
        
        container.innerHTML = `
            <div class="gad7-test-container">
                <div class="test-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((currentQuestion + 1) / GAD7_QUESTIONS.length) * 100}%"></div>
                    </div>
                    <span class="progress-text">Pregunta ${currentQuestion + 1} de ${GAD7_QUESTIONS.length}</span>
                </div>
                
                <div class="question-container">
                    <h3 class="question-title">${question.question}</h3>
                    <p class="question-subtitle">Durante las últimas 2 semanas, ¿con qué frecuencia te ha molestado lo siguiente?</p>
                    
                    <div class="options-container">
                        ${question.options.map(option => `
                            <label class="option-label">
                                <input type="radio" name="question_${question.id}" value="${option.value}" class="option-input">
                                <span class="option-text">${option.text}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="test-navigation">
                    ${currentQuestion > 0 ? '<button class="btn btn-outline" id="prev-question">Anterior</button>' : ''}
                    <button class="btn btn-primary" id="next-question" disabled>
                        ${currentQuestion === GAD7_QUESTIONS.length - 1 ? 'Finalizar Test' : 'Siguiente'}
                    </button>
                </div>
            </div>
        `;
        
        // Agregar event listeners
        const optionInputs = container.querySelectorAll('.option-input');
        const nextBtn = container.querySelector('#next-question');
        const prevBtn = container.querySelector('#prev-question');
        
        optionInputs.forEach(input => {
            input.addEventListener('change', () => {
                answers[question.id] = parseInt(input.value);
                nextBtn.disabled = false;
            });
        });
        
        nextBtn.addEventListener('click', () => {
            if (currentQuestion === GAD7_QUESTIONS.length - 1) {
                finishTest();
            } else {
                currentQuestion++;
                renderQuestion();
            }
        });
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentQuestion--;
                renderQuestion();
            });
        }
    }
    
    function finishTest() {
        const score = Object.values(answers).reduce((sum, value) => sum + value, 0);
        const level = calculateAnxietyLevel(score);
        const interpretation = generatePersonalizedInterpretation(score, level);
        
        container.innerHTML = `
            <div class="test-results-container">
                <div class="results-header">
                    <h2>Resultados del Test GAD-7</h2>
                    <div class="score-display">
                        <span class="score-number">${score}</span>
                        <span class="score-total">/ 21</span>
                    </div>
                </div>
                
                <div class="level-indicator" style="border-left-color: ${level.color}">
                    <h3 class="level-title">Nivel: ${level.label}</h3>
                    <p class="level-description">${level.description}</p>
                </div>
                
                <div class="interpretation">
                    <h4>Interpretación Personalizada</h4>
                    <p>${interpretation}</p>
                </div>
                
                <div class="recommendations">
                    <h4>Recomendaciones</h4>
                    <ul>
                        ${level.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" id="save-results">Guardar Resultados</button>
                    <button class="btn btn-outline" id="retake-test">Repetir Test</button>
                </div>
            </div>
        `;
        
        // Agregar event listeners
        const saveBtn = container.querySelector('#save-results');
        const retakeBtn = container.querySelector('#retake-test');
        
        saveBtn.addEventListener('click', async () => {
            try {
                const firebaseAuth = FirebaseServices.auth();
                if (!firebaseAuth || !firebaseAuth.currentUser) {
                    throw new Error('Usuario no autenticado');
                }
                
                await saveGAD7Result(score, level, answers, firebaseAuth.currentUser.uid);
                
                // Mostrar mensaje de éxito
                showToast('Resultados guardados correctamente', 'success');
                
                // Trackear evento
                if (window.Analytics) {
                    window.Analytics.trackEvent('gad7_saved', {
                        score: score,
                        level: level.level
                    });
                }
                
            } catch (error) {
                console.error('Error guardando resultados:', error);
                showToast('Error guardando resultados', 'error');
            }
        });
        
        retakeBtn.addEventListener('click', () => {
            currentQuestion = 0;
            answers = {};
            renderQuestion();
        });
    }
    
    // Iniciar el test
    renderQuestion();
}

// Función para mostrar toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Exportar funciones
window.GAD7Test = {
    renderGAD7Test,
    calculateAnxietyLevel,
    generatePersonalizedInterpretation,
    saveGAD7Result,
    getGAD7History,
    GAD7_QUESTIONS
};

// Módulo de preguntas para tests psicológicos
// Contiene las preguntas y opciones para todos los tests disponibles

const TEST_QUESTIONS = {
    gad7: {
        title: "Test GAD-7",
        description: "Evaluación rápida de ansiedad generalizada con 7 preguntas",
        duration: "3-5 minutos",
        questions: [
            {
                id: 1,
                question: "¿Con qué frecuencia te has sentido nervioso, ansioso o muy preocupado durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia has sido capaz de parar o controlar la preocupación durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia te has preocupado demasiado por diferentes cosas durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 4,
                question: "¿Con qué frecuencia has tenido dificultad para relajarte durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia has estado tan inquieto que ha sido difícil quedarse sentado durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te has enfadado o irritado fácilmente durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia has sentido miedo de que algo terrible pudiera pasar durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            }
        ]
    },
    
    hamilton: {
        title: "Test de Hamilton",
        description: "Evaluación profesional del nivel de ansiedad basada en criterios clínicos",
        duration: "10-15 minutos",
        questions: [
            {
                id: 1,
                question: "¿Cómo te sientes en general?",
                options: [
                    { value: 0, text: "Muy bien" },
                    { value: 1, text: "Bien" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Mal" },
                    { value: 4, text: "Muy mal" }
                ]
            },
            {
                id: 2,
                question: "¿Tienes miedos o fobias?",
                options: [
                    { value: 0, text: "Ninguno" },
                    { value: 1, text: "Leves" },
                    { value: 2, text: "Moderados" },
                    { value: 3, text: "Severos" },
                    { value: 4, text: "Muy severos" }
                ]
            },
            {
                id: 3,
                question: "¿Cómo es tu estado de ánimo?",
                options: [
                    { value: 0, text: "Muy positivo" },
                    { value: 1, text: "Positivo" },
                    { value: 2, text: "Neutral" },
                    { value: 3, text: "Negativo" },
                    { value: 4, text: "Muy negativo" }
                ]
            },
            {
                id: 4,
                question: "¿Tienes dificultades para dormir?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Ocasionalmente" },
                    { value: 2, text: "Frecuentemente" },
                    { value: 3, text: "Casi siempre" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 5,
                question: "¿Cómo es tu concentración?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Buena" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Mala" },
                    { value: 4, text: "Muy mala" }
                ]
            },
            {
                id: 6,
                question: "¿Tienes síntomas físicos de ansiedad?",
                options: [
                    { value: 0, text: "Ninguno" },
                    { value: 1, text: "Leves" },
                    { value: 2, text: "Moderados" },
                    { value: 3, text: "Severos" },
                    { value: 4, text: "Muy severos" }
                ]
            },
            {
                id: 7,
                question: "¿Cómo es tu apetito?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Bueno" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Malo" },
                    { value: 4, text: "Muy malo" }
                ]
            },
            {
                id: 8,
                question: "¿Tienes pensamientos obsesivos?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Constantemente" }
                ]
            },
            {
                id: 9,
                question: "¿Cómo es tu nivel de energía?",
                options: [
                    { value: 0, text: "Muy alto" },
                    { value: 1, text: "Alto" },
                    { value: 2, text: "Moderado" },
                    { value: 3, text: "Bajo" },
                    { value: 4, text: "Muy bajo" }
                ]
            },
            {
                id: 10,
                question: "¿Tienes comportamientos compulsivos?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Constantemente" }
                ]
            },
            {
                id: 11,
                question: "¿Cómo es tu relación con los demás?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Buena" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Mala" },
                    { value: 4, text: "Muy mala" }
                ]
            },
            {
                id: 12,
                question: "¿Tienes ataques de pánico?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Muy frecuentemente" }
                ]
            },
            {
                id: 13,
                question: "¿Cómo es tu autoestima?",
                options: [
                    { value: 0, text: "Muy alta" },
                    { value: 1, text: "Alta" },
                    { value: 2, text: "Moderada" },
                    { value: 3, text: "Baja" },
                    { value: 4, text: "Muy baja" }
                ]
            },
            {
                id: 14,
                question: "¿Tienes pensamientos de muerte o suicidio?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Constantemente" }
                ]
            }
        ]
    },
    
    estres: {
        title: "Evaluación de Estrés",
        description: "Medición del nivel de estrés y su impacto en la vida diaria",
        duration: "5-10 minutos",
        questions: [
            {
                id: 1,
                question: "¿Con qué frecuencia te sientes abrumado por las responsabilidades?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 2,
                question: "¿Cómo calificarías tu nivel de estrés en el trabajo/estudios?",
                options: [
                    { value: 0, text: "Muy bajo" },
                    { value: 1, text: "Bajo" },
                    { value: 2, text: "Moderado" },
                    { value: 3, text: "Alto" },
                    { value: 4, text: "Muy alto" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia tienes dolores de cabeza o tensión muscular?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 4,
                question: "¿Cómo es tu calidad de sueño?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Buena" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Mala" },
                    { value: 4, text: "Muy mala" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia te sientes irritable o de mal humor?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 6,
                question: "¿Cómo es tu capacidad para relajarte?",
                options: [
                    { value: 0, text: "Muy fácil" },
                    { value: 1, text: "Fácil" },
                    { value: 2, text: "Moderada" },
                    { value: 3, text: "Difícil" },
                    { value: 4, text: "Muy difícil" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia te preocupas por cosas que están fuera de tu control?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 8,
                question: "¿Cómo es tu apetito?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Bueno" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Malo" },
                    { value: 4, text: "Muy malo" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia te sientes cansado sin razón aparente?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 10,
                question: "¿Cómo calificarías tu nivel general de estrés?",
                options: [
                    { value: 0, text: "Muy bajo" },
                    { value: 1, text: "Bajo" },
                    { value: 2, text: "Moderado" },
                    { value: 3, text: "Alto" },
                    { value: 4, text: "Muy alto" }
                ]
            }
        ]
    },
    
    depresion: {
        title: "Test de Depresión",
        description: "Evaluación de síntomas depresivos y su severidad",
        duration: "8-12 minutos",
        questions: [
            {
                id: 1,
                question: "¿Con qué frecuencia te sientes triste o vacío?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 2,
                question: "¿Cómo es tu nivel de energía?",
                options: [
                    { value: 0, text: "Muy alto" },
                    { value: 1, text: "Alto" },
                    { value: 2, text: "Moderado" },
                    { value: 3, text: "Bajo" },
                    { value: 4, text: "Muy bajo" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia pierdes el interés en actividades que antes disfrutabas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 4,
                question: "¿Cómo es tu apetito?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Bueno" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Malo" },
                    { value: 4, text: "Muy malo" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia tienes dificultades para dormir?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 6,
                question: "¿Cómo es tu concentración?",
                options: [
                    { value: 0, text: "Excelente" },
                    { value: 1, text: "Buena" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Mala" },
                    { value: 4, text: "Muy mala" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia te sientes culpable o inútil?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 8,
                question: "¿Cómo es tu autoestima?",
                options: [
                    { value: 0, text: "Muy alta" },
                    { value: 1, text: "Alta" },
                    { value: 2, text: "Moderada" },
                    { value: 3, text: "Baja" },
                    { value: 4, text: "Muy baja" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia tienes pensamientos de muerte o suicidio?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 10,
                question: "¿Cómo es tu motivación para hacer cosas?",
                options: [
                    { value: 0, text: "Muy alta" },
                    { value: 1, text: "Alta" },
                    { value: 2, text: "Moderada" },
                    { value: 3, text: "Baja" },
                    { value: 4, text: "Muy baja" }
                ]
            },
            {
                id: 11,
                question: "¿Con qué frecuencia te sientes desesperanzado?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 12,
                question: "¿Cómo calificarías tu estado de ánimo general?",
                options: [
                    { value: 0, text: "Muy positivo" },
                    { value: 1, text: "Positivo" },
                    { value: 2, text: "Neutral" },
                    { value: 3, text: "Negativo" },
                    { value: 4, text: "Muy negativo" }
                ]
            }
        ]
    }
};

// Función para obtener las preguntas de un test específico
function getTestQuestions(testId) {
    return TEST_QUESTIONS[testId] || null;
}

// Función para calcular el resultado de un test
function calculateTestResult(testId, answers) {
    const test = TEST_QUESTIONS[testId];
    if (!test) return null;
    
    let totalScore = 0;
    answers.forEach(answer => {
        totalScore += answer.value;
    });
    
    const maxScore = test.questions.length * 4; // Asumiendo que el valor máximo es 4
    const percentage = (totalScore / maxScore) * 100;
    
    return {
        testId,
        testName: test.title,
        score: totalScore,
        maxScore,
        percentage,
        answers
    };
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TEST_QUESTIONS, getTestQuestions, calculateTestResult };
}

/*
 * Test de Depresión (PHQ-9)
 * Implementación específica para la evaluación de depresión
 */

class PHQ9Test {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.totalQuestions = this.questions.length;
    }

    init() {
        console.log('🧠 Inicializando test PHQ-9...');
        return this;
    }

    getInfo() {
        return {
            name: 'Test de Depresión (PHQ-9)',
            description: 'Este test evalúa la presencia y severidad de síntomas depresivos en las últimas dos semanas. Consta de 9 preguntas y toma aproximadamente 5-10 minutos completarlo. Por favor, responde con honestidad a todas las preguntas.',
            totalQuestions: 9,
            timeEstimate: '5-10 minutos',
            category: 'depresion'
        };
    }

    getQuestions() {
        return [
            {
                id: 1,
                question: "¿Con qué frecuencia has sentido poco interés o placer en hacer las cosas durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia te has sentido decaído, deprimido o sin esperanzas durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia has tenido dificultad para dormir o mantener el sueño, o has dormido demasiado durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 4,
                question: "¿Con qué frecuencia te has sentido cansado o con poca energía durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia has tenido poco apetito o has comido en exceso durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te has sentido mal contigo mismo, que eres un fracaso o que has decepcionado a tu familia o a ti mismo durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia has tenido dificultad para concentrarte en cosas tales como leer el periódico o ver la televisión durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 8,
                question: "¿Con qué frecuencia te has movido o hablado tan lento que otras personas podrían haberlo notado, o lo contrario: estar tan agitado o inquieto que te has estado moviendo mucho más de lo normal durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia has pensado que estarías mejor muerto o has pensado en hacerte daño de alguna manera durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            }
        ];
    }

    getResult(score) {
        if (score <= 4) {
            return {
                level: 'Mínima',
                description: 'Tu nivel de síntomas depresivos es mínimo.',
                recommendation: 'Continúa con tus actividades habituales y prácticas de autocuidado.',
                color: '#10B981',
                icon: '😌'
            };
        } else if (score <= 9) {
            return {
                level: 'Leve',
                description: 'Experimentas síntomas leves de depresión que son manejables.',
                recommendation: 'Considera incorporar actividades que disfrutes y ejercicio regular.',
                color: '#F59E0B',
                icon: '🧘'
            };
        } else if (score <= 14) {
            return {
                level: 'Moderada',
                description: 'Tus síntomas de depresión son moderados y pueden afectar tu bienestar.',
                recommendation: 'Te recomendamos hablar con un profesional de salud mental.',
                color: '#EF4444',
                icon: '🤔'
            };
        } else if (score <= 19) {
            return {
                level: 'Moderadamente severa',
                description: 'Experimentas síntomas moderadamente severos de depresión.',
                recommendation: 'Busca ayuda profesional pronto para recibir el apoyo adecuado.',
                color: '#DC2626',
                icon: '💙'
            };
        } else {
            return {
                level: 'Severa',
                description: 'Experimentas síntomas severos de depresión que requieren atención.',
                recommendation: 'Te recomendamos buscar ayuda profesional lo antes posible.',
                color: '#991B1B',
                icon: '💙'
            };
        }
    }
}

export default PHQ9Test;
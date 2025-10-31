/*
 * Test de Ansiedad (GAD-7)
 * Implementación específica para la evaluación de ansiedad
 */

class GAD7Test {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.totalQuestions = this.questions.length;
    }

    init() {
        console.log('🧠 Inicializando test GAD-7...');
        return this;
    }

    getInfo() {
        return {
            name: 'Test de Ansiedad (GAD-7)',
            description: 'Este test evalúa tu nivel de ansiedad en las últimas dos semanas. Consta de 7 preguntas y toma aproximadamente 5 minutos completarlo. Por favor, responde con honestidad a todas las preguntas.',
            totalQuestions: 7,
            timeEstimate: '5 minutos',
            category: 'ansiedad'
        };
    }

    getQuestions() {
        return [
            {
                id: 1,
                question: "¿Con qué frecuencia te has sentido nervioso, ansioso o al borde durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia no has podido parar o controlar las preocupaciones durante las últimas 2 semanas?",
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
                question: "¿Con qué frecuencia has tenido dificultades para relajarte durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia has estado tan inquieto que te ha sido difícil quedarte quieto durante las últimas 2 semanas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Varios días" },
                    { value: 2, text: "Más de la mitad de los días" },
                    { value: 3, text: "Casi todos los días" }
                ]
            },
            {
                id: 6,
                question: "¿Con qué frecuencia te has sentido molesto o irritable durante las últimas 2 semanas?",
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
        ];
    }

    getResult(score) {
        if (score <= 4) {
            return {
                level: 'Mínima',
                description: 'Tu nivel de ansiedad es mínimo. Continúa con tus hábitos saludables.',
                recommendation: 'Mantén tus rutinas de bienestar y considera el diario para seguir tu progreso.',
                color: '#10B981',
                icon: '😌'
            };
        } else if (score <= 9) {
            return {
                level: 'Leve',
                description: 'Tienes síntomas leves de ansiedad. Es normal y manejable.',
                recommendation: 'Te recomendamos usar nuestro diario de bienestar con ejercicios de relajación.',
                color: '#F59E0B',
                icon: '🧘'
            };
        } else if (score <= 14) {
            return {
                level: 'Moderada',
                description: 'Tienes síntomas moderados de ansiedad que pueden beneficiarse de atención.',
                recommendation: 'Usa regularmente nuestro diario con ejercicios específicos para reducir la ansiedad.',
                color: '#EF4444',
                icon: '🤔'
            };
        } else {
            return {
                level: 'Severa',
                description: 'Tienes síntomas severos de ansiedad que requieren atención profesional.',
                recommendation: 'Consulta con un profesional de salud mental. Nuestro diario puede ser un complemento útil.',
                color: '#DC2626',
                icon: '💙'
            };
        }
    }
}

export default GAD7Test;
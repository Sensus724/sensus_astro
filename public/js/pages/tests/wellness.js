/*
 * Test de Bienestar General
 * Implementación específica para la evaluación de bienestar psicológico
 */

class WellnessTest {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.totalQuestions = this.questions.length;
    }

    init() {
        console.log('🧠 Inicializando test de Bienestar General...');
        return this;
    }

    getInfo() {
        return {
            name: 'Test de Bienestar General',
            description: 'Este test evalúa tu nivel general de bienestar psicológico, emocional y social. Consta de 15 preguntas y toma aproximadamente 8-12 minutos completarlo. Por favor, responde con honestidad a todas las preguntas.',
            totalQuestions: 15,
            timeEstimate: '8-12 minutos',
            category: 'bienestar'
        };
    }

    getQuestions() {
        return [
            {
                id: 1,
                question: "En general, ¿cómo calificarías tu salud física?",
                options: [
                    { value: 0, text: "Muy mala" },
                    { value: 1, text: "Mala" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Buena" },
                    { value: 4, text: "Muy buena" }
                ]
            },
            {
                id: 2,
                question: "¿Con qué frecuencia te sientes satisfecho con tu vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 3,
                question: "¿Con qué frecuencia sientes que tienes un propósito o sentido en tu vida?",
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
                question: "¿Con qué frecuencia te sientes conectado con otras personas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 5,
                question: "¿Con qué frecuencia te sientes capaz de manejar tus responsabilidades diarias?",
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
                question: "¿Con qué frecuencia te sientes optimista sobre tu futuro?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 7,
                question: "¿Con qué frecuencia sientes que estás creciendo como persona?",
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
                question: "¿Con qué frecuencia te sientes capaz de tomar tus propias decisiones?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 9,
                question: "¿Con qué frecuencia te sientes satisfecho con tus relaciones personales?",
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
                question: "¿Con qué frecuencia sientes que tu vida tiene un equilibrio adecuado?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 11,
                question: "¿Con qué frecuencia te sientes capaz de manejar el estrés en tu vida?",
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
                question: "¿Con qué frecuencia te sientes energizado y con vitalidad?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 13,
                question: "¿Con qué frecuencia te sientes satisfecho con tus logros?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 14,
                question: "¿Con qué frecuencia sientes que puedes ser tú mismo sin preocuparte por el juicio de los demás?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Raramente" },
                    { value: 2, text: "A veces" },
                    { value: 3, text: "Frecuentemente" },
                    { value: 4, text: "Siempre" }
                ]
            },
            {
                id: 15,
                question: "En general, ¿cómo calificarías tu calidad de vida?",
                options: [
                    { value: 0, text: "Muy mala" },
                    { value: 1, text: "Mala" },
                    { value: 2, text: "Regular" },
                    { value: 3, text: "Buena" },
                    { value: 4, text: "Muy buena" }
                ]
            }
        ];
    }

    getResult(score) {
        // Puntuación máxima: 60 (15 preguntas * 4 puntos máximo)
        const percentage = (score / 60) * 100;
        
        if (percentage >= 80) {
            return {
                level: 'Excelente',
                description: 'Tu nivel de bienestar general es excelente. Estás experimentando un alto nivel de satisfacción y equilibrio en tu vida.',
                recommendation: 'Continúa con tus prácticas actuales y considera compartir tus estrategias con otros.',
                color: '#10B981',
                icon: '😌'
            };
        } else if (percentage >= 60) {
            return {
                level: 'Bueno',
                description: 'Tu nivel de bienestar general es bueno. Tienes una base sólida de satisfacción en tu vida.',
                recommendation: 'Identifica áreas específicas donde podrías mejorar para alcanzar un bienestar óptimo.',
                color: '#10B981',
                icon: '🙂'
            };
        } else if (percentage >= 40) {
            return {
                level: 'Moderado',
                description: 'Tu nivel de bienestar general es moderado. Hay aspectos de tu vida que funcionan bien y otros que podrían mejorar.',
                recommendation: 'Considera enfocarte en las áreas donde puntuaste más bajo para mejorar tu bienestar general.',
                color: '#F59E0B',
                icon: '🤔'
            };
        } else if (percentage >= 20) {
            return {
                level: 'Bajo',
                description: 'Tu nivel de bienestar general es bajo. Podrías estar experimentando dificultades en varias áreas de tu vida.',
                recommendation: 'Considera buscar apoyo para mejorar tu bienestar general y establecer pequeñas metas alcanzables.',
                color: '#EF4444',
                icon: '😟'
            };
        } else {
            return {
                level: 'Muy bajo',
                description: 'Tu nivel de bienestar general es muy bajo. Podrías estar pasando por un momento difícil en tu vida.',
                recommendation: 'Te recomendamos buscar apoyo profesional para ayudarte a mejorar tu bienestar general.',
                color: '#DC2626',
                icon: '💙'
            };
        }
    }
}

export default WellnessTest;
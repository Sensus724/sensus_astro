/*
 * Test de Estrés (PSS)
 * Implementación específica para la evaluación de estrés percibido
 */

class PSSTest {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.totalQuestions = this.questions.length;
    }

    init() {
        console.log('🧠 Inicializando test PSS...');
        return this;
    }

    getInfo() {
        return {
            name: 'Test de Estrés (PSS)',
            description: 'Este test evalúa tu nivel de estrés percibido en el último mes. Consta de 10 preguntas y toma aproximadamente 3-5 minutos completarlo. Por favor, responde con honestidad a todas las preguntas.',
            totalQuestions: 10,
            timeEstimate: '3-5 minutos',
            category: 'estres'
        };
    }

    getQuestions() {
        return [
            {
                id: 1,
                question: "En el último mes, ¿con qué frecuencia te has sentido afectado por algo que ha ocurrido inesperadamente?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            },
            {
                id: 2,
                question: "En el último mes, ¿con qué frecuencia te has sentido incapaz de controlar las cosas importantes en tu vida?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            },
            {
                id: 3,
                question: "En el último mes, ¿con qué frecuencia te has sentido nervioso o estresado?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            },
            {
                id: 4,
                question: "En el último mes, ¿con qué frecuencia has estado seguro sobre tu capacidad para manejar tus problemas personales?",
                options: [
                    { value: 4, text: "Nunca" },
                    { value: 3, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 1, text: "A menudo" },
                    { value: 0, text: "Muy a menudo" }
                ]
            },
            {
                id: 5,
                question: "En el último mes, ¿con qué frecuencia has sentido que las cosas te van bien?",
                options: [
                    { value: 4, text: "Nunca" },
                    { value: 3, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 1, text: "A menudo" },
                    { value: 0, text: "Muy a menudo" }
                ]
            },
            {
                id: 6,
                question: "En el último mes, ¿con qué frecuencia has sentido que no podías afrontar todas las cosas que tenías que hacer?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            },
            {
                id: 7,
                question: "En el último mes, ¿con qué frecuencia has podido controlar las dificultades de tu vida?",
                options: [
                    { value: 4, text: "Nunca" },
                    { value: 3, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 1, text: "A menudo" },
                    { value: 0, text: "Muy a menudo" }
                ]
            },
            {
                id: 8,
                question: "En el último mes, ¿con qué frecuencia has sentido que tenías todo bajo control?",
                options: [
                    { value: 4, text: "Nunca" },
                    { value: 3, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 1, text: "A menudo" },
                    { value: 0, text: "Muy a menudo" }
                ]
            },
            {
                id: 9,
                question: "En el último mes, ¿con qué frecuencia has estado enfadado porque las cosas que te han ocurrido estaban fuera de tu control?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            },
            {
                id: 10,
                question: "En el último mes, ¿con qué frecuencia has sentido que las dificultades se acumulan tanto que no puedes superarlas?",
                options: [
                    { value: 0, text: "Nunca" },
                    { value: 1, text: "Casi nunca" },
                    { value: 2, text: "De vez en cuando" },
                    { value: 3, text: "A menudo" },
                    { value: 4, text: "Muy a menudo" }
                ]
            }
        ];
    }

    getResult(score) {
        if (score <= 13) {
            return {
                level: 'Bajo',
                description: 'Tu nivel de estrés percibido es bajo.',
                recommendation: 'Continúa con tus estrategias actuales de manejo del estrés.',
                color: '#10B981',
                icon: '😌'
            };
        } else if (score <= 26) {
            return {
                level: 'Moderado',
                description: 'Experimentas un nivel moderado de estrés.',
                recommendation: 'Considera técnicas de relajación y establecer límites saludables.',
                color: '#F59E0B',
                icon: '🧘'
            };
        } else {
            return {
                level: 'Alto',
                description: 'Tu nivel de estrés percibido es alto y puede afectar tu salud.',
                recommendation: 'Busca formas de reducir tus factores de estrés y considera ayuda profesional.',
                color: '#DC2626',
                icon: '💙'
            };
        }
    }
}

export default PSSTest;
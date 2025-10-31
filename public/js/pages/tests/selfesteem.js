/*
 * Test de Autoestima (RSES)
 * Implementación específica para la evaluación de autoestima
 */

class SelfEsteemTest {
    constructor() {
        this.currentQuestion = 0;
        this.answers = {};
        this.questions = this.getQuestions();
        this.totalQuestions = this.questions.length;
    }

    init() {
        console.log('🧠 Inicializando test de Autoestima (RSES)...');
        return this;
    }

    getInfo() {
        return {
            name: 'Test de Autoestima (RSES)',
            description: 'Este test evalúa tu nivel de autoestima y valoración personal basado en la Escala de Autoestima de Rosenberg. Consta de 10 preguntas y toma aproximadamente 3-5 minutos completarlo. Por favor, responde con honestidad a todas las preguntas.',
            totalQuestions: 10,
            timeEstimate: '3-5 minutos',
            category: 'wellness'
        };
    }

    getQuestions() {
        return [
            {
                id: 1,
                question: "Siento que soy una persona digna de aprecio, al menos en igual medida que los demás.",
                options: [
                    { value: 0, text: "Muy en desacuerdo" },
                    { value: 1, text: "En desacuerdo" },
                    { value: 2, text: "De acuerdo" },
                    { value: 3, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 2,
                question: "Estoy convencido de que tengo cualidades buenas.",
                options: [
                    { value: 0, text: "Muy en desacuerdo" },
                    { value: 1, text: "En desacuerdo" },
                    { value: 2, text: "De acuerdo" },
                    { value: 3, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 3,
                question: "Soy capaz de hacer las cosas tan bien como la mayoría de la gente.",
                options: [
                    { value: 0, text: "Muy en desacuerdo" },
                    { value: 1, text: "En desacuerdo" },
                    { value: 2, text: "De acuerdo" },
                    { value: 3, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 4,
                question: "Tengo una actitud positiva hacia mí mismo/a.",
                options: [
                    { value: 0, text: "Muy en desacuerdo" },
                    { value: 1, text: "En desacuerdo" },
                    { value: 2, text: "De acuerdo" },
                    { value: 3, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 5,
                question: "En general estoy satisfecho/a de mí mismo/a.",
                options: [
                    { value: 0, text: "Muy en desacuerdo" },
                    { value: 1, text: "En desacuerdo" },
                    { value: 2, text: "De acuerdo" },
                    { value: 3, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 6,
                question: "Siento que no tengo mucho de lo que estar orgulloso/a.",
                options: [
                    { value: 3, text: "Muy en desacuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 0, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 7,
                question: "En general, me inclino a pensar que soy un fracasado/a.",
                options: [
                    { value: 3, text: "Muy en desacuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 0, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 8,
                question: "Me gustaría poder sentir más respeto por mí mismo/a.",
                options: [
                    { value: 3, text: "Muy en desacuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 0, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 9,
                question: "Hay veces que realmente pienso que soy un inútil.",
                options: [
                    { value: 3, text: "Muy en desacuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 0, text: "Muy de acuerdo" }
                ]
            },
            {
                id: 10,
                question: "A veces creo que no soy buena persona.",
                options: [
                    { value: 3, text: "Muy en desacuerdo" },
                    { value: 2, text: "En desacuerdo" },
                    { value: 1, text: "De acuerdo" },
                    { value: 0, text: "Muy de acuerdo" }
                ]
            }
        ];
    }

    getResult(score) {
        // Puntuación máxima: 30 (10 preguntas * 3 puntos máximo)
        if (score >= 25) {
            return {
                level: 'Alta',
                description: 'Tienes un nivel alto de autoestima. Te valoras positivamente y confías en tus capacidades.',
                recommendation: 'Continúa cultivando tu autoestima y considera compartir tus estrategias con otros.',
                color: '#10B981',
                icon: '😌'
            };
        } else if (score >= 15) {
            return {
                level: 'Media',
                description: 'Tienes un nivel medio de autoestima. Hay aspectos de ti mismo/a que valoras positivamente y otros que podrías mejorar.',
                recommendation: 'Trabaja en reforzar los aspectos positivos de ti mismo/a y en desarrollar una autoimagen más positiva.',
                color: '#F59E0B',
                icon: '🙂'
            };
        } else {
            return {
                level: 'Baja',
                description: 'Tu nivel de autoestima es bajo. Podrías estar experimentando dificultades para valorarte positivamente.',
                recommendation: 'Considera buscar apoyo para trabajar en tu autoestima y desarrollar una imagen más positiva de ti mismo/a.',
                color: '#EF4444',
                icon: '💙'
            };
        }
    }
}

export default SelfEsteemTest;
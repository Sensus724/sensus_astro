/*
 * Sensus - Homepage Interactions
 * JavaScript específico para la página de inicio
 */

class HomepageInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Botones de navegación principal
        const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCTAClick(e);
            });
        });

        // Animaciones de scroll
        window.addEventListener('scroll', () => {
            this.handleScrollAnimations();
        });

        // Interacciones de tarjetas de características
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCard(card, 'enter');
            });
            card.addEventListener('mouseleave', () => {
                this.animateCard(card, 'leave');
            });
        });
    }

    initializeAnimations() {
        // Inicializar animaciones de entrada
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in');
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    handleCTAClick(event) {
        const button = event.target.closest('button');
        const href = button.getAttribute('data-href') || button.getAttribute('href');
        
        if (href) {
            // Animación de click
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            // Navegación suave
            if (href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    handleScrollAnimations() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // Parallax effect para elementos específicos
        const parallaxElements = document.querySelectorAll('.parallax');
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        // Mostrar elementos cuando están en viewport
        const elementsToShow = document.querySelectorAll('.show-on-scroll');
        elementsToShow.forEach(element => {
            const rect = element.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0) {
                element.classList.add('visible');
            }
        });
    }

    animateCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('homepage') || window.location.pathname === '/') {
        window.homepageInteractions = new HomepageInteractions();
    }
});

/**
 * Información Mejorada - Sensus
 * Funcionalidad avanzada para la sección de información importante
 */

class InfoEnhanced {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupCardAnimations();
    }

    setupEventListeners() {
        // Botones de acción
        const learnMoreBtn = document.getElementById('learn-more-btn');
        const privacyPolicyBtn = document.getElementById('privacy-policy-btn');

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => this.handleLearnMore());
        }

        if (privacyPolicyBtn) {
            privacyPolicyBtn.addEventListener('click', () => this.handlePrivacyPolicy());
        }

        // Tarjetas de información
        const infoCards = document.querySelectorAll('.info-card-enhanced');
        infoCards.forEach(card => {
            card.addEventListener('click', () => this.handleCardClick(card));
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar tarjetas de información
        const infoCards = document.querySelectorAll('.info-card-enhanced');
        infoCards.forEach(card => {
            observer.observe(card);
        });
    }

    setupCardAnimations() {
        const infoCards = document.querySelectorAll('.info-card-enhanced');
        
        infoCards.forEach((card, index) => {
            // Añadir delay escalonado para la animación
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Añadir clase para animación de entrada
            card.classList.add('fade-in-up');
        });
    }

    handleCardClick(card) {
        const cardType = card.getAttribute('data-card');
        
        // Añadir efecto de click
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Mostrar información adicional según el tipo de tarjeta
        switch (cardType) {
            case 'privacy':
                this.showPrivacyDetails();
                break;
            case 'science':
                this.showScienceDetails();
                break;
            case 'tracking':
                this.showTrackingDetails();
                break;
            case 'access':
                this.showAccessDetails();
                break;
        }
    }

    handleCardHover(card) {
        const icon = card.querySelector('.info-icon-enhanced');
        const tags = card.querySelectorAll('.feature-tag');
        
        // Animación del icono
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
        
        // Animación de las etiquetas
        tags.forEach((tag, index) => {
            setTimeout(() => {
                tag.style.transform = 'translateY(-2px)';
                tag.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }, index * 50);
        });
    }

    handleCardLeave(card) {
        const icon = card.querySelector('.info-icon-enhanced');
        const tags = card.querySelectorAll('.feature-tag');
        
        // Resetear animación del icono
        if (icon) {
            icon.style.transform = '';
        }
        
        // Resetear animación de las etiquetas
        tags.forEach(tag => {
            tag.style.transform = '';
            tag.style.boxShadow = '';
        });
    }

    showPrivacyDetails() {
        this.showModal({
            title: 'Privacidad Garantizada',
            content: `
                <div class="modal-content-enhanced">
                    <h3>🔒 Protección de Datos</h3>
                    <ul>
                        <li><strong>Encriptación AES-256:</strong> Tus datos están protegidos con el estándar militar</li>
                        <li><strong>Cero Conocimiento:</strong> Ni siquiera nosotros podemos ver tu información</li>
                        <li><strong>Almacenamiento Local:</strong> Tus reflexiones se guardan en tu dispositivo</li>
                        <li><strong>Sin Tracking:</strong> No recopilamos datos de uso personal</li>
                    </ul>
                    <p>Tu privacidad es nuestra prioridad. Cada reflexión que escribas está completamente protegida.</p>
                </div>
            `,
            type: 'privacy'
        });
    }

    showScienceDetails() {
        this.showModal({
            title: 'Basado en Ciencia',
            content: `
                <div class="modal-content-enhanced">
                    <h3>🧠 Fundamentos Científicos</h3>
                    <ul>
                        <li><strong>TCC (Terapia Cognitivo-Conductual):</strong> Técnicas validadas científicamente</li>
                        <li><strong>Mindfulness:</strong> Basado en investigación de neurociencia</li>
                        <li><strong>Psicología Positiva:</strong> Enfoque en fortalezas y bienestar</li>
                        <li><strong>Neuroplasticidad:</strong> Ejercicios que promueven cambios cerebrales</li>
                    </ul>
                    <p>Todos nuestros ejercicios están respaldados por investigación científica y estudios clínicos.</p>
                </div>
            `,
            type: 'science'
        });
    }

    showTrackingDetails() {
        this.showModal({
            title: 'Seguimiento Personalizado',
            content: `
                <div class="modal-content-enhanced">
                    <h3>📊 Analytics Avanzados</h3>
                    <ul>
                        <li><strong>Patrones de IA:</strong> Detectamos tendencias en tu bienestar</li>
                        <li><strong>Métricas Detalladas:</strong> Progreso visual y estadísticas</li>
                        <li><strong>Insights Personalizados:</strong> Recomendaciones basadas en tus datos</li>
                        <li><strong>Reportes Semanales:</strong> Resúmenes de tu progreso</li>
                    </ul>
                    <p>Visualiza tu progreso con métricas detalladas y patrones de bienestar a lo largo del tiempo.</p>
                </div>
            `,
            type: 'tracking'
        });
    }

    showAccessDetails() {
        this.showModal({
            title: 'Acceso 24/7',
            content: `
                <div class="modal-content-enhanced">
                    <h3>🌐 Disponibilidad Total</h3>
                    <ul>
                        <li><strong>Multi-dispositivo:</strong> Funciona en móvil, tablet y desktop</li>
                        <li><strong>Sincronización:</strong> Tus datos se sincronizan entre dispositivos</li>
                        <li><strong>Modo Offline:</strong> Funciona sin conexión a internet</li>
                        <li><strong>Respuesta Rápida:</strong> Carga instantánea en cualquier momento</li>
                    </ul>
                    <p>Tu diario está disponible cuando lo necesites, desde cualquier dispositivo y en cualquier momento.</p>
                </div>
            `,
            type: 'access'
        });
    }

    showModal({ title, content, type }) {
        // Crear modal si no existe
        let modal = document.getElementById('info-modal');
        if (!modal) {
            modal = this.createModal();
        }

        // Configurar contenido
        const modalTitle = modal.querySelector('.modal-title');
        const modalContent = modal.querySelector('.modal-body');
        
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        
        // Añadir clase de tipo
        modal.className = `modal-enhanced modal-${type}`;
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'info-modal';
        modal.className = 'modal-enhanced';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2 class="modal-title"></h2>
                    <button class="modal-close" aria-label="Cerrar modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button class="btn-modal-primary" id="modal-ok-btn">Entendido</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners del modal
        const closeBtn = modal.querySelector('.modal-close');
        const okBtn = modal.querySelector('#modal-ok-btn');
        const backdrop = modal.querySelector('.modal-backdrop');
        
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        okBtn.addEventListener('click', closeModal);
        backdrop.addEventListener('click', closeModal);
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeModal();
            }
        });
        
        return modal;
    }

    handleLearnMore() {
        // Redirigir a página de información o mostrar más detalles
        window.location.href = '/equipo';
    }

    handlePrivacyPolicy() {
        // Redirigir a política de privacidad
        window.location.href = '/politica-privacidad';
    }

    // Método para añadir efectos de partículas en las tarjetas
    addParticleEffect(card) {
        const particles = document.createElement('div');
        particles.className = 'particles-effect';
        particles.innerHTML = `
            <div class="particle"></div>
            <div class="particle"></div>
            <div class="particle"></div>
        `;
        
        card.appendChild(particles);
        
        // Remover después de la animación
        setTimeout(() => {
            particles.remove();
        }, 1000);
    }

    // Método para obtener estadísticas de uso
    getUsageStats() {
        return {
            totalSessions: localStorage.getItem('sensus_total_sessions') || 0,
            totalReflections: localStorage.getItem('sensus_total_reflections') || 0,
            currentStreak: localStorage.getItem('sensus_current_streak') || 0,
            bestStreak: localStorage.getItem('sensus_best_streak') || 0
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.infoEnhanced = new InfoEnhanced();
});

// Exportar para uso global
window.InfoEnhanced = InfoEnhanced;

// Exportar por defecto para módulos ES6
export default InfoEnhanced;
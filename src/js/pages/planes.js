/*
 * Sensus - Planes Interactions
 * JavaScript específico para la página de planes
 */

class PlanesInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePlans();
    }

    setupEventListeners() {
        // Botones de selección de plan
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-plan-btn')) {
                this.selectPlan(e.target);
            }
        });

        // Botones de información de planes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('plan-info-btn')) {
                this.showPlanDetails(e.target);
            }
        });

        // Comparador de planes
        const compareBtn = document.getElementById('compare-plans');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.toggleCompareMode();
            });
        }

        // Filtros de planes
        const filterBtns = document.querySelectorAll('.plan-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterPlans(e.target.dataset.filter);
            });
        });
    }

    initializePlans() {
        // Configurar planes disponibles
        this.plans = this.getAvailablePlans();
        this.renderPlans();
        this.updatePricing();
    }

    getAvailablePlans() {
        return [
            {
                id: 'basic',
                name: 'Plan Básico',
                price: 0,
                period: 'mes',
                description: 'Perfecto para comenzar tu viaje hacia el bienestar mental',
                features: [
                    'Acceso al diario de bienestar',
                    'Ejercicios básicos de relajación',
                    'Seguimiento de progreso',
                    'Calendario de actividades',
                    'Soporte por email'
                ],
                limitations: [
                    'Ejercicios limitados',
                    'Sin análisis avanzado',
                    'Soporte básico'
                ],
                popular: false,
                color: '#6b7280'
            },
            {
                id: 'premium',
                name: 'Plan Premium',
                price: 19.99,
                period: 'mes',
                description: 'Para aquellos que buscan un apoyo más completo',
                features: [
                    'Todo del Plan Básico',
                    'Ejercicios avanzados de ansiedad',
                    'Análisis de patrones emocionales',
                    'Insights personalizados con IA',
                    'Soporte prioritario',
                    'Exportación de datos',
                    'Metas personalizadas',
                    'Recordatorios inteligentes'
                ],
                limitations: [],
                popular: true,
                color: '#d7cdf2'
            },
            {
                id: 'professional',
                name: 'Plan Profesional',
                price: 49.99,
                period: 'mes',
                description: 'Para profesionales de la salud mental',
                features: [
                    'Todo del Plan Premium',
                    'Panel de administración',
                    'Gestión de múltiples pacientes',
                    'Reportes detallados',
                    'Integración con sistemas médicos',
                    'Soporte telefónico 24/7',
                    'API personalizada',
                    'Capacitación incluida'
                ],
                limitations: [],
                popular: false,
                color: '#7c8ce0'
            }
        ];
    }

    renderPlans() {
        const plansContainer = document.getElementById('plans-container');
        if (!plansContainer) return;

        plansContainer.innerHTML = '';

        this.plans.forEach(plan => {
            const planElement = this.createPlanElement(plan);
            plansContainer.appendChild(planElement);
        });
    }

    createPlanElement(plan) {
        const planDiv = document.createElement('div');
        planDiv.className = `plan-card ${plan.popular ? 'popular' : ''}`;
        planDiv.dataset.planId = plan.id;

        const popularBadge = plan.popular ? '<div class="popular-badge">Más Popular</div>' : '';
        const priceDisplay = plan.price === 0 ? 'Gratis' : `$${plan.price}/${plan.period}`;

        planDiv.innerHTML = `
            <div class="plan-header">
                ${popularBadge}
                <h3 class="plan-name">${plan.name}</h3>
                <div class="plan-price">
                    <span class="price-amount">${priceDisplay}</span>
                </div>
                <p class="plan-description">${plan.description}</p>
            </div>
            
            <div class="plan-features">
                <h4>Características incluidas:</h4>
                <ul class="features-list">
                    ${plan.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                </ul>
            </div>

            <div class="plan-actions">
                <button class="btn btn-outline plan-info-btn" data-plan-id="${plan.id}">
                    Ver Detalles
                </button>
                <button class="btn btn-primary select-plan-btn" data-plan-id="${plan.id}">
                    Seleccionar Plan
                </button>
            </div>
        `;

        return planDiv;
    }

    selectPlan(button) {
        const planId = button.dataset.planId;
        const plan = this.plans.find(p => p.id === planId);

        if (!plan) return;

        // Animación de selección
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Mostrar modal de confirmación
        this.showPlanConfirmation(plan);
    }

    showPlanConfirmation(plan) {
        const modal = document.createElement('div');
        modal.className = 'plan-confirmation-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Confirmar Selección</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-summary">
                        <h3>${plan.name}</h3>
                        <div class="plan-price">
                            ${plan.price === 0 ? 'Gratis' : `$${plan.price}/${plan.period}`}
                        </div>
                        <p>${plan.description}</p>
                    </div>
                    
                    <div class="plan-features-summary">
                        <h4>Incluye:</h4>
                        <ul>
                            ${plan.features.slice(0, 5).map(feature => `<li>✓ ${feature}</li>`).join('')}
                            ${plan.features.length > 5 ? `<li>... y ${plan.features.length - 5} características más</li>` : ''}
                        </ul>
                    </div>

                    <div class="confirmation-actions">
                        <button class="btn btn-outline cancel-plan">Cancelar</button>
                        <button class="btn btn-primary confirm-plan" data-plan-id="${plan.id}">
                            ${plan.price === 0 ? 'Comenzar Gratis' : 'Continuar con Pago'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .plan-confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 1rem;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .plan-summary {
                text-align: center;
                margin-bottom: 2rem;
            }
            .plan-summary h3 {
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }
            .plan-price {
                font-size: 2rem;
                font-weight: 700;
                color: #d7cdf2;
                margin-bottom: 1rem;
            }
            .plan-features-summary ul {
                list-style: none;
                padding: 0;
            }
            .plan-features-summary li {
                padding: 0.5rem 0;
                border-bottom: 1px solid #f3f4f6;
            }
            .confirmation-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Event listeners del modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.querySelector('.cancel-plan').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.querySelector('.confirm-plan').addEventListener('click', (e) => {
            this.processPlanSelection(e.target.dataset.planId);
            modal.remove();
            style.remove();
        });

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    processPlanSelection(planId) {
        const plan = this.plans.find(p => p.id === planId);
        
        if (!plan) return;

        // Guardar selección
        localStorage.setItem('selectedPlan', JSON.stringify({
            planId: plan.id,
            planName: plan.name,
            selectedAt: new Date().toISOString()
        }));

        // Mostrar mensaje de éxito
        this.showNotification(`¡Plan ${plan.name} seleccionado!`, 'success');

        // Redirigir según el plan
        if (plan.price === 0) {
            // Plan gratuito - ir al diario
            setTimeout(() => {
                window.location.href = '/diario';
            }, 1500);
        } else {
            // Plan de pago - mostrar información de contacto
            this.showPaymentInfo(plan);
        }
    }

    showPaymentInfo(plan) {
        const modal = document.createElement('div');
        modal.className = 'payment-info-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Información de Pago</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="payment-info">
                        <h3>${plan.name}</h3>
                        <p>Para activar tu plan ${plan.name}, por favor contacta con nuestro equipo:</p>
                        
                        <div class="contact-methods">
                            <div class="contact-item">
                                <strong>Email:</strong> contacto@sensus.com
                            </div>
                            <div class="contact-item">
                                <strong>Teléfono:</strong> +1 (555) 123-4567
                            </div>
                            <div class="contact-item">
                                <strong>Horario:</strong> Lunes a Viernes, 9:00 - 18:00
                            </div>
                        </div>

                        <div class="payment-note">
                            <p><strong>Nota:</strong> Te contactaremos en las próximas 24 horas para procesar tu suscripción.</p>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.location.href='/contacto'">
                            Ir a Contacto
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Usar los mismos estilos del modal anterior
        document.body.appendChild(modal);

        // Event listeners
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showPlanDetails(button) {
        const planId = button.dataset.planId;
        const plan = this.plans.find(p => p.id === planId);

        if (!plan) return;

        // Crear modal de detalles
        const modal = document.createElement('div');
        modal.className = 'plan-details-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${plan.name} - Detalles Completos</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="plan-overview">
                        <div class="plan-price-large">
                            ${plan.price === 0 ? 'Gratis' : `$${plan.price}/${plan.period}`}
                        </div>
                        <p class="plan-description">${plan.description}</p>
                    </div>

                    <div class="features-section">
                        <h3>Características Incluidas</h3>
                        <ul class="detailed-features">
                            ${plan.features.map(feature => `<li>✓ ${feature}</li>`).join('')}
                        </ul>
                    </div>

                    ${plan.limitations.length > 0 ? `
                        <div class="limitations-section">
                            <h3>Limitaciones</h3>
                            <ul class="limitations-list">
                                ${plan.limitations.map(limitation => `<li>⚠ ${limitation}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary select-plan-btn" data-plan-id="${plan.id}">
                            Seleccionar Este Plan
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.select-plan-btn').addEventListener('click', (e) => {
            this.selectPlan(e.target);
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    filterPlans(filter) {
        const planCards = document.querySelectorAll('.plan-card');
        
        planCards.forEach(card => {
            const planId = card.dataset.planId;
            const plan = this.plans.find(p => p.id === planId);
            
            let show = true;
            
            switch (filter) {
                case 'free':
                    show = plan.price === 0;
                    break;
                case 'premium':
                    show = plan.price > 0 && plan.price < 30;
                    break;
                case 'professional':
                    show = plan.price >= 30;
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });

        // Actualizar botones de filtro
        document.querySelectorAll('.plan-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    toggleCompareMode() {
        const compareBtn = document.getElementById('compare-plans');
        const plansContainer = document.getElementById('plans-container');
        
        if (compareBtn && plansContainer) {
            const isComparing = compareBtn.classList.contains('active');
            
            if (isComparing) {
                // Salir del modo comparación
                compareBtn.classList.remove('active');
                compareBtn.textContent = 'Comparar Planes';
                plansContainer.classList.remove('compare-mode');
            } else {
                // Entrar al modo comparación
                compareBtn.classList.add('active');
                compareBtn.textContent = 'Salir de Comparación';
                plansContainer.classList.add('compare-mode');
            }
        }
    }

    updatePricing() {
        // Actualizar precios si hay ofertas especiales
        const currentDate = new Date();
        const isHolidaySeason = currentDate.getMonth() === 11; // Diciembre
        
        if (isHolidaySeason) {
            // Aplicar descuento de temporada
            this.plans.forEach(plan => {
                if (plan.price > 0) {
                    plan.originalPrice = plan.price;
                    plan.price = Math.round(plan.price * 0.8); // 20% de descuento
                    plan.hasDiscount = true;
                }
            });
            
            this.renderPlans();
            this.showSeasonalOffer();
        }
    }

    showSeasonalOffer() {
        const offerBanner = document.createElement('div');
        offerBanner.className = 'seasonal-offer-banner';
        offerBanner.innerHTML = `
            <div class="offer-content">
                <h3>🎉 ¡Oferta de Temporada!</h3>
                <p>20% de descuento en todos los planes de pago</p>
                <small>Válido hasta el 31 de diciembre</small>
            </div>
        `;

        const plansSection = document.querySelector('.plans-section');
        if (plansSection) {
            plansSection.insertBefore(offerBanner, plansSection.firstChild);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('planes') || window.location.pathname.includes('/planes')) {
        window.planesInteractions = new PlanesInteractions();
    }
});

// Exportar por defecto para módulos ES6
export default PlanesInteractions;
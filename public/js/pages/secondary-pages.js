/*
 * Sensus - Secondary Pages Interactions
 * JavaScript unificado para páginas secundarias (política-privacidad, términos-uso, etc.)
 */

class SecondaryPagesInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeContent();
    }

    setupEventListeners() {
        // Botones de navegación rápida
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-nav-btn')) {
                this.scrollToSection(e.target.dataset.section);
            }
        });

        // Botones de contacto
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('contact-btn')) {
                this.handleContactAction(e.target.dataset.action);
            }
        });

        // Botones de información adicional
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-toggle-btn')) {
                this.toggleInfoSection(e.target.dataset.section);
            }
        });

        // Botones de aceptar términos
        const acceptBtn = document.getElementById('accept-terms');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                this.acceptTerms();
            });
        }

        // Botones de configuración de privacidad
        const privacyBtns = document.querySelectorAll('.privacy-setting-btn');
        privacyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePrivacySetting(e.target.dataset.setting);
            });
        });
    }

    initializeContent() {
        // Configurar contenido específico según la página
        this.currentPage = this.getCurrentPage();
        this.setupPageSpecificContent();
        
        // Configurar navegación rápida
        this.setupQuickNavigation();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('/politica-privacidad')) return 'privacy';
        if (path.includes('/terminos-uso')) return 'terms';
        if (path.includes('/contacto')) return 'contact';
        return 'other';
    }

    setupPageSpecificContent() {
        switch (this.currentPage) {
            case 'privacy':
                this.setupPrivacyPage();
                break;
            case 'terms':
                this.setupTermsPage();
                break;
            case 'contact':
                this.setupContactPage();
                break;
            default:
                this.setupGenericPage();
                break;
        }
    }

    setupPrivacyPage() {
        // Configurar secciones de privacidad
        this.privacySections = [
            { id: 'data-collection', title: 'Recopilación de Datos' },
            { id: 'data-usage', title: 'Uso de Datos' },
            { id: 'data-sharing', title: 'Compartir Datos' },
            { id: 'data-security', title: 'Seguridad de Datos' },
            { id: 'user-rights', title: 'Derechos del Usuario' },
            { id: 'cookies', title: 'Cookies' },
            { id: 'contact-info', title: 'Información de Contacto' }
        ];

        this.renderQuickNavigation();
    }

    setupTermsPage() {
        // Configurar secciones de términos
        this.termsSections = [
            { id: 'acceptance', title: 'Aceptación de Términos' },
            { id: 'services', title: 'Descripción de Servicios' },
            { id: 'user-responsibilities', title: 'Responsabilidades del Usuario' },
            { id: 'prohibited-uses', title: 'Usos Prohibidos' },
            { id: 'intellectual-property', title: 'Propiedad Intelectual' },
            { id: 'limitation-liability', title: 'Limitación de Responsabilidad' },
            { id: 'termination', title: 'Terminación' },
            { id: 'changes', title: 'Cambios en los Términos' }
        ];

        this.renderQuickNavigation();
    }

    setupContactPage() {
        // Configurar información de contacto
        this.contactInfo = {
            email: 'contacto@sensus.com',
            phone: '+1 (555) 123-4567',
            address: '123 Calle Principal, Ciudad, País',
            hours: 'Lunes a Viernes, 9:00 - 18:00',
            emergency: 'Para emergencias: +1 (555) 999-8888'
        };

        this.renderContactInfo();
    }

    setupGenericPage() {
        // Configuración genérica para otras páginas
        this.setupScrollAnimations();
    }

    renderQuickNavigation() {
        const navContainer = document.getElementById('quick-navigation');
        if (!navContainer) return;

        const sections = this.currentPage === 'privacy' ? this.privacySections : this.termsSections;
        
        navContainer.innerHTML = `
            <h3>Navegación Rápida</h3>
            <ul class="quick-nav-list">
                ${sections.map(section => `
                    <li>
                        <button class="quick-nav-btn" data-section="${section.id}">
                            ${section.title}
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    renderContactInfo() {
        const contactContainer = document.getElementById('contact-info-container');
        if (!contactContainer) return;

        contactContainer.innerHTML = `
            <div class="contact-info-grid">
                <div class="contact-item">
                    <div class="contact-icon">📧</div>
                    <div class="contact-details">
                        <h4>Email</h4>
                        <p>${this.contactInfo.email}</p>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">📞</div>
                    <div class="contact-details">
                        <h4>Teléfono</h4>
                        <p>${this.contactInfo.phone}</p>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <div class="contact-details">
                        <h4>Dirección</h4>
                        <p>${this.contactInfo.address}</p>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">🕒</div>
                    <div class="contact-details">
                        <h4>Horario</h4>
                        <p>${this.contactInfo.hours}</p>
                    </div>
                </div>
            </div>
            
            <div class="emergency-contact">
                <h4>Contacto de Emergencia</h4>
                <p>${this.contactInfo.emergency}</p>
            </div>
        `;
    }

    setupQuickNavigation() {
        // Crear navegación rápida si no existe
        if (!document.getElementById('quick-navigation')) {
            const navElement = document.createElement('div');
            navElement.id = 'quick-navigation';
            navElement.className = 'quick-navigation';
            
            const content = document.querySelector('.page-content');
            if (content) {
                content.insertBefore(navElement, content.firstChild);
            }
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Resaltar la sección temporalmente
            section.classList.add('highlighted');
            setTimeout(() => {
                section.classList.remove('highlighted');
            }, 2000);
        }
    }

    handleContactAction(action) {
        switch (action) {
            case 'email':
                window.location.href = `mailto:${this.contactInfo.email}`;
                break;
            case 'phone':
                window.location.href = `tel:${this.contactInfo.phone}`;
                break;
            case 'form':
                window.location.href = '/contacto';
                break;
            case 'emergency':
                window.location.href = `tel:${this.contactInfo.emergency}`;
                break;
        }
    }

    toggleInfoSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const isVisible = section.style.display !== 'none';
            section.style.display = isVisible ? 'none' : 'block';
            
            const button = document.querySelector(`[data-section="${sectionId}"]`);
            if (button) {
                button.textContent = isVisible ? 'Mostrar' : 'Ocultar';
            }
        }
    }

    acceptTerms() {
        // Guardar aceptación de términos
        const acceptanceData = {
            accepted: true,
            timestamp: new Date().toISOString(),
            version: '1.0',
            ip: 'local' // En producción se obtendría la IP real
        };

        localStorage.setItem('termsAccepted', JSON.stringify(acceptanceData));
        
        // Mostrar confirmación
        this.showNotification('Términos aceptados correctamente', 'success');
        
        // Redirigir al inicio
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    }

    togglePrivacySetting(setting) {
        const currentSettings = JSON.parse(localStorage.getItem('privacySettings') || '{}');
        currentSettings[setting] = !currentSettings[setting];
        localStorage.setItem('privacySettings', JSON.stringify(currentSettings));
        
        // Actualizar UI
        const button = document.querySelector(`[data-setting="${setting}"]`);
        if (button) {
            button.classList.toggle('active', currentSettings[setting]);
            button.textContent = currentSettings[setting] ? 'Activado' : 'Desactivado';
        }
        
        this.showNotification(`Configuración de ${setting} actualizada`, 'info');
    }

    setupScrollAnimations() {
        // Configurar animaciones de scroll
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

        // Observar elementos animables
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(element => {
            observer.observe(element);
        });
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
    // Verificar si estamos en una página secundaria
    const path = window.location.pathname;
    const isSecondaryPage = path.includes('/politica-privacidad') || 
                           path.includes('/terminos-uso') || 
                           path.includes('/contacto') ||
                           path.includes('/equipo');
    
    if (isSecondaryPage) {
        window.secondaryPagesInteractions = new SecondaryPagesInteractions();
    }
});

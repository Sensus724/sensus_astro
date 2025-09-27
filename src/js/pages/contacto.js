/*
 * Sensus - Contacto Interactions
 * JavaScript específico para la página de contacto
 */

class ContactoInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeForm();
    }

    setupEventListeners() {
        // Formulario de contacto
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                this.handleFormSubmit(e);
            });
        }

        // Validación en tiempo real
        const formInputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #contact-form select');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });

        // Botones de método de contacto
        const contactMethods = document.querySelectorAll('.contact-method-btn');
        contactMethods.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectContactMethod(e.target.dataset.method);
            });
        });

        // Botón de envío rápido
        const quickSendBtn = document.getElementById('quick-send');
        if (quickSendBtn) {
            quickSendBtn.addEventListener('click', () => {
                this.showQuickSendModal();
            });
        }
    }

    initializeForm() {
        // Configurar validaciones
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: 'El nombre debe contener solo letras y tener al menos 2 caracteres'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Por favor ingresa un email válido'
            },
            phone: {
                required: false,
                pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
                message: 'Por favor ingresa un teléfono válido'
            },
            subject: {
                required: true,
                minLength: 5,
                message: 'El asunto debe tener al menos 5 caracteres'
            },
            message: {
                required: true,
                minLength: 20,
                message: 'El mensaje debe tener al menos 20 caracteres'
            }
        };

        // Configurar tipos de consulta
        this.inquiryTypes = [
            { value: 'general', label: 'Consulta General' },
            { value: 'technical', label: 'Soporte Técnico' },
            { value: 'billing', label: 'Facturación' },
            { value: 'partnership', label: 'Partnership' },
            { value: 'feedback', label: 'Feedback' },
            { value: 'other', label: 'Otro' }
        ];

        this.populateInquiryTypes();
    }

    populateInquiryTypes() {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Selecciona el tipo de consulta</option>';
            this.inquiryTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.value;
                option.textContent = type.label;
                subjectSelect.appendChild(option);
            });
        }
    }

    selectContactMethod(method) {
        // Remover selección anterior
        document.querySelectorAll('.contact-method-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Seleccionar nuevo método
        const selectedBtn = document.querySelector(`[data-method="${method}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }

        // Mostrar información específica del método
        this.showMethodInfo(method);
    }

    showMethodInfo(method) {
        const infoContainer = document.getElementById('method-info');
        if (!infoContainer) return;

        const methodInfo = {
            email: {
                title: 'Email',
                description: 'Respuesta en 24-48 horas',
                details: 'contacto@sensus.com',
                icon: '📧'
            },
            phone: {
                title: 'Teléfono',
                description: 'Lunes a Viernes, 9:00 - 18:00',
                details: '+1 (555) 123-4567',
                icon: '📞'
            },
            chat: {
                title: 'Chat en Vivo',
                description: 'Disponible ahora',
                details: 'Iniciar conversación',
                icon: '💬'
            },
            whatsapp: {
                title: 'WhatsApp',
                description: 'Respuesta rápida',
                details: '+1 (555) 123-4567',
                icon: '📱'
            }
        };

        const info = methodInfo[method];
        if (info) {
            infoContainer.innerHTML = `
                <div class="method-details">
                    <div class="method-icon">${info.icon}</div>
                    <div class="method-content">
                        <h3>${info.title}</h3>
                        <p>${info.description}</p>
                        <div class="method-contact">${info.details}</div>
                    </div>
                </div>
            `;
            infoContainer.style.display = 'block';
        }
    }

    validateField(field) {
        const fieldName = field.name;
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Validación requerida
        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }

        // Validación de longitud mínima
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Validación de patrón
        if (isValid && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Mostrar error
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Validar todos los campos
        let isFormValid = true;
        const requiredFields = ['name', 'email', 'subject', 'message'];
        
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Por favor corrige los errores en el formulario', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        // Simular envío (en producción esto sería una llamada real a la API)
        setTimeout(() => {
            this.processFormSubmission(formData);
            
            // Restaurar botón
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }

    processFormSubmission(formData) {
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            timestamp: new Date().toISOString()
        };

        // Guardar en localStorage para demo
        const savedContacts = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        savedContacts.push(contactData);
        localStorage.setItem('contactSubmissions', JSON.stringify(savedContacts));

        // Mostrar confirmación
        this.showSubmissionConfirmation(contactData);

        // Limpiar formulario
        document.getElementById('contact-form').reset();

        // Enviar a analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_form_submitted', {
                'form_type': 'contact',
                'subject': contactData.subject
            });
        }
    }

    showSubmissionConfirmation(contactData) {
        const modal = document.createElement('div');
        modal.className = 'submission-confirmation-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>¡Mensaje Enviado!</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="confirmation-icon">✅</div>
                    <div class="confirmation-message">
                        <h3>Gracias por contactarnos, ${contactData.name}</h3>
                        <p>Hemos recibido tu mensaje sobre "${contactData.subject}" y te responderemos pronto.</p>
                        
                        <div class="next-steps">
                            <h4>Próximos pasos:</h4>
                            <ul>
                                <li>Recibirás una confirmación por email</li>
                                <li>Te responderemos en 24-48 horas</li>
                                <li>Si es urgente, puedes llamarnos al +1 (555) 123-4567</li>
                            </ul>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.location.href='/'">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .submission-confirmation-modal {
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
                text-align: center;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .confirmation-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            .confirmation-message h3 {
                color: #4ade80;
                margin-bottom: 1rem;
            }
            .next-steps {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
                text-align: left;
            }
            .next-steps ul {
                margin: 0.5rem 0 0 1rem;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
                justify-content: center;
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

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    showQuickSendModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-send-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Envío Rápido</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>¿Qué tipo de consulta tienes?</p>
                    
                    <div class="quick-options">
                        <button class="quick-option" data-type="support">
                            <div class="option-icon">🛠️</div>
                            <div class="option-text">
                                <h4>Soporte Técnico</h4>
                                <p>Problemas con la plataforma</p>
                            </div>
                        </button>
                        
                        <button class="quick-option" data-type="billing">
                            <div class="option-icon">💳</div>
                            <div class="option-text">
                                <h4>Facturación</h4>
                                <p>Preguntas sobre pagos</p>
                            </div>
                        </button>
                        
                        <button class="quick-option" data-type="general">
                            <div class="option-icon">💬</div>
                            <div class="option-text">
                                <h4>Consulta General</h4>
                                <p>Información general</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .quick-send-modal {
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
            .quick-options {
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            .quick-option {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 2px solid #e5e7eb;
                border-radius: 0.5rem;
                background: white;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }
            .quick-option:hover {
                border-color: #d7cdf2;
                background: #f9fafb;
            }
            .option-icon {
                font-size: 2rem;
            }
            .option-text h4 {
                margin: 0 0 0.25rem 0;
                color: #1f2937;
            }
            .option-text p {
                margin: 0;
                color: #6b7280;
                font-size: 0.875rem;
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

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
            style.remove();
        });

        modal.querySelectorAll('.quick-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.handleQuickOption(type);
                modal.remove();
                style.remove();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                style.remove();
            }
        });
    }

    handleQuickOption(type) {
        // Pre-llenar formulario según el tipo
        const form = document.getElementById('contact-form');
        if (form) {
            const subjectSelect = form.querySelector('[name="subject"]');
            if (subjectSelect) {
                subjectSelect.value = type;
            }

            // Scroll al formulario
            form.scrollIntoView({ behavior: 'smooth' });
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
    if (document.body.classList.contains('contacto') || window.location.pathname.includes('/contacto')) {
        window.contactoInteractions = new ContactoInteractions();
    }
});

// Exportar por defecto para módulos ES6
export default ContactoInteractions;
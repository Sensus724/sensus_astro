/*
 * Sensus - Equipo Interactions
 * JavaScript específico para la página de equipo
 */

class EquipoInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTeam();
    }

    setupEventListeners() {
        // Botones de información del equipo
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('member-info-btn')) {
                this.showMemberDetails(e.target.dataset.memberId);
            }
        });

        // Filtros de equipo
        const filterBtns = document.querySelectorAll('.team-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterTeam(e.target.dataset.filter);
            });
        });

        // Botón de contacto con equipo
        const contactTeamBtn = document.getElementById('contact-team');
        if (contactTeamBtn) {
            contactTeamBtn.addEventListener('click', () => {
                this.showContactTeamModal();
            });
        }
    }

    initializeTeam() {
        // Configurar miembros del equipo
        this.teamMembers = this.getTeamMembers();
        this.renderTeam();
    }

    getTeamMembers() {
        return [
            {
                id: 'maria-garcia',
                name: 'Dra. María García',
                role: 'Psicóloga Clínica',
                specialty: 'Ansiedad y Depresión',
                experience: '15 años',
                education: 'PhD en Psicología Clínica',
                bio: 'Especialista en terapia cognitivo-conductual con más de 15 años de experiencia ayudando a pacientes con trastornos de ansiedad y depresión.',
                image: '/assets/images/team/maria-garcia.jpg',
                certifications: ['Psicología Clínica', 'Terapia Cognitivo-Conductual', 'Mindfulness'],
                languages: ['Español', 'Inglés'],
                availability: 'Lunes a Viernes',
                email: 'maria@sensus.com'
            },
            {
                id: 'carlos-mendez',
                name: 'Dr. Carlos Méndez',
                role: 'Psiquiatra',
                specialty: 'Trastornos del Estado de Ánimo',
                experience: '12 años',
                education: 'MD en Psiquiatría',
                bio: 'Psiquiatra especializado en el tratamiento de trastornos del estado de ánimo y ansiedad, con enfoque en medicina integrativa.',
                image: '/assets/images/team/carlos-mendez.jpg',
                certifications: ['Psiquiatría', 'Medicina Integrativa', 'Psicofarmacología'],
                languages: ['Español', 'Inglés'],
                availability: 'Martes a Sábado',
                email: 'carlos@sensus.com'
            },
            {
                id: 'ana-rodriguez',
                name: 'Ana Rodríguez',
                role: 'Terapeuta',
                specialty: 'Mindfulness y Relajación',
                experience: '8 años',
                education: 'Máster en Terapia Ocupacional',
                bio: 'Especialista en técnicas de mindfulness y relajación, con amplia experiencia en terapia grupal e individual.',
                image: '/assets/images/team/ana-rodriguez.jpg',
                certifications: ['Terapia Ocupacional', 'Mindfulness', 'Relajación Progresiva'],
                languages: ['Español'],
                availability: 'Lunes a Jueves',
                email: 'ana@sensus.com'
            },
            {
                id: 'luis-fernandez',
                name: 'Luis Fernández',
                role: 'Desarrollador de Producto',
                specialty: 'Tecnología y Salud Mental',
                experience: '10 años',
                education: 'Ingeniería en Sistemas',
                bio: 'Desarrollador especializado en crear herramientas tecnológicas que apoyen el bienestar mental y la accesibilidad.',
                image: '/assets/images/team/luis-fernandez.jpg',
                certifications: ['Desarrollo de Software', 'UX/UI Design', 'Accesibilidad Digital'],
                languages: ['Español', 'Inglés'],
                availability: 'Lunes a Viernes',
                email: 'luis@sensus.com'
            }
        ];
    }

    renderTeam() {
        const teamContainer = document.getElementById('team-container');
        if (!teamContainer) return;

        teamContainer.innerHTML = '';

        this.teamMembers.forEach(member => {
            const memberElement = this.createMemberElement(member);
            teamContainer.appendChild(memberElement);
        });
    }

    createMemberElement(member) {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member-card';
        memberDiv.dataset.memberId = member.id;

        memberDiv.innerHTML = `
            <div class="member-image">
                <img src="${member.image}" alt="${member.name}" onerror="this.src='/assets/images/placeholder-team.jpg'">
                <div class="member-overlay">
                    <button class="member-info-btn" data-member-id="${member.id}">
                        Ver Perfil
                    </button>
                </div>
            </div>
            
            <div class="member-info">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-role">${member.role}</p>
                <p class="member-specialty">${member.specialty}</p>
                <div class="member-experience">
                    <span class="experience-label">Experiencia:</span>
                    <span class="experience-value">${member.experience}</span>
                </div>
                <div class="member-education">
                    <span class="education-label">Formación:</span>
                    <span class="education-value">${member.education}</span>
                </div>
            </div>

            <div class="member-actions">
                <button class="btn btn-outline member-info-btn" data-member-id="${member.id}">
                    Ver Perfil Completo
                </button>
            </div>
        `;

        return memberDiv;
    }

    showMemberDetails(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'member-details-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Perfil Profesional</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="member-profile">
                        <div class="profile-image">
                            <img src="${member.image}" alt="${member.name}" onerror="this.src='/assets/images/placeholder-team.jpg'">
                        </div>
                        <div class="profile-info">
                            <h3>${member.name}</h3>
                            <p class="role">${member.role}</p>
                            <p class="specialty">${member.specialty}</p>
                        </div>
                    </div>

                    <div class="profile-details">
                        <div class="detail-section">
                            <h4>Biografía</h4>
                            <p>${member.bio}</p>
                        </div>

                        <div class="detail-section">
                            <h4>Experiencia</h4>
                            <p>${member.experience} de experiencia profesional</p>
                        </div>

                        <div class="detail-section">
                            <h4>Formación</h4>
                            <p>${member.education}</p>
                        </div>

                        <div class="detail-section">
                            <h4>Certificaciones</h4>
                            <div class="certifications">
                                ${member.certifications.map(cert => `<span class="cert-badge">${cert}</span>`).join('')}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Idiomas</h4>
                            <div class="languages">
                                ${member.languages.map(lang => `<span class="lang-badge">${lang}</span>`).join('')}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Disponibilidad</h4>
                            <p>${member.availability}</p>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.location.href='/contacto'">
                            Contactar
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .member-details-modal {
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
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1.5rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .member-profile {
                display: flex;
                gap: 1.5rem;
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }
            .profile-image img {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
            }
            .profile-info h3 {
                margin: 0 0 0.5rem 0;
                color: #1f2937;
            }
            .profile-info .role {
                color: #d7cdf2;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
            }
            .profile-info .specialty {
                color: #6b7280;
                margin: 0;
            }
            .detail-section {
                margin-bottom: 1.5rem;
            }
            .detail-section h4 {
                color: #1f2937;
                margin-bottom: 0.5rem;
            }
            .certifications, .languages {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            .cert-badge, .lang-badge {
                background: #d7cdf2;
                color: #1f2937;
                padding: 0.25rem 0.75rem;
                border-radius: 1rem;
                font-size: 0.875rem;
                font-weight: 500;
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

    filterTeam(filter) {
        const memberCards = document.querySelectorAll('.team-member-card');
        
        memberCards.forEach(card => {
            const memberId = card.dataset.memberId;
            const member = this.teamMembers.find(m => m.id === memberId);
            
            let show = true;
            
            switch (filter) {
                case 'psychologists':
                    show = member.role.toLowerCase().includes('psicólog') || member.role.toLowerCase().includes('terapeuta');
                    break;
                case 'psychiatrists':
                    show = member.role.toLowerCase().includes('psiquiatra');
                    break;
                case 'technical':
                    show = member.role.toLowerCase().includes('desarrollador') || member.role.toLowerCase().includes('tecnología');
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            card.style.display = show ? 'block' : 'none';
        });

        // Actualizar botones de filtro
        document.querySelectorAll('.team-filter').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    showContactTeamModal() {
        const modal = document.createElement('div');
        modal.className = 'contact-team-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Contactar al Equipo</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="contact-options">
                        <h3>¿Cómo prefieres contactarnos?</h3>
                        
                        <div class="contact-methods">
                            <div class="contact-method">
                                <div class="method-icon">📧</div>
                                <div class="method-info">
                                    <h4>Email General</h4>
                                    <p>equipo@sensus.com</p>
                                    <small>Respuesta en 24-48 horas</small>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="method-icon">📞</div>
                                <div class="method-info">
                                    <h4>Teléfono</h4>
                                    <p>+1 (555) 123-4567</p>
                                    <small>Lunes a Viernes, 9:00 - 18:00</small>
                                </div>
                            </div>
                            
                            <div class="contact-method">
                                <div class="method-icon">💬</div>
                                <div class="method-info">
                                    <h4>Chat en Vivo</h4>
                                    <p>Disponible ahora</p>
                                    <small>Respuesta inmediata</small>
                                </div>
                            </div>
                        </div>

                        <div class="contact-note">
                            <p><strong>Nota:</strong> Para consultas específicas con un miembro del equipo, puedes usar nuestro formulario de contacto detallado.</p>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-outline close-modal">Cerrar</button>
                        <button class="btn btn-primary" onclick="window.location.href='/contacto'">
                            Formulario de Contacto
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos del modal
        const style = document.createElement('style');
        style.textContent = `
            .contact-team-modal {
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
            .contact-methods {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin: 1.5rem 0;
            }
            .contact-method {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
                border: 1px solid #e5e7eb;
                border-radius: 0.5rem;
            }
            .method-icon {
                font-size: 2rem;
            }
            .method-info h4 {
                margin: 0 0 0.25rem 0;
                color: #1f2937;
            }
            .method-info p {
                margin: 0 0 0.25rem 0;
                color: #6b7280;
                font-weight: 500;
            }
            .method-info small {
                color: #9ca3af;
                font-size: 0.875rem;
            }
            .contact-note {
                background: #f9fafb;
                padding: 1rem;
                border-radius: 0.5rem;
                margin: 1.5rem 0;
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('equipo') || window.location.pathname.includes('/equipo')) {
        window.equipoInteractions = new EquipoInteractions();
    }
});

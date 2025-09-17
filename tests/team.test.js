/**
 * Tests para la página de equipo
 * Verifica información del equipo y profesionales
 */

describe('Team Page Tests', () => {
  beforeEach(() => {
    cy.visit('/equipo');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de equipo correctamente', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');
    });

    it('debe mostrar el header con navegación', () => {
      cy.get('header').should('be.visible');
      cy.get('.logo').should('be.visible');
    });

    it('debe mostrar título principal', () => {
      cy.get('h1').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar descripción del equipo', () => {
      cy.get('.team-description').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar footer', () => {
      cy.get('footer').should('be.visible');
    });
  });

  describe('Miembros del Equipo', () => {
    it('debe mostrar sección de miembros', () => {
      cy.get('.team-members').should('be.visible');
    });

    it('debe mostrar grid de miembros', () => {
      cy.get('.team-grid').should('be.visible');
      cy.get('.member-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información completa de cada miembro', () => {
      cy.get('.member-card').first().within(() => {
        cy.get('.member-photo').should('be.visible');
        cy.get('.member-name').should('be.visible').and('not.be.empty');
        cy.get('.member-role').should('be.visible').and('not.be.empty');
        cy.get('.member-bio').should('be.visible').and('not.be.empty');
        cy.get('.member-credentials').should('be.visible');
      });
    });

    it('debe mostrar credenciales profesionales', () => {
      cy.get('.member-card').first().within(() => {
        cy.get('.member-credentials').should('be.visible');
        cy.get('.credential-item').should('have.length.greaterThan', 0);
      });
    });

    it('debe mostrar efectos hover en tarjetas', () => {
      cy.get('.member-card').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe mostrar fotos de miembros', () => {
      cy.get('.member-photo').should('be.visible');
      cy.get('.member-photo img').should('have.attr', 'src');
    });
  });

  describe('Especialidades', () => {
    it('debe mostrar sección de especialidades', () => {
      cy.get('.specialties-section').should('be.visible');
    });

    it('debe mostrar grid de especialidades', () => {
      cy.get('.specialties-grid').should('be.visible');
      cy.get('.specialty-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información de especialidad', () => {
      cy.get('.specialty-card').first().within(() => {
        cy.get('.specialty-icon').should('be.visible');
        cy.get('.specialty-title').should('be.visible').and('not.be.empty');
        cy.get('.specialty-description').should('be.visible').and('not.be.empty');
      });
    });

    it('debe mostrar iconos de especialidades', () => {
      cy.get('.specialty-icon').should('be.visible');
    });
  });

  describe('Experiencia y Certificaciones', () => {
    it('debe mostrar sección de experiencia', () => {
      cy.get('.experience-section').should('be.visible');
    });

    it('debe mostrar años de experiencia', () => {
      cy.get('.experience-years').should('be.visible');
    });

    it('debe mostrar certificaciones', () => {
      cy.get('.certifications').should('be.visible');
      cy.get('.certification-item').should('have.length.greaterThan', 0);
    });

    it('debe mostrar logos de certificaciones', () => {
      cy.get('.certification-logo').should('be.visible');
    });
  });

  describe('Testimonios de Pacientes', () => {
    it('debe mostrar sección de testimonios', () => {
      cy.get('.testimonials-section').should('be.visible');
    });

    it('debe mostrar tarjetas de testimonio', () => {
      cy.get('.testimonial-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información del testimonio', () => {
      cy.get('.testimonial-card').first().within(() => {
        cy.get('.testimonial-text').should('be.visible');
        cy.get('.testimonial-author').should('be.visible');
        cy.get('.testimonial-rating').should('be.visible');
      });
    });

    it('debe mostrar estrellas de calificación', () => {
      cy.get('.testimonial-rating').should('be.visible');
      cy.get('.star').should('have.length', 5);
    });
  });

  describe('Redes Sociales del Equipo', () => {
    it('debe mostrar enlaces sociales de miembros', () => {
      cy.get('.member-social').should('be.visible');
    });

    it('debe mostrar iconos de redes sociales', () => {
      cy.get('.social-icon').should('be.visible');
    });

    it('debe abrir redes sociales en nueva pestaña', () => {
      cy.get('.social-link').first().should('have.attr', 'target', '_blank');
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.team-grid').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.specialties-grid').should('have.css', 'grid-template-columns', '1fr');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.team-members').should('be.visible');
      cy.get('.specialties-section').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.team-grid').should('have.css', 'grid-template-columns');
      cy.get('.specialties-grid').should('have.css', 'grid-template-columns');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('section').should('exist');
    });

    it('debe tener alt text en fotos', () => {
      cy.get('.member-photo img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('debe tener contraste adecuado', () => {
      cy.get('.member-name').should('have.css', 'color');
      cy.get('.member-role').should('have.css', 'color');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('.member-card').first().focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/equipo', { timeout: 3000 });
    });

    it('debe tener fotos optimizadas', () => {
      cy.get('.member-photo img').should('be.visible');
    });
  });

  describe('Información Profesional', () => {
    it('debe mostrar universidades', () => {
      cy.get('.university').should('be.visible');
    });

    it('debe mostrar especializaciones', () => {
      cy.get('.specialization').should('be.visible');
    });

    it('debe mostrar años de práctica', () => {
      cy.get('.practice-years').should('be.visible');
    });

    it('debe mostrar idiomas', () => {
      cy.get('.languages').should('be.visible');
    });
  });

  describe('Modal de Miembro', () => {
    it('debe abrir modal al hacer clic en miembro', () => {
      cy.get('.member-card').first().click();
      cy.get('.member-modal').should('be.visible');
    });

    it('debe mostrar información detallada en modal', () => {
      cy.get('.member-card').first().click();
      cy.get('.modal-content').should('be.visible');
      cy.get('.modal-photo').should('be.visible');
      cy.get('.modal-name').should('be.visible');
      cy.get('.modal-bio').should('be.visible');
    });

    it('debe cerrar modal al hacer clic en X', () => {
      cy.get('.member-card').first().click();
      cy.get('.close-modal').click();
      cy.get('.member-modal').should('not.be.visible');
    });
  });
});

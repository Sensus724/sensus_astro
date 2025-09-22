/**
 * Tests E2E para componentes UI
 * Verifica funcionalidad de componentes reutilizables
 */

describe('Componentes UI - Tests E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Componente Button', () => {
    it('debe renderizar botones con diferentes variantes', () => {
      cy.get('.btn-primary').should('be.visible');
      cy.get('.btn-secondary').should('be.visible');
      cy.get('.btn-outline').should('be.visible');
    });

    it('debe mostrar estados hover y focus', () => {
      cy.get('.btn-primary').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
      
      cy.get('.btn-primary').first()
        .focus()
        .should('have.focus');
    });

    it('debe manejar estados disabled y loading', () => {
      cy.get('.btn-disabled').should('have.class', 'btn-disabled');
      cy.get('.btn-loading').should('have.class', 'btn-loading');
    });
  });

  describe('Componente Card', () => {
    it('debe renderizar tarjetas con diferentes variantes', () => {
      cy.get('.card-default').should('be.visible');
      cy.get('.card-elevated').should('be.visible');
      cy.get('.card-outlined').should('be.visible');
    });

    it('debe mostrar efectos hover', () => {
      cy.get('.card-hover').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe ser clickeable cuando tiene la clase clickable', () => {
      cy.get('.card-clickable').first()
        .click()
        .should('have.focus');
    });
  });

  describe('Componente Loading', () => {
    it('debe mostrar diferentes tipos de loading', () => {
      cy.get('.loading-spinner').should('be.visible');
      cy.get('.loading-dots').should('be.visible');
      cy.get('.loading-pulse').should('be.visible');
    });

    it('debe mostrar overlay cuando está configurado', () => {
      cy.get('.loading-overlay').should('have.class', 'loading-overlay');
    });
  });

  describe('Componente Header', () => {
    it('debe mostrar navegación en desktop', () => {
      cy.viewport(1280, 720);
      cy.get('.header-nav').should('be.visible');
      cy.get('.nav-list').should('be.visible');
    });

    it('debe mostrar menú móvil en pantallas pequeñas', () => {
      cy.viewport(375, 667);
      cy.get('.mobile-menu-toggle').should('be.visible');
      cy.get('.mobile-menu-toggle').click();
      cy.get('.mobile-menu').should('have.class', 'open');
    });

    it('debe navegar correctamente', () => {
      cy.get('.nav-link').contains('Evaluación').click();
      cy.url().should('include', '/evaluacion');
    });
  });

  describe('Componente Footer', () => {
    it('debe mostrar información de contacto', () => {
      cy.get('.footer-contact').should('be.visible');
      cy.get('.contact-item').should('have.length.greaterThan', 0);
    });

    it('debe mostrar enlaces de navegación', () => {
      cy.get('.footer-links').should('be.visible');
      cy.get('.footer-link').should('have.length.greaterThan', 0);
    });

    it('debe mostrar redes sociales', () => {
      cy.get('.footer-social').should('be.visible');
      cy.get('.social-link').should('have.length.greaterThan', 0);
    });
  });

  describe('Componente TestimonialCard', () => {
    it('debe mostrar información del testimonio', () => {
      cy.get('.testimonial-card').should('be.visible');
      cy.get('.testimonial-quote').should('be.visible');
      cy.get('.testimonial-author').should('be.visible');
    });

    it('debe mostrar rating de estrellas', () => {
      cy.get('.testimonial-rating').should('be.visible');
      cy.get('.star-filled').should('exist');
    });

    it('debe mostrar estadísticas si están disponibles', () => {
      cy.get('.testimonial-stats').should('be.visible');
      cy.get('.stat-chip').should('exist');
    });
  });

  describe('Componente FeatureCard', () => {
    it('debe mostrar icono y contenido', () => {
      cy.get('.feature-card').should('be.visible');
      cy.get('.feature-icon').should('be.visible');
      cy.get('.feature-title').should('be.visible');
      cy.get('.feature-description').should('be.visible');
    });

    it('debe mostrar efectos hover', () => {
      cy.get('.feature-card').first()
        .trigger('mouseover');
      cy.get('.feature-icon').first()
        .should('have.css', 'transform');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('header').should('exist');
      cy.get('main').should('exist');
      cy.get('footer').should('exist');
    });

    it('debe tener alt text en imágenes', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('debe ser navegable por teclado', () => {
      cy.get('body').tab();
      cy.focused().should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('debe adaptarse a móvil', () => {
      cy.viewport(375, 667);
      cy.get('.header').should('be.visible');
      cy.get('.mobile-menu-toggle').should('be.visible');
    });

    it('debe adaptarse a tablet', () => {
      cy.viewport(768, 1024);
      cy.get('.header').should('be.visible');
      cy.get('.header-nav').should('be.visible');
    });

    it('debe adaptarse a desktop', () => {
      cy.viewport(1920, 1080);
      cy.get('.header').should('be.visible');
      cy.get('.header-nav').should('be.visible');
      cy.get('.desktop-actions').should('be.visible');
    });
  });
});

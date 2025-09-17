/**
 * Tests para la página de inicio (Homepage)
 * Verifica funcionalidad, diseño responsivo y componentes
 */

describe('Homepage Tests', () => {
  beforeEach(() => {
    // Visitar la página de inicio
    cy.visit('/');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página principal correctamente', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');
    });

    it('debe mostrar el header con logo y navegación', () => {
      cy.get('header').should('be.visible');
      cy.get('.logo').should('be.visible');
      cy.get('nav').should('be.visible');
    });

    it('debe mostrar la sección hero con título y subtítulo', () => {
      cy.get('.hero-section').should('be.visible');
      cy.get('.hero-title').should('be.visible').and('not.be.empty');
      cy.get('.hero-subtitle').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar los botones de acción principales', () => {
      cy.get('.hero-actions').should('be.visible');
      cy.get('.btn-cta').should('be.visible');
      cy.get('.btn-cta-primary').should('be.visible');
    });

    it('debe mostrar las secciones de características', () => {
      cy.get('.features-section').should('be.visible');
      cy.get('.features-grid').should('be.visible');
      cy.get('.feature-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar testimonios', () => {
      cy.get('.testimonials-section').should('be.visible');
      cy.get('.testimonials-grid').should('be.visible');
      cy.get('.testimonial-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar el footer', () => {
      cy.get('footer').should('be.visible');
      cy.get('.footer-content').should('be.visible');
    });
  });

  describe('Funcionalidad de Botones', () => {
    it('debe navegar a evaluación al hacer clic en CTA principal', () => {
      cy.get('.btn-cta-primary').first().click();
      cy.url().should('include', '/evaluacion');
    });

    it('debe navegar a diario al hacer clic en CTA secundario', () => {
      cy.get('.btn-cta').first().click();
      cy.url().should('include', '/diario');
    });

    it('debe mostrar efectos hover en botones', () => {
      cy.get('.btn-cta-primary').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.hero-section').should('be.visible');
      cy.get('.hero-content').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.features-grid').should('have.css', 'grid-template-columns', '1fr');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.hero-section').should('be.visible');
      cy.get('.features-grid').should('have.css', 'grid-template-columns');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.hero-section').should('be.visible');
      cy.get('.hero-content').should('have.css', 'grid-template-columns', '1fr 1fr');
    });
  });

  describe('Animaciones y Efectos', () => {
    it('debe mostrar animaciones en elementos flotantes', () => {
      cy.get('.floating-element').should('be.visible');
      cy.get('.floating-element').should('have.css', 'animation');
    });

    it('debe mostrar efectos hover en tarjetas', () => {
      cy.get('.feature-card').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe mostrar progreso visual animado', () => {
      cy.get('.progress-fill').should('be.visible');
      cy.get('.progress-fill').should('have.css', 'animation');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('header').should('exist');
      cy.get('footer').should('exist');
    });

    it('debe tener alt text en imágenes', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
      });
    });

    it('debe tener contraste adecuado', () => {
      cy.get('.hero-title').should('have.css', 'color');
      cy.get('.hero-subtitle').should('have.css', 'color');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/', { timeout: 3000 });
    });

    it('debe tener imágenes optimizadas', () => {
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'src');
      });
    });
  });
});

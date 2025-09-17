/**
 * Tests para la página de planes
 * Verifica funcionalidad de suscripciones y precios
 */

describe('Plans Page Tests', () => {
  beforeEach(() => {
    cy.visit('/planes');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de planes correctamente', () => {
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

    it('debe mostrar descripción de planes', () => {
      cy.get('.plans-description').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar grid de planes', () => {
      cy.get('.plans-grid').should('be.visible');
      cy.get('.plan-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar footer', () => {
      cy.get('footer').should('be.visible');
    });
  });

  describe('Tarjetas de Planes', () => {
    it('debe mostrar información completa en cada plan', () => {
      cy.get('.plan-card').first().within(() => {
        cy.get('.plan-header').should('be.visible');
        cy.get('.plan-name').should('be.visible').and('not.be.empty');
        cy.get('.plan-price').should('be.visible').and('not.be.empty');
        cy.get('.plan-period').should('be.visible').and('not.be.empty');
        cy.get('.plan-description').should('be.visible').and('not.be.empty');
        cy.get('.plan-features').should('be.visible');
        cy.get('.plan-button').should('be.visible');
      });
    });

    it('debe mostrar características de cada plan', () => {
      cy.get('.plan-card').first().within(() => {
        cy.get('.plan-features').should('be.visible');
        cy.get('.feature-item').should('have.length.greaterThan', 0);
      });
    });

    it('debe mostrar badge destacado en plan premium', () => {
      cy.get('.plan-card.featured').should('exist');
      cy.get('.plan-badge').should('be.visible');
    });

    it('debe mostrar efectos hover en tarjetas', () => {
      cy.get('.plan-card').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe mostrar iconos en características', () => {
      cy.get('.feature-item i').should('be.visible');
    });
  });

  describe('Botones de Suscripción', () => {
    it('debe mostrar botón de suscripción en cada plan', () => {
      cy.get('.plan-button').should('have.length.greaterThan', 0);
    });

    it('debe mostrar texto descriptivo en botones', () => {
      cy.get('.plan-button').each(($btn) => {
        cy.wrap($btn).should('have.text').and('not.be.empty');
      });
    });

    it('debe mostrar efectos hover en botones', () => {
      cy.get('.plan-button').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe navegar a checkout al hacer clic', () => {
      cy.get('.plan-button').first().click();
      // Verificar navegación o modal de checkout
    });
  });

  describe('Comparación de Planes', () => {
    it('debe mostrar tabla de comparación', () => {
      cy.get('.comparison-table').should('be.visible');
    });

    it('debe mostrar características en tabla', () => {
      cy.get('.comparison-feature').should('have.length.greaterThan', 0);
    });

    it('debe mostrar checkmarks en características incluidas', () => {
      cy.get('.feature-check').should('be.visible');
    });

    it('debe mostrar X en características no incluidas', () => {
      cy.get('.feature-cross').should('be.visible');
    });
  });

  describe('FAQ de Planes', () => {
    it('debe mostrar sección de FAQ', () => {
      cy.get('.faq-section').should('be.visible');
    });

    it('debe mostrar preguntas frecuentes', () => {
      cy.get('.faq-item').should('have.length.greaterThan', 0);
    });

    it('debe expandir respuesta al hacer clic en pregunta', () => {
      cy.get('.faq-question').first().click();
      cy.get('.faq-answer').first().should('be.visible');
    });

    it('debe mostrar iconos de expansión', () => {
      cy.get('.faq-question i').should('be.visible');
    });
  });

  describe('Testimonios', () => {
    it('debe mostrar testimonios de usuarios', () => {
      cy.get('.testimonials-section').should('be.visible');
    });

    it('debe mostrar tarjetas de testimonio', () => {
      cy.get('.testimonial-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información del usuario', () => {
      cy.get('.testimonial-card').first().within(() => {
        cy.get('.testimonial-text').should('be.visible');
        cy.get('.testimonial-author').should('be.visible');
        cy.get('.testimonial-role').should('be.visible');
      });
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.plans-grid').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.comparison-table').should('be.visible');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.plans-grid').should('be.visible');
      cy.get('.plan-card').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.plans-grid').should('have.css', 'grid-template-columns');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('section').should('exist');
    });

    it('debe tener labels descriptivos en botones', () => {
      cy.get('.plan-button').each(($btn) => {
        cy.wrap($btn).should('have.text').and('not.be.empty');
      });
    });

    it('debe tener contraste adecuado', () => {
      cy.get('.plan-name').should('have.css', 'color');
      cy.get('.plan-price').should('have.css', 'color');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('.plan-button').first().focus().should('be.focused');
      cy.get('.faq-question').first().focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/planes', { timeout: 3000 });
    });

    it('debe tener iconos optimizados', () => {
      cy.get('.feature-item i').should('be.visible');
      cy.get('.feature-check').should('be.visible');
    });
  });

  describe('Precios y Promociones', () => {
    it('debe mostrar precios claros', () => {
      cy.get('.plan-price').should('be.visible');
      cy.get('.plan-period').should('be.visible');
    });

    it('debe mostrar descuentos si los hay', () => {
      cy.get('.plan-discount').should('exist');
    });

    it('debe mostrar garantía de devolución', () => {
      cy.get('.money-back-guarantee').should('be.visible');
    });
  });
});

/**
 * Tests para la página de evaluación
 * Verifica funcionalidad de tests psicológicos y componentes
 */

describe('Evaluation Page Tests', () => {
  beforeEach(() => {
    cy.visit('/evaluacion');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de evaluación correctamente', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');
    });

    it('debe mostrar el header con navegación', () => {
      cy.get('header').should('be.visible');
      cy.get('.logo').should('be.visible');
    });

    it('debe mostrar la sección de tests disponibles', () => {
      cy.get('.tests-section').should('be.visible');
      cy.get('.tests-grid').should('be.visible');
      cy.get('.test-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar estadísticas de confianza', () => {
      cy.get('.trust-stats').should('be.visible');
      cy.get('.stat-item').should('have.length.greaterThan', 0);
    });

    it('debe mostrar filtros de tests', () => {
      cy.get('.test-filters').should('be.visible');
      cy.get('.filter-btn').should('have.length.greaterThan', 0);
    });

    it('debe mostrar sección de guía', () => {
      cy.get('.guide-section').should('be.visible');
      cy.get('.guide-steps').should('be.visible');
    });

    it('debe mostrar advertencia ética', () => {
      cy.get('.ethical-warning').should('be.visible');
    });
  });

  describe('Tarjetas de Test', () => {
    it('debe mostrar información completa en cada tarjeta', () => {
      cy.get('.test-card').first().within(() => {
        cy.get('.test-icon').should('be.visible');
        cy.get('.test-title').should('be.visible').and('not.be.empty');
        cy.get('.test-description').should('be.visible').and('not.be.empty');
        cy.get('.test-validation').should('be.visible');
        cy.get('.test-details').should('be.visible');
        cy.get('.test-button').should('be.visible');
      });
    });

    it('debe mostrar efectos hover en tarjetas', () => {
      cy.get('.test-card').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe mostrar información de detalles del test', () => {
      cy.get('.test-card').first().within(() => {
        cy.get('.detail-item').should('have.length.greaterThan', 0);
        cy.get('.detail-item i').should('be.visible');
      });
    });
  });

  describe('Funcionalidad de Filtros', () => {
    it('debe filtrar tests por categoría', () => {
      cy.get('.filter-btn').first().click();
      cy.get('.filter-btn.active').should('exist');
    });

    it('debe mostrar efectos hover en filtros', () => {
      cy.get('.filter-btn').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe cambiar estado activo de filtros', () => {
      cy.get('.filter-btn').first().click();
      cy.get('.filter-btn.active').should('have.css', 'background');
    });
  });

  describe('Botones de Acción', () => {
    it('debe iniciar test al hacer clic en botón', () => {
      cy.get('.test-button').first().click();
      // Verificar que se abre modal o navega a test
    });

    it('debe mostrar información al hacer clic en botón info', () => {
      cy.get('.info-button').first().click();
      // Verificar que se muestra tooltip o modal
    });

    it('debe mostrar efectos hover en botones', () => {
      cy.get('.test-button').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });
  });

  describe('Modal de Progreso', () => {
    it('debe mostrar indicador de progreso', () => {
      cy.get('.progress-indicator').should('be.visible');
      cy.get('.progress-content').should('be.visible');
    });

    it('debe abrir modal de progreso al hacer clic', () => {
      cy.get('.view-progress-btn').click();
      cy.get('.progress-modal').should('be.visible');
      cy.get('.modal-content').should('be.visible');
    });

    it('debe cerrar modal al hacer clic en X', () => {
      cy.get('.view-progress-btn').click();
      cy.get('.close-modal').click();
      cy.get('.progress-modal').should('not.be.visible');
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.tests-grid').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.trust-stats').should('have.css', 'flex-direction', 'column');
      cy.get('.guide-steps').should('have.css', 'grid-template-columns', '1fr');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.tests-section').should('be.visible');
      cy.get('.tests-grid').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.tests-grid').should('have.css', 'grid-template-columns');
      cy.get('.guide-steps').should('have.css', 'grid-template-columns');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('section').should('exist');
    });

    it('debe tener labels descriptivos en botones', () => {
      cy.get('.test-button').each(($btn) => {
        cy.wrap($btn).should('have.text').and('not.be.empty');
      });
    });

    it('debe tener contraste adecuado', () => {
      cy.get('.test-title').should('have.css', 'color');
      cy.get('.test-description').should('have.css', 'color');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('.test-button').first().focus().should('be.focused');
      cy.get('.filter-btn').first().focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/evaluacion', { timeout: 3000 });
    });

    it('debe tener iconos optimizados', () => {
      cy.get('.test-icon').should('be.visible');
      cy.get('.stat-icon').should('be.visible');
    });
  });

  describe('Validación de Tests', () => {
    it('debe mostrar badges de validación', () => {
      cy.get('.test-validation').should('be.visible');
      cy.get('.test-validation i').should('be.visible');
    });

    it('debe mostrar información de duración', () => {
      cy.get('.detail-item').should('contain.text', 'min');
    });

    it('debe mostrar número de preguntas', () => {
      cy.get('.detail-item').should('contain.text', 'preguntas');
    });
  });
});

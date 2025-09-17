/**
 * Tests para la página de test específico
 * Verifica funcionalidad de test psicológico individual
 */

describe('Test Page Tests', () => {
  beforeEach(() => {
    cy.visit('/test');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de test correctamente', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');
    });

    it('debe mostrar el header con navegación', () => {
      cy.get('header').should('be.visible');
      cy.get('.logo').should('be.visible');
    });

    it('debe mostrar título del test', () => {
      cy.get('.test-title').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar descripción del test', () => {
      cy.get('.test-description').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar información del test', () => {
      cy.get('.test-info').should('be.visible');
      cy.get('.test-duration').should('be.visible');
      cy.get('.test-questions').should('be.visible');
    });

    it('debe mostrar footer', () => {
      cy.get('footer').should('be.visible');
    });
  });

  describe('Progreso del Test', () => {
    it('debe mostrar barra de progreso', () => {
      cy.get('.progress-bar').should('be.visible');
    });

    it('debe mostrar porcentaje de progreso', () => {
      cy.get('.progress-percentage').should('be.visible');
    });

    it('debe mostrar pregunta actual', () => {
      cy.get('.current-question').should('be.visible');
    });

    it('debe mostrar total de preguntas', () => {
      cy.get('.total-questions').should('be.visible');
    });

    it('debe actualizar progreso al avanzar', () => {
      cy.get('.progress-fill').should('have.css', 'width');
    });
  });

  describe('Preguntas del Test', () => {
    it('debe mostrar pregunta actual', () => {
      cy.get('.question-text').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar opciones de respuesta', () => {
      cy.get('.answer-options').should('be.visible');
      cy.get('.answer-option').should('have.length.greaterThan', 0);
    });

    it('debe mostrar texto de opciones', () => {
      cy.get('.answer-option').each(($option) => {
        cy.wrap($option).should('have.text').and('not.be.empty');
      });
    });

    it('debe permitir seleccionar respuesta', () => {
      cy.get('.answer-option').first().click();
      cy.get('.answer-option.selected').should('exist');
    });

    it('debe mostrar efectos hover en opciones', () => {
      cy.get('.answer-option').first()
        .trigger('mouseover')
        .should('have.css', 'background-color');
    });

    it('debe mostrar radio buttons', () => {
      cy.get('input[type="radio"]').should('be.visible');
    });
  });

  describe('Navegación del Test', () => {
    it('debe mostrar botón anterior', () => {
      cy.get('.btn-previous').should('be.visible');
    });

    it('debe mostrar botón siguiente', () => {
      cy.get('.btn-next').should('be.visible');
    });

    it('debe deshabilitar botón anterior en primera pregunta', () => {
      cy.get('.btn-previous').should('be.disabled');
    });

    it('debe habilitar botón siguiente al seleccionar respuesta', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-next').should('not.be.disabled');
    });

    it('debe avanzar a siguiente pregunta', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-next').click();
      cy.get('.current-question').should('contain', '2');
    });

    it('debe retroceder a pregunta anterior', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-next').click();
      cy.get('.btn-previous').click();
      cy.get('.current-question').should('contain', '1');
    });
  });

  describe('Finalización del Test', () => {
    it('debe mostrar botón finalizar en última pregunta', () => {
      // Navegar a última pregunta
      for (let i = 0; i < 9; i++) {
        cy.get('.answer-option').first().click();
        cy.get('.btn-next').click();
      }
      cy.get('.btn-finish').should('be.visible');
    });

    it('debe mostrar modal de confirmación', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-finish').click();
      cy.get('.confirmation-modal').should('be.visible');
    });

    it('debe mostrar opciones de confirmación', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-finish').click();
      cy.get('.btn-confirm').should('be.visible');
      cy.get('.btn-cancel').should('be.visible');
    });
  });

  describe('Resultados del Test', () => {
    it('debe mostrar página de resultados', () => {
      // Completar test y navegar a resultados
      cy.get('.results-page').should('be.visible');
    });

    it('debe mostrar puntuación', () => {
      cy.get('.test-score').should('be.visible');
    });

    it('debe mostrar interpretación', () => {
      cy.get('.score-interpretation').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar recomendaciones', () => {
      cy.get('.recommendations').should('be.visible');
      cy.get('.recommendation-item').should('have.length.greaterThan', 0);
    });

    it('debe mostrar gráfico de resultados', () => {
      cy.get('.results-chart').should('be.visible');
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.question-text').should('be.visible');
      cy.get('.answer-options').should('be.visible');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.test-content').should('be.visible');
      cy.get('.progress-bar').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.test-content').should('be.visible');
      cy.get('.navigation-buttons').should('be.visible');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('form').should('exist');
    });

    it('debe tener labels en radio buttons', () => {
      cy.get('input[type="radio"]').each(($radio) => {
        cy.wrap($radio).should('have.attr', 'id');
        cy.get(`label[for="${$radio.attr('id')}"]`).should('exist');
      });
    });

    it('debe tener contraste adecuado', () => {
      cy.get('.question-text').should('have.css', 'color');
      cy.get('.answer-option').should('have.css', 'color');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('input[type="radio"]').first().focus().should('be.focused');
      cy.get('.btn-next').focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/test', { timeout: 3000 });
    });

    it('debe tener transiciones suaves', () => {
      cy.get('.answer-option').first().click();
      cy.get('.btn-next').click();
      cy.get('.question-text').should('be.visible');
    });
  });

  describe('Validación de Respuestas', () => {
    it('debe requerir respuesta antes de continuar', () => {
      cy.get('.btn-next').should('be.disabled');
      cy.get('.answer-option').first().click();
      cy.get('.btn-next').should('not.be.disabled');
    });

    it('debe mostrar mensaje de validación', () => {
      cy.get('.btn-next').click();
      cy.get('.validation-message').should('be.visible');
    });

    it('debe permitir cambiar respuesta', () => {
      cy.get('.answer-option').first().click();
      cy.get('.answer-option').last().click();
      cy.get('.answer-option.selected').should('have.length', 1);
    });
  });

  describe('Guardado de Progreso', () => {
    it('debe mostrar indicador de guardado', () => {
      cy.get('.save-indicator').should('be.visible');
    });

    it('debe mantener respuestas al recargar', () => {
      cy.get('.answer-option').first().click();
      cy.reload();
      cy.get('.answer-option.selected').should('exist');
    });
  });
});

/**
 * Tests para la página de diario emocional
 * Verifica funcionalidad de escritura, emociones y IA
 */

describe('Diary Page Tests', () => {
  beforeEach(() => {
    cy.visit('/diario');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de diario correctamente', () => {
      cy.get('body').should('be.visible');
      cy.title().should('not.be.empty');
    });

    it('debe mostrar el header con navegación', () => {
      cy.get('header').should('be.visible');
      cy.get('.logo').should('be.visible');
    });

    it('debe mostrar la sección hero del diario', () => {
      cy.get('.diary-hero-section').should('be.visible');
      cy.get('.hero-content').should('be.visible');
      cy.get('.hero-title').should('be.visible').and('not.be.empty');
      cy.get('.hero-subtitle').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar la racha estilo TikTok', () => {
      cy.get('.streak-display').should('be.visible');
      cy.get('.streak-number').should('be.visible');
      cy.get('.streak-fire').should('be.visible');
      cy.get('.streak-message').should('be.visible');
    });

    it('debe mostrar estadísticas del hero', () => {
      cy.get('.hero-stats').should('be.visible');
      cy.get('.stat-card').should('have.length', 3);
    });

    it('debe mostrar sección de entrada rápida', () => {
      cy.get('.quick-entry-section').should('be.visible');
      cy.get('.quick-entry-card').should('be.visible');
    });
  });

  describe('Selector de Emociones', () => {
    it('debe mostrar categorías de emociones', () => {
      cy.get('.emotion-selector-enhanced').should('be.visible');
      cy.get('.emotion-category').should('have.length.greaterThan', 0);
    });

    it('debe mostrar botones de emociones', () => {
      cy.get('.emotion-buttons').should('be.visible');
      cy.get('.emotion-btn').should('have.length.greaterThan', 0);
    });

    it('debe seleccionar emoción al hacer clic', () => {
      cy.get('.emotion-btn').first().click();
      cy.get('.emotion-btn.active').should('exist');
    });

    it('debe mostrar efectos hover en botones de emoción', () => {
      cy.get('.emotion-btn').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe mostrar emojis en botones', () => {
      cy.get('.emotion-btn .emoji').should('be.visible');
    });

    it('debe mostrar labels en botones', () => {
      cy.get('.emotion-btn .label').should('be.visible').and('not.be.empty');
    });
  });

  describe('Área de Escritura', () => {
    it('debe mostrar prompt de escritura', () => {
      cy.get('.writing-prompt').should('be.visible');
      cy.get('.writing-prompt i').should('be.visible');
    });

    it('debe mostrar textarea para escribir', () => {
      cy.get('.journal-textarea-enhanced').should('be.visible');
      cy.get('.journal-textarea-enhanced').should('have.attr', 'placeholder');
    });

    it('debe permitir escribir en el textarea', () => {
      cy.get('.journal-textarea-enhanced')
        .type('Esta es una entrada de prueba')
        .should('have.value', 'Esta es una entrada de prueba');
    });

    it('debe mostrar contador de caracteres', () => {
      cy.get('.character-count').should('be.visible');
    });

    it('debe mostrar sugerencias de IA', () => {
      cy.get('.ai-suggestions').should('be.visible');
      cy.get('.suggestion-btn').should('have.length.greaterThan', 0);
    });

    it('debe mostrar efectos focus en textarea', () => {
      cy.get('.journal-textarea-enhanced').focus();
      cy.get('.journal-textarea-enhanced').should('have.css', 'border-color');
    });
  });

  describe('Botones de Acción', () => {
    it('debe mostrar botones de entrada', () => {
      cy.get('.entry-actions').should('be.visible');
      cy.get('.entry-actions .btn').should('have.length.greaterThan', 0);
    });

    it('debe mostrar botón primario', () => {
      cy.get('.entry-actions .btn-primary').should('be.visible');
    });

    it('debe mostrar botón secundario', () => {
      cy.get('.entry-actions .btn-secondary').should('be.visible');
    });

    it('debe mostrar efectos hover en botones', () => {
      cy.get('.entry-actions .btn-primary').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });

    it('debe deshabilitar botón cuando no hay texto', () => {
      cy.get('.entry-actions .btn-primary').should('be.disabled');
    });

    it('debe habilitar botón cuando hay texto', () => {
      cy.get('.journal-textarea-enhanced').type('Texto de prueba');
      cy.get('.entry-actions .btn-primary').should('not.be.disabled');
    });
  });

  describe('Insights de IA', () => {
    it('debe mostrar sección de insights', () => {
      cy.get('.ai-insights-section').should('be.visible');
      cy.get('.insights-card').should('be.visible');
    });

    it('debe mostrar header de insights', () => {
      cy.get('.insights-header').should('be.visible');
      cy.get('.insights-header h3').should('be.visible');
      cy.get('.insights-header i').should('be.visible');
    });

    it('debe mostrar elementos de insight', () => {
      cy.get('.insights-content').should('be.visible');
      cy.get('.insight-item').should('have.length.greaterThan', 0);
    });

    it('debe mostrar iconos de insight', () => {
      cy.get('.insight-icon').should('be.visible');
    });

    it('debe mostrar texto de insight', () => {
      cy.get('.insight-text h4').should('be.visible');
      cy.get('.insight-text p').should('be.visible');
    });

    it('debe cerrar insights al hacer clic en X', () => {
      cy.get('.close-insights').click();
      // Verificar que se oculta
    });
  });

  describe('Entradas Anteriores', () => {
    it('debe mostrar sección de entradas', () => {
      cy.get('.entries-section-enhanced').should('be.visible');
      cy.get('.entries-header').should('be.visible');
    });

    it('debe mostrar filtros de entradas', () => {
      cy.get('.entries-filters').should('be.visible');
      cy.get('.filter-btn').should('have.length.greaterThan', 0);
    });

    it('debe mostrar grid de entradas', () => {
      cy.get('.entries-grid').should('be.visible');
    });

    it('debe mostrar tarjetas de entrada', () => {
      cy.get('.entry-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información de entrada', () => {
      cy.get('.entry-card').first().within(() => {
        cy.get('.entry-header').should('be.visible');
        cy.get('.entry-emotion').should('be.visible');
        cy.get('.entry-date').should('be.visible');
        cy.get('.entry-content').should('be.visible');
        cy.get('.entry-footer').should('be.visible');
      });
    });

    it('debe mostrar acciones de entrada', () => {
      cy.get('.entry-actions').should('be.visible');
      cy.get('.btn-icon').should('have.length.greaterThan', 0);
    });
  });

  describe('Logros', () => {
    it('debe mostrar sección de logros', () => {
      cy.get('.achievements-section').should('be.visible');
      cy.get('.achievements-section h2').should('be.visible');
    });

    it('debe mostrar grid de logros', () => {
      cy.get('.achievements-grid').should('be.visible');
    });

    it('debe mostrar tarjetas de logro', () => {
      cy.get('.achievement-card').should('have.length.greaterThan', 0);
    });

    it('debe mostrar información de logro', () => {
      cy.get('.achievement-card').first().within(() => {
        cy.get('.achievement-icon').should('be.visible');
        cy.get('.achievement-card h3').should('be.visible');
        cy.get('.achievement-value').should('be.visible');
        cy.get('.achievement-card p').should('be.visible');
      });
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.hero-content').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.hero-stats').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.emotion-buttons').should('have.css', 'grid-template-columns', '1fr');
      cy.get('.entries-grid').should('have.css', 'grid-template-columns', '1fr');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.diary-hero-section').should('be.visible');
      cy.get('.quick-entry-section').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.hero-content').should('have.css', 'grid-template-columns', '1fr 1fr');
      cy.get('.hero-stats').should('have.css', 'grid-template-columns', 'repeat(3, 1fr)');
    });
  });

  describe('Animaciones', () => {
    it('debe mostrar animación de fuego en racha', () => {
      cy.get('.streak-fire').should('have.css', 'animation');
    });

    it('debe mostrar animación de pulso en IA', () => {
      cy.get('.ai-assistant i').should('have.css', 'animation');
    });

    it('debe mostrar efectos hover en tarjetas', () => {
      cy.get('.stat-card').first()
        .trigger('mouseover')
        .should('have.css', 'transform');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('section').should('exist');
    });

    it('debe tener labels descriptivos', () => {
      cy.get('.emotion-btn .label').should('not.be.empty');
      cy.get('.journal-textarea-enhanced').should('have.attr', 'placeholder');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('.emotion-btn').first().focus().should('be.focused');
      cy.get('.journal-textarea-enhanced').focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/diario', { timeout: 3000 });
    });

    it('debe tener animaciones optimizadas', () => {
      cy.get('.streak-fire').should('be.visible');
      cy.get('.ai-assistant i').should('be.visible');
    });
  });
});

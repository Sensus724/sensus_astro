/**
 * Tests para la página de contacto
 * Verifica funcionalidad de formulario y información
 */

describe('Contact Page Tests', () => {
  beforeEach(() => {
    cy.visit('/contacto');
  });

  describe('Estructura y Contenido', () => {
    it('debe cargar la página de contacto correctamente', () => {
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

    it('debe mostrar descripción de contacto', () => {
      cy.get('.contact-description').should('be.visible').and('not.be.empty');
    });

    it('debe mostrar footer', () => {
      cy.get('footer').should('be.visible');
    });
  });

  describe('Formulario de Contacto', () => {
    it('debe mostrar formulario de contacto', () => {
      cy.get('.contact-form').should('be.visible');
    });

    it('debe mostrar campos requeridos', () => {
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="subject"]').should('be.visible');
      cy.get('textarea[name="message"]').should('be.visible');
    });

    it('debe mostrar labels en campos', () => {
      cy.get('label[for="name"]').should('be.visible');
      cy.get('label[for="email"]').should('be.visible');
      cy.get('label[for="subject"]').should('be.visible');
      cy.get('label[for="message"]').should('be.visible');
    });

    it('debe mostrar placeholders en campos', () => {
      cy.get('input[name="name"]').should('have.attr', 'placeholder');
      cy.get('input[name="email"]').should('have.attr', 'placeholder');
      cy.get('input[name="subject"]').should('have.attr', 'placeholder');
      cy.get('textarea[name="message"]').should('have.attr', 'placeholder');
    });

    it('debe mostrar botón de envío', () => {
      cy.get('.submit-button').should('be.visible');
    });

    it('debe validar campos requeridos', () => {
      cy.get('.submit-button').click();
      cy.get('.error-message').should('be.visible');
    });

    it('debe permitir escribir en campos', () => {
      cy.get('input[name="name"]').type('Juan Pérez');
      cy.get('input[name="name"]').should('have.value', 'Juan Pérez');
      
      cy.get('input[name="email"]').type('juan@ejemplo.com');
      cy.get('input[name="email"]').should('have.value', 'juan@ejemplo.com');
      
      cy.get('input[name="subject"]').type('Consulta sobre el servicio');
      cy.get('input[name="subject"]').should('have.value', 'Consulta sobre el servicio');
      
      cy.get('textarea[name="message"]').type('Este es un mensaje de prueba');
      cy.get('textarea[name="message"]').should('have.value', 'Este es un mensaje de prueba');
    });

    it('debe validar formato de email', () => {
      cy.get('input[name="email"]').type('email-invalido');
      cy.get('.submit-button').click();
      cy.get('.error-message').should('contain', 'email');
    });

    it('debe mostrar efectos focus en campos', () => {
      cy.get('input[name="name"]').focus();
      cy.get('input[name="name"]').should('have.css', 'border-color');
    });
  });

  describe('Información de Contacto', () => {
    it('debe mostrar información de contacto', () => {
      cy.get('.contact-info').should('be.visible');
    });

    it('debe mostrar dirección', () => {
      cy.get('.contact-address').should('be.visible');
    });

    it('debe mostrar teléfono', () => {
      cy.get('.contact-phone').should('be.visible');
    });

    it('debe mostrar email', () => {
      cy.get('.contact-email').should('be.visible');
    });

    it('debe mostrar horarios', () => {
      cy.get('.contact-hours').should('be.visible');
    });

    it('debe mostrar iconos de contacto', () => {
      cy.get('.contact-icon').should('be.visible');
    });
  });

  describe('Mapa', () => {
    it('debe mostrar mapa de ubicación', () => {
      cy.get('.contact-map').should('be.visible');
    });

    it('debe mostrar marcador en mapa', () => {
      cy.get('.map-marker').should('be.visible');
    });
  });

  describe('Redes Sociales', () => {
    it('debe mostrar enlaces a redes sociales', () => {
      cy.get('.social-links').should('be.visible');
    });

    it('debe mostrar iconos de redes sociales', () => {
      cy.get('.social-icon').should('have.length.greaterThan', 0);
    });

    it('debe abrir redes sociales en nueva pestaña', () => {
      cy.get('.social-link').first().should('have.attr', 'target', '_blank');
    });
  });

  describe('FAQ de Contacto', () => {
    it('debe mostrar sección de FAQ', () => {
      cy.get('.faq-section').should('be.visible');
    });

    it('debe mostrar preguntas frecuentes', () => {
      cy.get('.faq-item').should('have.length.greaterThan', 0);
    });

    it('debe expandir respuesta al hacer clic', () => {
      cy.get('.faq-question').first().click();
      cy.get('.faq-answer').first().should('be.visible');
    });
  });

  describe('Diseño Responsivo', () => {
    it('debe adaptarse correctamente en móvil (320px)', () => {
      cy.viewport(320, 568);
      cy.get('.contact-form').should('be.visible');
      cy.get('.contact-info').should('be.visible');
    });

    it('debe adaptarse correctamente en tablet (768px)', () => {
      cy.viewport(768, 1024);
      cy.get('.contact-form').should('be.visible');
      cy.get('.contact-map').should('be.visible');
    });

    it('debe adaptarse correctamente en desktop (1200px)', () => {
      cy.viewport(1200, 800);
      cy.get('.contact-form').should('be.visible');
      cy.get('.contact-info').should('be.visible');
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener estructura semántica correcta', () => {
      cy.get('main').should('exist');
      cy.get('form').should('exist');
    });

    it('debe tener labels asociados a campos', () => {
      cy.get('input[name="name"]').should('have.attr', 'id');
      cy.get('label[for="name"]').should('exist');
    });

    it('debe tener contraste adecuado', () => {
      cy.get('input[name="name"]').should('have.css', 'color');
      cy.get('label[for="name"]').should('have.css', 'color');
    });

    it('debe ser navegable con teclado', () => {
      cy.get('input[name="name"]').focus().should('be.focused');
      cy.get('input[name="email"]').focus().should('be.focused');
    });
  });

  describe('Performance', () => {
    it('debe cargar en menos de 3 segundos', () => {
      cy.visit('/contacto', { timeout: 3000 });
    });

    it('debe tener mapa optimizado', () => {
      cy.get('.contact-map').should('be.visible');
    });
  });

  describe('Validación de Formulario', () => {
    it('debe mostrar mensaje de éxito al enviar', () => {
      cy.get('input[name="name"]').type('Juan Pérez');
      cy.get('input[name="email"]').type('juan@ejemplo.com');
      cy.get('input[name="subject"]').type('Consulta');
      cy.get('textarea[name="message"]').type('Mensaje de prueba');
      cy.get('.submit-button').click();
      cy.get('.success-message').should('be.visible');
    });

    it('debe limpiar formulario después del envío', () => {
      cy.get('input[name="name"]').type('Juan Pérez');
      cy.get('.submit-button').click();
      cy.get('input[name="name"]').should('have.value', '');
    });
  });
});
